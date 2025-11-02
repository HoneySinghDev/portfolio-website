'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import { Icon } from '@iconify/react';
import { withErrorBoundary } from '@/lib/error-boundary';
import { logger, trackError, trackPerformance } from '@/lib/logger';
import { validateProjectData, validateSkillData } from '@/lib/validation';
import { useSectionNavigation } from '@/lib/hooks/useScroll';
import { useOptimizedEventHandler } from '@/lib/hooks/useOptimized';
import { cn } from '@/lib/utils';
import { siteConfig } from '@/lib/config';
import dynamic from 'next/dynamic';
import AnimatedGridBackground from './components/animated-grid-background';
import Footer from './components/footer';
import SectionWrapper from '@/components/section-wrapper';
import SectionTitle from '@/components/section-title';
import SectionDescription from '@/components/section-description';
import type { GitHubRepository } from '@/lib/github/types';

// Lazy load heavy components for better code-splitting
const SkillsSection = dynamic(() => import('./components/skills-section'), {
  loading: () => (
    <div className='py-20 text-center text-gray-400'>Loading skills...</div>
  ),
  ssr: true,
});

const GithubSection = dynamic(() => import('./components/github-section'), {
  loading: () => (
    <div className='py-20 text-center text-gray-400'>
      Loading GitHub activity...
    </div>
  ),
  ssr: true,
});

// Constants
const NAVIGATION_SECTIONS = ['home', 'about', 'skills', 'github'] as const;
const MAX_TAGS_DISPLAY = siteConfig.ui.maxTagsDisplay;
const IMAGE_PLACEHOLDER = siteConfig.ui.imagePlaceholder;
const GITHUB_PROFILE_URL = siteConfig.personal.githubUrl;
const VALIDATION_ONCE_FLAG = Symbol('validation-run');

// Types
interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    image?: string;
    icon?: string; // Iconify icon ID/name (e.g., "lucide:github", "mdi:react") or image URL (e.g., "/icon.svg")
    tags: string[];
    githubUrl: string;
    color?: string;
  };
  index: number;
}

interface NavigationItemProps {
  section: string;
  activeSection: string;
  onClick: (section: string) => void;
}

interface CoreValue {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Skill {
  name: string;
  icon: string; // Icon name for iconify
  color: string;
  value: number;
}

const NavigationItem = memo(
  ({ section, activeSection, onClick }: NavigationItemProps) => {
    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        try {
          onClick(section);
          logger.debug('Navigation clicked', { section });
        } catch (error) {
          trackError(
            error instanceof Error ? error : new Error(String(error)),
            {
              action: 'navigation_click',
              section,
            }
          );
        }
      },
      [section, onClick]
    );

    return (
      <a
        href={`#${section}`}
        onClick={handleClick}
        className={cn(
          'transition-all duration-300 capitalize text-xs sm:text-sm px-2 py-1 rounded hover:bg-black/50',
          activeSection === section ? 'neon-text' : 'text-gray-400'
        )}
        aria-current={activeSection === section ? 'page' : undefined}
      >
        {section}
      </a>
    );
  }
);

NavigationItem.displayName = 'NavigationItem';

/**
 * Helper function to detect if an icon string is an Iconify icon ID or an image URL
 * Iconify icons typically follow patterns like "lucide:github", "mdi:react", etc.
 * Image URLs typically start with "/", "http://", "https://", or "data:"
 */
const isIconifyIcon = (icon: string): boolean => {
  // If it starts with /, http, https, or data:, it's an image URL
  if (
    icon.startsWith('/') ||
    icon.startsWith('http://') ||
    icon.startsWith('https://') ||
    icon.startsWith('data:')
  ) {
    return false;
  }
  // If it contains a colon (like "lucide:github"), it's likely an Iconify icon
  // Also accept simple icon names without colons (like "react" or "github")
  return true;
};

const ProjectCard = memo(({ project, index }: ProjectCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [iconImageLoaded, setIconImageLoaded] = useState(false);
  const [iconImageError, setIconImageError] = useState(false);

  // If custom image is provided, use it; otherwise use default image
  const hasCustomImage = !!project?.image;
  const imageSrc = project?.image || IMAGE_PLACEHOLDER;
  const isPlaceholder = imageSrc === IMAGE_PLACEHOLDER;
  const hasIcon = !!project?.icon && !hasCustomImage; // Only show icon if no custom image and icon is provided
  const isIconifyIconId =
    hasIcon && project.icon && isIconifyIcon(project.icon);
  const isIconImage = hasIcon && !isIconifyIconId;

  const projectTitle = project?.title || 'Untitled Project';
  const projectDescription = project?.description || 'No description available';
  const projectColor = project?.color || 'yellow';
  const projectTags = Array.isArray(project?.tags)
    ? project.tags.slice(0, MAX_TAGS_DISPLAY)
    : [];

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  // Check if image is already cached/loaded
  useEffect(() => {
    if (isPlaceholder) {
      setImageLoaded(true);
      return;
    }

    if (typeof window === 'undefined') return;

    const img = document.createElement('img');
    img.src = imageSrc;

    if (img.complete) {
      setImageLoaded(true);
    } else {
      img.onload = () => {
        setImageLoaded(true);
        setImageError(false);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoaded(false);
      };
    }
  }, [imageSrc, isPlaceholder]);

  // Check if icon image is already cached/loaded (only for image URLs, not Iconify icons)
  useEffect(() => {
    if (!isIconImage || typeof window === 'undefined') return;

    const img = document.createElement('img');
    if (project.icon) {
      img.src = project.icon;
    }

    if (img.complete) {
      setIconImageLoaded(true);
    } else {
      img.onload = () => {
        setIconImageLoaded(true);
        setIconImageError(false);
      };
      img.onerror = () => {
        setIconImageError(true);
        setIconImageLoaded(false);
      };
    }
  }, [isIconImage, project?.icon]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className='group relative overflow-hidden rounded-lg bg-black/60 border-2 border-gray-800 hover:border-yellow-500 transition-all duration-300'
    >
      <div className='absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10' />

      <div className='aspect-video relative overflow-hidden bg-gray-800'>
        {/* Loading skeleton - only show if image hasn't loaded and it's not a placeholder */}
        {!imageLoaded && !imageError && !isPlaceholder && (
          <div className='absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center z-0'>
            <div className='text-gray-400 text-sm'>Loading...</div>
          </div>
        )}

        {/* Error state */}
        {imageError && (
          <div className='absolute inset-0 bg-gray-800 flex items-center justify-center z-0'>
            <div className='text-gray-500 text-xs text-center px-2'>
              Image unavailable
            </div>
          </div>
        )}

        {/* Background Image (default placeholder or custom image) */}
        <Image
          src={imageSrc}
          alt={`${projectTitle} project image`}
          fill
          className={cn(
            'object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            !isPlaceholder &&
              'group-hover:scale-110 transition-transform duration-500'
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading='lazy'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        />

        {/* Icon overlay in center circle (only if icon is provided and no custom image) */}
        {hasIcon && imageLoaded && (
          <div className='absolute inset-0 flex items-center justify-center z-20 pointer-events-none'>
            {/* Center circle container matching the placeholder design */}
            {/* Positioned to match the SVG center circle design */}
            <div className='relative w-[12%] aspect-square flex items-center justify-center max-w-[120px]'>
              {/* Outer circle ring (matching the design) */}
              <div className='absolute inset-0 rounded-full border border-gray-400/30' />
              {/* Inner white circle background */}
              <div className='absolute inset-[10%] rounded-full bg-white' />
              {/* Icon in center - scale to fit nicely */}
              <div className='relative z-10 w-[75%] h-[75%] flex items-center justify-center'>
                {isIconifyIconId && project.icon && (
                  <Icon
                    icon={project.icon}
                    className='w-full h-full text-gray-800'
                    aria-hidden='true'
                  />
                )}
                {isIconImage &&
                  iconImageLoaded &&
                  !iconImageError &&
                  project.icon && (
                    <Image
                      src={project.icon}
                      alt={`${projectTitle} icon`}
                      width={60}
                      height={60}
                      className='object-contain w-full h-full'
                      onLoad={() => setIconImageLoaded(true)}
                      onError={() => setIconImageError(true)}
                    />
                  )}
                {isIconImage && !iconImageLoaded && !iconImageError && (
                  <div className='w-full h-full bg-gray-200 animate-pulse rounded-full' />
                )}
                {isIconImage && iconImageError && (
                  <div className='text-gray-400 text-xs'>Icon unavailable</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='relative z-20 p-6 -mt-16'>
        <h3
          className={cn('text-xl font-bold mb-2', `neon-text-${projectColor}`)}
        >
          {projectTitle}
        </h3>
        <p className='text-gray-300 text-sm mb-4 line-clamp-3'>
          {projectDescription}
        </p>

        {projectTags.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {projectTags.map((tag: string, i: number) => (
              <span
                key={`${project?.id || 'project'}-tag-${i}`}
                className='text-xs px-2 py-1 bg-black/40 border border-yellow-500/30 rounded-full text-yellow-300'
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {project?.githubUrl && (
          <Link
            href={project.githubUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center text-sm text-yellow-400 hover:text-yellow-300 transition-colors'
            aria-label={`View ${projectTitle} on GitHub`}
          >
            <Icon
              icon='lucide:github'
              className='h-4 w-4 mr-1'
              aria-hidden='true'
            />
            <span>View on GitHub</span>
            <Icon
              icon='lucide:external-link'
              className='h-3 w-3 ml-1'
              aria-hidden='true'
            />
          </Link>
        )}
      </div>
    </motion.div>
  );
});

ProjectCard.displayName = 'ProjectCard';

const HeroSection = memo(
  ({
    registerSection,
    isLoaded,
    avatarUrl,
  }: {
    registerSection: (id: string, el: HTMLElement | null) => void;
    isLoaded: boolean;
    avatarUrl: string;
  }) => {
    return (
      <SectionWrapper
        ref={el => registerSection('home', el)}
        id='home'
        className='min-h-screen flex flex-col items-center justify-center relative px-4 py-20'
      >
        <div
          className='absolute inset-0 overflow-hidden z-0'
          aria-hidden='true'
        >
          <div className='absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-full bg-neon-yellow/10 blur-3xl animate-pulse'></div>
          <div
            className='absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 rounded-full bg-neon-pink/10 blur-3xl animate-pulse'
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

        <motion.div
          className='relative z-10 flex flex-col items-center text-center'
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className='relative mb-6 sm:mb-8'>
            <div className='w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 relative'>
              <div className='absolute inset-0 rounded-full border-2 border-neon-yellow animate-neon-pulse'></div>
              <Image
                src={avatarUrl || IMAGE_PLACEHOLDER}
                alt={`${siteConfig.personal.name} - ${siteConfig.personal.title}`}
                width={400}
                height={400}
                className='rounded-full object-cover w-full h-full'
                priority
                sizes='(max-width: 640px) 128px, (max-width: 768px) 160px, 192px'
                onError={() => {
                  logger.warn('Avatar image failed to load', {
                    url: avatarUrl,
                  });
                }}
              />
            </div>
          </div>

          <h1 className='text-3xl sm:text-4xl md:text-6xl font-bold mb-4 animate-color-cycle px-4'>
            {siteConfig.personal.name}
          </h1>
          <p className='text-lg sm:text-xl md:text-2xl mb-6 neon-text-blue px-4'>
            {siteConfig.personal.title}
          </p>
          <p className='max-w-lg text-gray-300 mb-8 px-4 text-sm sm:text-base'>
            {siteConfig.personal.bio}
          </p>

          <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 px-4'>
            <Link
              href={GITHUB_PROFILE_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='neon-button-pink flex items-center justify-center gap-2 text-sm sm:text-base px-4 sm:px-6 py-2'
              aria-label='Visit GitHub profile'
            >
              <Icon
                icon='lucide:github'
                width={18}
                height={18}
                aria-hidden='true'
              />{' '}
              GitHub
            </Link>
            <Link
              href={`mailto:${siteConfig.contact.email}`}
              className='neon-button flex items-center justify-center gap-2 text-sm sm:text-base px-4 sm:px-6 py-2'
              aria-label='Contact me'
            >
              <Icon
                icon='lucide:mail'
                width={18}
                height={18}
                aria-hidden='true'
              />{' '}
              Contact Me
            </Link>
          </div>

          <a
            href='#about'
            className='animate-bounce text-gray-400 hover:text-white transition-colors'
            aria-label='Scroll to about section'
          >
            <Icon
              icon='lucide:chevron-down'
              width={24}
              height={24}
              aria-hidden='true'
            />
          </a>
        </motion.div>
      </SectionWrapper>
    );
  }
);

HeroSection.displayName = 'HeroSection';

const AboutSection = memo(
  ({
    registerSection,
    skills,
  }: {
    registerSection: (id: string, el: HTMLElement | null) => void;
    skills: Skill[];
  }) => {
    const coreValues: CoreValue[] = useMemo(
      () => [
        {
          icon: (
            <Icon icon='lucide:heart' className='h-10 w-10 text-honey-500' />
          ),
          title: 'Passionate Coder',
          description:
            'Dedicated to writing clean, efficient, and elegant code that solves real-world problems.',
        },
        {
          icon: (
            <Icon icon='lucide:layout' className='h-10 w-10 text-honey-500' />
          ),
          title: 'UI/UX Enthusiast',
          description:
            'Creating interfaces that are not just beautiful, but intuitive and accessible for all users.',
        },
        {
          icon: (
            <Icon
              icon='lucide:brain-circuit'
              className='h-10 w-10 text-honey-500'
            />
          ),
          title: 'Continuous Learner',
          description:
            'Always exploring new technologies and methodologies to stay at the forefront of development.',
        },
        {
          icon: (
            <Icon icon='lucide:rocket' className='h-10 w-10 text-honey-500' />
          ),
          title: 'Problem Solver',
          description:
            'Approaching challenges with analytical thinking and creative solutions.',
        },
      ],
      []
    );

    return (
      <SectionWrapper
        ref={el => registerSection('about', el)}
        id='about'
        className='py-20 relative bg-black/20'
      >
        <SectionTitle title='About Me' />
        <SectionDescription
          description="As a 21-year-old Full Stack Developer from India with over 5 years of experience, I've developed a deep
          passion for creating innovative digital solutions across various platforms."
        />

        <div className='grid md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16'>
          <motion.div
            className='space-y-6'
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className='p-4 sm:p-6 bg-black/50 backdrop-blur-sm border-2 neon-border-blue rounded-lg'>
              <h3 className='text-lg sm:text-xl font-bold mb-4 neon-text-blue'>
                Who I Am
              </h3>
              <p className='text-gray-300 text-sm sm:text-base'>
                I'm a 21-year-old full-stack developer from India with a passion
                for building cutting-edge digital solutions. With 5+ years of
                hands-on experience, I've developed expertise across multiple
                languages and platforms, creating everything from responsive web
                applications to blockchain solutions.
              </p>
            </div>

            <div className='p-4 sm:p-6 bg-black/50 backdrop-blur-sm border-2 neon-border-green rounded-lg'>
              <h3 className='text-lg sm:text-xl font-bold mb-4 neon-text-green'>
                My Journey
              </h3>
              <p className='text-gray-300 text-sm sm:text-base'>
                My development journey began at 16, driven by curiosity and a
                desire to build impactful software. I've since mastered
                JavaScript/TypeScript, Python, Golang, and Rust, applying these
                skills to create innovative applications that solve real-world
                problems.
              </p>
            </div>
          </motion.div>

          <motion.div
            className='space-y-6'
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className='p-4 sm:p-6 bg-black/50 backdrop-blur-sm border-2 neon-border-pink rounded-lg'>
              <h3 className='text-lg sm:text-xl font-bold mb-4 neon-text-pink'>
                Experience Highlights
              </h3>
              <div className='grid grid-cols-2 gap-3 sm:gap-4'>
                {[
                  { value: '5+', label: 'Years Experience' },
                  { value: '20+', label: 'Projects' },
                  { value: '4', label: 'Languages' },
                  { value: '10+', label: 'Technologies' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className='text-center p-2 sm:p-3 bg-black/30 rounded-lg border border-honey-800/50'
                  >
                    <div className='text-2xl sm:text-3xl font-bold text-honey-500 mb-1'>
                      {stat.value}
                    </div>
                    <div className='text-xs sm:text-sm'>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className='p-4 sm:p-6 bg-black/50 backdrop-blur-sm border-2 neon-border-yellow rounded-lg'>
              <h3 className='text-lg sm:text-xl font-bold mb-4 neon-text'>
                Core Skills
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {skills.slice(0, 4).map((skill, index) => {
                  return (
                    <div key={index} className='flex items-center gap-2'>
                      <span className={`p-1 rounded-full ${skill.color}`}>
                        <Icon icon={skill.icon} className='h-5 w-5' />
                      </span>
                      <span className='text-xs sm:text-sm'>{skill.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        <div className='mt-12'>
          <h3 className='text-2xl font-bold text-center mb-8 neon-text-blue'>
            Core Values
          </h3>
          <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                className='bg-black/50 backdrop-blur-sm p-6 rounded-lg border-2 border-honey-800/50 hover:border-honey-500 transition-all duration-300 group'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className='mb-4 transition-transform duration-300 group-hover:scale-110 origin-left'>
                  {value.icon}
                </div>
                <h4 className='text-lg font-semibold mb-2'>{value.title}</h4>
                <p className='text-sm text-muted-foreground'>
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    );
  }
);

AboutSection.displayName = 'AboutSection';

function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string>(
    siteConfig.personal.avatarUrl || IMAGE_PLACEHOLDER
  );
  const validationRunRef = useRef<typeof VALIDATION_ONCE_FLAG | null>(null);
  const mainProjectsRef = useRef<HTMLElement | null>(null);
  const loadStartTimeRef = useRef<number>(0);

  // Memoized sections array
  const sections = useMemo(() => [...NAVIGATION_SECTIONS], []);
  const { activeSection, registerSection, scrollToSection } =
    useSectionNavigation(sections);

  // Initialize client-side state - runs only once on mount
  useEffect(() => {
    let rafId: number | null = null;

    try {
      setIsClient(true);
      loadStartTimeRef.current = performance.now();
      rafId = requestAnimationFrame(() => {
        setIsLoaded(true);
      });
    } catch (error) {
      trackError(error instanceof Error ? error : new Error(String(error)), {
        component: 'Home',
        action: 'initialization',
      });
      setIsClient(true);
      setIsLoaded(true);
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Track performance
  useEffect(() => {
    if (isLoaded && loadStartTimeRef.current > 0) {
      const loadTime = performance.now() - loadStartTimeRef.current;
      trackPerformance('Home: Initial Load', loadStartTimeRef.current, {
        loadTime: `${loadTime.toFixed(2)}ms`,
      });
    }
  }, [isLoaded]);

  // Use scroll hooks only when ref is available
  const defaultScrollProgress = useMotionValue(0);

  const scrollOptions = useMemo(() => {
    if (!isClient || !mainProjectsRef.current) {
      return undefined;
    }
    const offset: ['start end', 'end start'] = ['start end', 'end start'];
    return {
      target: mainProjectsRef,
      offset,
    };
  }, [isClient]);

  const { scrollYProgress } = useScroll(scrollOptions);
  const scrollValue = scrollYProgress || defaultScrollProgress;

  // Memoized scroll transforms
  const projectsOpacity = useTransform(
    scrollValue,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );
  const projectsScale = useTransform(
    scrollValue,
    [0, 0.2, 0.8, 1],
    [0.8, 1, 1, 0.8]
  );

  const handleSectionClick = useOptimizedEventHandler(
    (section: string) => {
      try {
        scrollToSection(section);
        logger.debug('Section navigation triggered', { section });
      } catch (error) {
        trackError(error instanceof Error ? error : new Error(String(error)), {
          action: 'section_navigation',
          section,
        });
      }
    },
    [scrollToSection]
  );

  // Memoized skills data
  const skills: Skill[] = useMemo(
    () => [
      {
        name: 'JavaScript/TypeScript',
        icon: 'lucide:code',
        color: 'neon-text',
        value: 95,
      },
      {
        name: 'React & Next.js',
        icon: 'lucide:globe',
        color: 'neon-text-blue',
        value: 95,
      },
      {
        name: 'Python',
        icon: 'lucide:code',
        color: 'neon-text-green',
        value: 90,
      },
      {
        name: 'Golang',
        icon: 'lucide:rocket',
        color: 'neon-text-blue',
        value: 85,
      },
      {
        name: 'Rust',
        icon: 'lucide:flame',
        color: 'neon-text-pink',
        value: 80,
      },
      {
        name: 'Node.js',
        icon: 'lucide:code',
        color: 'neon-text-green',
        value: 90,
      },
    ],
    []
  );

  // Fetch avatar from GitHub API
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch('/api/github/stats');
        if (response.ok) {
          const stats = await response.json();
          if (stats.avatarUrl) {
            // Append size parameter for better quality (400x400 pixels)
            const avatarWithSize = stats.avatarUrl.includes('?')
              ? `${stats.avatarUrl}&s=400`
              : `${stats.avatarUrl}?s=400`;
            setAvatarUrl(avatarWithSize);
          }
        } else {
          // If API fails, use placeholder
          logger.warn('Failed to fetch avatar from GitHub API', {
            status: response.status,
          });
        }
      } catch (error) {
        logger.error(
          'Error fetching avatar from GitHub',
          error instanceof Error ? error : new Error(String(error))
        );
        // Keep using placeholder or config fallback
      }
    };

    fetchAvatar();
  }, []);

  // Fetch featured projects from GitHub
  const [featuredProjects, setFeaturedProjects] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      image?: string;
      icon?: string;
      tags: string[];
      githubUrl: string;
      color?: string;
    }>
  >([]);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      const featuredRepos = siteConfig.github.featuredRepos;

      if (featuredRepos.length === 0) {
        return;
      }

      try {
        // Extract repo IDs for API call
        const repoIds = featuredRepos.map(repo => repo.id);
        const response = await fetch(
          `/api/github/repos?limit=${repoIds.length}&featured=${repoIds.join(',')}`
        );
        if (response.ok) {
          const repos: GitHubRepository[] = await response.json();

          // Create a map of repo name to config for quick lookup
          const configMap = new Map(
            featuredRepos.map(repo => [repo.id.toLowerCase(), repo])
          );

          const projects = repos.map(repo => {
            // Find matching config by repo name (case-insensitive)
            const repoConfig = configMap.get(repo.name.toLowerCase());

            return {
              id: repo.id,
              title: repo.name,
              // Use custom description if provided, otherwise use GitHub description
              description:
                repoConfig?.description ||
                repo.description ||
                'No description available',
              // Conditionally include image and icon only if they exist
              ...(repoConfig?.image && { image: repoConfig.image }),
              ...(repoConfig?.icon && { icon: repoConfig.icon }),
              tags:
                repo.languages?.edges?.slice(0, 4).map(e => e.node.name) || [],
              githubUrl: repo.url,
              color: ['yellow', 'pink', 'blue', 'green'][
                repos.indexOf(repo) % 4
              ] as 'yellow' | 'pink' | 'blue' | 'green',
            };
          });
          setFeaturedProjects(projects);
        }
      } catch (error) {
        logger.error(
          'Error fetching featured projects',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    };

    fetchFeaturedProjects();
  }, []);

  // Run validation once in a separate effect
  useEffect(() => {
    if (validationRunRef.current === VALIDATION_ONCE_FLAG) return;
    validationRunRef.current = VALIDATION_ONCE_FLAG;

    try {
      const validationErrors: string[] = [];

      // Validate skills
      skills.forEach((skill, index) => {
        try {
          const validation = validateSkillData({
            name: skill.name,
            icon: <Icon icon={skill.icon} className='h-5 w-5' />,
            value: skill.value,
          });
          if (!validation.isValid) {
            validationErrors.push(
              `Skill ${index}: ${validation.errors.join(', ')}`
            );
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error('Error validating skill', err, { skillIndex: index });
          validationErrors.push(`Skill ${index}: Validation failed`);
        }
      });

      // Validate projects (only if they exist)
      if (featuredProjects.length > 0) {
        featuredProjects.forEach((project, index) => {
          try {
            const validation = validateProjectData(project);
            if (!validation.isValid) {
              validationErrors.push(
                `Project ${index}: ${validation.errors.join(', ')}`
              );
            }
            if (validation.warnings?.length) {
              logger.warn('Project validation warnings', {
                projectId: project.id,
                warnings: validation.warnings,
              });
            }
          } catch (error) {
            const err =
              error instanceof Error ? error : new Error(String(error));
            logger.error('Error validating project', err, {
              projectIndex: index,
              projectId: project.id,
            });
            validationErrors.push(`Project ${index}: Validation failed`);
          }
        });
      }

      if (validationErrors.length > 0) {
        logger.warn('Validation errors detected', { errors: validationErrors });
        setErrors(prev => [...prev, ...validationErrors]);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error during validation', err);
    }
  }, [skills, featuredProjects]);

  if (!isClient) {
    return (
      <main className='relative w-full overflow-x-hidden max-w-full'>
        <div className='flex items-center justify-center min-h-screen'>
          <div className='text-gray-400 text-sm animate-pulse'>Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className='relative w-full overflow-x-hidden max-w-full'>
      <AnimatedGridBackground />

      {/* Navigation */}
      <nav
        className='fixed top-0 left-0 w-full z-50 px-4 sm:px-6 py-4 flex justify-between items-center backdrop-blur-sm bg-black/30'
        aria-label='Main navigation'
      >
        <a
          href='#home'
          className='neon-text animate-glow text-lg sm:text-xl font-bold'
          aria-label='Go to home section'
        >
          H.S
        </a>
        <div className='flex gap-2 sm:gap-4 flex-wrap' role='list'>
          {sections.map(section => (
            <NavigationItem
              key={section}
              section={section}
              activeSection={activeSection}
              onClick={handleSectionClick}
            />
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection
        registerSection={registerSection}
        isLoaded={isLoaded}
        avatarUrl={avatarUrl}
      />

      {/* About Section */}
      <AboutSection registerSection={registerSection} skills={skills} />

      {/* Featured Projects Section - Only show if there are featured repos */}
      {featuredProjects.length > 0 && (
        <SectionWrapper
          ref={el => {
            if (el) {
              mainProjectsRef.current = el;
              registerSection('projects', el);
            }
          }}
          className='py-12 sm:py-20 bg-black/30'
        >
          <SectionTitle title='Featured Projects' />
          <SectionDescription description='Explore some of my recent work across various technologies and domains.' />

          <motion.div
            className='w-full max-w-full overflow-x-hidden'
            style={{
              opacity: projectsOpacity,
              scale: projectsScale,
            }}
            layout
          >
            <div
              className={cn(
                'grid gap-6 md:gap-8 max-w-6xl mx-auto px-4',
                featuredProjects.length === 1
                  ? 'grid-cols-1 max-w-md mx-auto'
                  : 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              )}
            >
              {featuredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </motion.div>
        </SectionWrapper>
      )}

      {/* Skills Section */}
      <SkillsSection registerSection={registerSection} />

      {/* GitHub Section */}
      <GithubSection registerSection={registerSection} />

      {/* Footer with Easter Egg */}
      <Footer />

      {/* Error Display - Development Only */}
      {errors.length > 0 && process.env.NODE_ENV === 'development' && (
        <div className='fixed bottom-4 right-4 bg-red-900/90 text-red-100 p-4 rounded-lg max-w-md z-50 max-h-96 overflow-y-auto'>
          <h4 className='font-bold mb-2'>Validation Errors:</h4>
          <ul className='text-sm space-y-1'>
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

export default memo(withErrorBoundary(Home, <div>Error</div>));

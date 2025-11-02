'use client';

import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@iconify/react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import SectionWrapper from '@/components/section-wrapper';
import SectionTitle from '@/components/section-title';
import SectionDescription from '@/components/section-description';

interface SkillsSectionProps {
  registerSection?: (id: string, el: HTMLElement | null) => void;
}

function SkillsSection({ registerSection }: SkillsSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  // Register section with navigation
  useEffect(() => {
    if (registerSection && sectionRef.current) {
      registerSection('skills', sectionRef.current);
    }
  }, [registerSection]);

  useEffect(() => {
    let isMounted = true;
    let scrollTimeout: NodeJS.Timeout | null = null;

    // Check if section is already visible (e.g., when navigating directly)
    const checkVisibility = () => {
      if (!isMounted || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
      if (isInViewport) {
        setIsVisible(true);
      }
    };

    // Check immediately and after a short delay (for navigation)
    checkVisibility();
    const timeoutId = setTimeout(() => {
      checkVisibility();
    }, 100);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting && isMounted) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // Also check on scroll (for navigation completion) - throttled
    const handleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        checkVisibility();
        scrollTimeout = null;
      }, 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSkillHover = useCallback((skillName: string | null) => {
    setActiveSkill(skillName);
  }, []);

  const skills = useMemo(
    () => [
      {
        name: 'JavaScript/TypeScript',
        value: 95,
        icon: <Icon icon='lucide:code' className='h-6 w-6' />,
        details:
          'Expert in modern JavaScript (ES6+) and TypeScript, with strong typing and advanced patterns.',
        projects: ['DeFi Exchange', 'E-Commerce Dashboard'],
        years: 5,
      },
      {
        name: 'Python',
        value: 90,
        icon: <Icon icon='lucide:terminal' className='h-6 w-6' />,
        details:
          'Proficient in Python for data analysis, automation, and backend development.',
        projects: ['Telegram Trading Bot', 'Web Scraping Automation'],
        years: 4,
      },
      {
        name: 'Golang',
        value: 85,
        icon: <Icon icon='lucide:server' className='h-6 w-6' />,
        details:
          'Experienced in building high-performance microservices and CLI tools with Go.',
        projects: ['API Gateway', 'Data Processing Service'],
        years: 3,
      },
      {
        name: 'Rust',
        value: 80,
        icon: <Icon icon='lucide:git-branch' className='h-6 w-6' />,
        details:
          "Building memory-safe, concurrent systems with Rust's powerful type system.",
        projects: ['WebAssembly Modules', 'System Utilities'],
        years: 2,
      },
      {
        name: 'React & Next.js',
        value: 95,
        icon: <Icon icon='lucide:layout' className='h-6 w-6' />,
        details:
          'Expert in React ecosystem, including Next.js, Redux, and modern React patterns.',
        projects: ['NFT Marketplace', 'Portfolio Website'],
        years: 5,
      },
      {
        name: 'Node.js',
        value: 90,
        icon: <Icon icon='lucide:server' className='h-6 w-6' />,
        details:
          'Building scalable backend services with Express, NestJS, and various databases.',
        projects: ['E-Commerce API', 'Real-time Chat Server'],
        years: 4,
      },
      {
        name: 'Blockchain/Web3',
        value: 85,
        icon: <Icon icon='lucide:brain-circuit' className='h-6 w-6' />,
        details:
          'Developing dApps with Solidity, ethers.js, and various blockchain protocols.',
        projects: ['DeFi Exchange', 'NFT Marketplace'],
        years: 3,
      },
      {
        name: 'DevOps & CI/CD',
        value: 80,
        icon: <Icon icon='lucide:git-branch' className='h-6 w-6' />,
        details:
          'Setting up automated pipelines with Docker, Kubernetes, and cloud platforms.',
        projects: ['Microservices Architecture', 'Cloud Deployment'],
        years: 3,
      },
    ],
    []
  );

  const expertiseAreas = useMemo(
    () => [
      {
        icon: <Icon icon='lucide:globe' className='h-8 w-8' />,
        title: 'Web Applications',
        description:
          'Building responsive, scalable, and interactive web applications using modern frameworks and best practices.',
        techs: [
          'React',
          'Next.js',
          'Node.js',
          'Express',
          'GraphQL',
          'REST APIs',
        ],
      },
      {
        icon: <Icon icon='lucide:smartphone' className='h-8 w-8' />,
        title: 'Mobile Applications',
        description:
          'Developing cross-platform mobile apps that deliver native-like experiences with efficient code sharing.',
        techs: ['React Native', 'Flutter', 'Progressive Web Apps'],
      },
      {
        icon: <Icon icon='lucide:brain-circuit' className='h-8 w-8' />,
        title: 'Decentralized Applications',
        description:
          'Creating blockchain-based applications that leverage smart contracts and decentralized technologies.',
        techs: ['Ethereum', 'Solidity', 'Web3.js', 'IPFS', 'Smart Contracts'],
      },
      {
        icon: <Icon icon='lucide:bot' className='h-8 w-8' />,
        title: 'Automation & Bots',
        description:
          'Developing automation scripts and bots that streamline workflows and enhance productivity.',
        techs: [
          'Telegram Bots',
          'Web Scrapers',
          'Task Automation',
          'Workflow Optimization',
        ],
      },
      {
        icon: <Icon icon='lucide:database' className='h-8 w-8' />,
        title: 'Databases & Backend',
        description:
          'Designing and implementing robust database systems and backend services for various applications.',
        techs: ['PostgreSQL', 'MongoDB', 'Firebase', 'Redis', 'AWS', 'Docker'],
      },
    ],
    []
  );

  return (
    <SectionWrapper ref={sectionRef} id='skills'>
      <SectionTitle title='My Skills & Expertise' />
      <SectionDescription description='With a diverse skill set and expertise across multiple domains, I bring a comprehensive approach to every project.' />

      <div className='grid md:grid-cols-2 gap-16 mb-20'>
        <div>
          <h2 className='text-2xl font-bold mb-6 neon-text'>
            Technical Proficiency
          </h2>
          <div className='space-y-6'>
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                className={cn(
                  'p-4 rounded-lg skill-card relative',
                  activeSkill === skill.name
                    ? 'bg-honey-900/40 border border-honey-500'
                    : 'bg-honey-900/20'
                )}
                initial={{ opacity: 0, x: -50 }}
                animate={isVisible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => handleSkillHover(skill.name)}
                onMouseLeave={() => handleSkillHover(null)}
              >
                <div className='flex items-center gap-3 mb-2'>
                  <div className='p-2 bg-honey-800/30 rounded-full text-honey-400'>
                    {skill.icon}
                  </div>
                  <div className='flex-1'>
                    <div className='flex justify-between'>
                      <span className='font-medium'>{skill.name}</span>
                      <span className='text-muted-foreground'>
                        {skill.value}%
                      </span>
                    </div>
                    <Progress
                      value={isVisible ? skill.value : 0}
                      className='h-2 bg-honey-100/10 mt-1'
                      style={{
                        transition: `width ${800 + index * 100}ms ease-out ${index * 100}ms`,
                      }}
                      indicatorClassName='bg-honey-500'
                    />
                  </div>
                </div>

                {activeSkill === skill.name && (
                  <div className='mt-3 pt-3 border-t border-honey-800/50 text-sm'>
                    <p className='text-honey-300 mb-2'>{skill.details}</p>
                    <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2'>
                      <div className='flex flex-wrap gap-2'>
                        <span className='text-xs text-honey-400 self-center'>
                          Projects:{' '}
                        </span>
                        {skill.projects.map((project, i) => (
                          <span
                            key={i}
                            className='text-xs bg-honey-800/40 px-2 py-1 rounded whitespace-nowrap inline-block'
                          >
                            {project}
                          </span>
                        ))}
                      </div>
                      <span className='text-xs bg-honey-500/20 px-2 py-1 rounded text-honey-300 whitespace-nowrap self-start sm:self-center'>
                        {skill.years} years
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className='relative pt-6 mt-6 px-4 sm:px-6 md:px-8'>
          <div className='relative mb-2'>
            <h2 className='text-2xl font-bold neon-text-pink relative z-10'>
              Key Highlights
            </h2>
          </div>
          <div className='absolute -inset-x-4 bottom-0 -z-10 bg-honey-100/5 dark:bg-honey-900/10 rounded-lg animated-border'></div>
          <ul className='space-y-4 text-muted-foreground'>
            <motion.li
              className={cn(
                'flex items-start transition-all duration-500',
                isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4'
              )}
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              <span className='inline-flex items-center justify-center rounded-full bg-honey-100 dark:bg-honey-900/30 p-1 mr-3 mt-1'>
                <span className='w-2 h-2 rounded-full bg-honey-500'></span>
              </span>
              <span>
                5+ years of hands-on development experience across multiple
                domains
              </span>
            </motion.li>
            <motion.li
              className={cn(
                'flex items-start transition-all duration-500 delay-100',
                isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4'
              )}
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className='inline-flex items-center justify-center rounded-full bg-honey-100 dark:bg-honey-900/30 p-1 mr-3 mt-1'>
                <span className='w-2 h-2 rounded-full bg-honey-500'></span>
              </span>
              <span>
                Proficient in JavaScript/TypeScript, Python, Golang, and Rust
              </span>
            </motion.li>
            <motion.li
              className={cn(
                'flex items-start transition-all duration-500 delay-200',
                isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4'
              )}
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className='inline-flex items-center justify-center rounded-full bg-honey-100 dark:bg-honey-900/30 p-1 mr-3 mt-1'>
                <span className='w-2 h-2 rounded-full bg-honey-500'></span>
              </span>
              <span>
                Experience with modern frontend frameworks like React, Next.js,
                and Vue
              </span>
            </motion.li>
            <motion.li
              className={cn(
                'flex items-start transition-all duration-500 delay-300',
                isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4'
              )}
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span className='inline-flex items-center justify-center rounded-full bg-honey-100 dark:bg-honey-900/30 p-1 mr-3 mt-1'>
                <span className='w-2 h-2 rounded-full bg-honey-500'></span>
              </span>
              <span>
                Strong background in backend development with Node.js, Express,
                and Django
              </span>
            </motion.li>
            <motion.li
              className={cn(
                'flex items-start transition-all duration-500 delay-400',
                isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4'
              )}
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <span className='inline-flex items-center justify-center rounded-full bg-honey-100 dark:bg-honey-900/30 p-1 mr-3 mt-1'>
                <span className='w-2 h-2 rounded-full bg-honey-500'></span>
              </span>
              <span>
                Expertise in database design and implementation (SQL and NoSQL)
              </span>
            </motion.li>
            <motion.li
              className={cn(
                'flex items-start transition-all duration-500 delay-500',
                isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-4'
              )}
              initial={{ opacity: 0, x: 50 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <span className='inline-flex items-center justify-center rounded-full bg-honey-100 dark:bg-honey-900/30 p-1 mr-3 mt-1'>
                <span className='w-2 h-2 rounded-full bg-honey-500'></span>
              </span>
              <span>
                Experience with cloud platforms like AWS, Google Cloud, and
                Azure
              </span>
            </motion.li>
          </ul>
        </div>
      </div>

      <h2 className='text-2xl font-bold text-center mb-12 neon-text-blue'>
        Areas of Expertise
      </h2>
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {expertiseAreas.map((area, index) => (
          <motion.div
            key={index}
            className={cn(
              'bg-black/50 backdrop-blur-sm p-6 rounded-lg shadow-sm border-2 border-honey-800/50 hover:shadow-md transition-all duration-300 hover:border-honey-500 group',
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            )}
            initial={{ opacity: 0, y: 50 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className='mb-4 p-3 inline-block bg-honey-900/50 rounded-lg text-honey-400 transition-transform duration-300 group-hover:scale-110 group-hover:text-honey-300'>
              {area.icon}
            </div>
            <h4 className='text-xl font-semibold mb-3 group-hover:text-honey-300'>
              {area.title}
            </h4>
            <p className='text-muted-foreground mb-4 text-sm'>
              {area.description}
            </p>
            <div className='flex flex-wrap gap-2'>
              {area.techs.map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className='inline-block px-3 py-1 text-xs bg-honey-900/50 text-honey-300 rounded-full border border-honey-800/50 group-hover:border-honey-500/50 transition-all duration-300'
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}

export default memo(SkillsSection);

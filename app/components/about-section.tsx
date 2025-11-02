'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import SectionWrapper from '@/components/section-wrapper';
import SectionTitle from '@/components/section-title';
import SectionDescription from '@/components/section-description';

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentRef = sectionRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.3,
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, []);

  const features = [
    {
      icon: <Icon icon='lucide:heart' className='h-10 w-10 text-honey-500' />,
      title: 'Passionate Coder',
      description:
        'Dedicated to writing clean, efficient, and elegant code that solves real-world problems.',
    },
    {
      icon: (
        <Icon icon='lucide:layout-grid' className='h-10 w-10 text-honey-500' />
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
      icon: <Icon icon='lucide:rocket' className='h-10 w-10 text-honey-500' />,
      title: 'Problem Solver',
      description:
        'Approaching challenges with analytical thinking and creative solutions.',
    },
  ];

  return (
    <SectionWrapper
      ref={sectionRef}
      id='about'
      className='bg-honey-50/50 dark:bg-honey-950/30'
    >
      <SectionTitle title='About Me' />
      <SectionDescription
        description="As a 21-year-old Full Stack Developer from India with over 5 years of experience, I've developed a deep
            passion for creating innovative digital solutions across various platforms."
      />

      <div className='grid md:grid-cols-2 gap-8 mb-16'>
        <div
          className={cn(
            'transition-all duration-700 ease-out',
            isVisible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-10'
          )}
        >
          <h3 className='text-2xl font-bold mb-4'>My Journey</h3>
          <p className='text-muted-foreground mb-4'>
            My development journey began when I was just 16, driven by curiosity
            and a desire to build things that matter. Over the years, I've honed
            my skills across multiple programming languages and frameworks,
            becoming proficient in JavaScript/TypeScript, Python, Golang, and
            Rust.
          </p>
          <p className='text-muted-foreground'>
            I specialize in creating comprehensive digital experiences, from
            responsive web applications and intuitive mobile apps to
            cutting-edge decentralized applications and automation solutions. My
            approach combines technical excellence with a keen understanding of
            user needs and business goals.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                'bg-white dark:bg-honey-900/20 p-6 rounded-lg shadow-sm border border-honey-200 dark:border-honey-800 hover:shadow-md transition-all duration-300 parent hover:border-honey-300 dark:hover:border-honey-700 group',
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10',
                isVisible &&
                  `transition-all duration-700 delay-${index * 150} ease-out`
              )}
            >
              <div className='mb-4 transition-transform duration-300 group-hover:scale-110 origin-left'>
                {feature.icon}
              </div>
              <h4 className='text-lg font-semibold mb-2'>{feature.title}</h4>
              <p className='text-sm text-muted-foreground'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className='bg-white dark:bg-honey-900/20 p-8 rounded-lg shadow-md border border-honey-200 dark:border-honey-800'>
        <h3 className='text-2xl font-bold mb-4 text-center'>
          Experience Highlights
        </h3>
        <div className='grid md:grid-cols-3 gap-6 mt-8'>
          <div
            className={cn(
              'text-center p-4 transition-all duration-500',
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
              isVisible && 'delay-100'
            )}
          >
            <div className='text-4xl font-bold text-honey-500 mb-2'>5+</div>
            <div className='text-lg font-medium'>Years of Experience</div>
            <p className='text-sm text-muted-foreground mt-2'>
              Building professional digital solutions
            </p>
          </div>
          <div
            className={cn(
              'text-center p-4 transition-all duration-500',
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
              isVisible && 'delay-200'
            )}
          >
            <div className='text-4xl font-bold text-honey-500 mb-2'>20+</div>
            <div className='text-lg font-medium'>Projects Completed</div>
            <p className='text-sm text-muted-foreground mt-2'>
              Across various technologies and platforms
            </p>
          </div>
          <div
            className={cn(
              'text-center p-4 transition-all duration-500',
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
              isVisible && 'delay-300'
            )}
          >
            <div className='text-4xl font-bold text-honey-500 mb-2'>4</div>
            <div className='text-lg font-medium'>Programming Languages</div>
            <p className='text-sm text-muted-foreground mt-2'>
              JavaScript, Python, Golang, Rust
            </p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [easterEggActive, setEasterEggActive] = useState(false);

  // For animation on mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Easter egg animation
  const activateEasterEgg = () => {
    setEasterEggActive(true);
    setTimeout(() => setEasterEggActive(false), 1000);
  };

  const handleScrollToProjects = () => {
    const projectsSection = document.querySelector('#projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id='home' className='relative py-20 md:py-28 overflow-hidden'>
      {/* Background elements */}
      <div className='absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute top-1/4 right-1/4 w-72 h-72 bg-honey-200 dark:bg-honey-900/20 rounded-full blur-3xl opacity-60'></div>
        <div className='absolute bottom-1/3 left-1/3 w-64 h-64 bg-honey-300 dark:bg-honey-800/20 rounded-full blur-3xl opacity-50'></div>
      </div>

      <div className='container px-4 mx-auto'>
        <div className='flex flex-col-reverse md:flex-row items-center justify-between gap-12'>
          <div
            className={cn(
              'max-w-2xl transition-all duration-1000 ease-out',
              isMounted
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            )}
          >
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-4'>
              Hi, I'm <span className='gradient-text'>Honey Singh</span>
            </h1>
            <h2 className='text-2xl md:text-3xl font-medium mb-6'>
              FullStack Developer
            </h2>
            <p className='text-lg text-muted-foreground mb-8'>
              Transforming ideas into elegant, functional applications with 5+
              years of experience in JavaScript, Python, Golang, and Rust.
              Specializing in web apps, mobile apps, dApps, and automation
              solutions.
            </p>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button
                onClick={handleScrollToProjects}
                className='bg-honey-500 hover:bg-honey-600 text-white'
                size='lg'
              >
                View My Work{' '}
                <Icon icon='lucide:arrow-down' className='ml-2 h-4 w-4' />
              </Button>
              <Button variant='outline' size='lg'>
                Resume <Icon icon='lucide:file-text' className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </div>

          <div
            className={cn(
              'relative transition-all duration-1000 delay-300 ease-out',
              isMounted
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            )}
          >
            <div
              className={cn(
                'relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-honey-300 dark:border-honey-700 animate-float cursor-pointer parent',
                easterEggActive && 'animate-bounce'
              )}
              onClick={activateEasterEgg}
            >
              <Image
                src='/images/design-mode/avatar-2.png'
                alt='Honey Singh'
                fill
                style={{ objectFit: 'cover' }}
                sizes='(max-width: 768px) 16rem, 20rem'
                className='transition-transform duration-300 hover:scale-105'
                priority
              />
              <div className='absolute inset-0 bg-honey-500/20 opacity-0 transition-opacity duration-300 hover:opacity-100'></div>
              <div className='hidden-feature absolute bottom-4 w-full text-center text-xs bg-honey-500/80 text-white py-1 font-medium'>
                Click for a surprise!
              </div>
            </div>

            <div className='absolute -bottom-4 -right-4 p-3 bg-honey-100 dark:bg-honey-900 rounded-full shadow-lg animate-pulse'>
              <Icon
                icon='lucide:wand-sparkles'
                className='h-6 w-6 text-honey-500'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

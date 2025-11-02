'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [filter, setFilter] = useState('All');

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
        threshold: 0.2,
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, []);

  const projects = [
    {
      id: 1,
      title: 'DeFi Exchange Platform',
      description:
        'A decentralized exchange platform that allows users to trade cryptocurrencies without intermediaries.',
      image: '/placeholder.svg?height=480&width=640',
      tags: ['dApp', 'React', 'Solidity', 'Web3'],
      githubUrl: 'https://github.com/HoneySinghDev/defi-exchange',
      liveUrl: '#',
      category: 'Web3',
    },
    {
      id: 2,
      title: 'E-Commerce Dashboard',
      description:
        'A comprehensive dashboard for e-commerce businesses to manage products, orders, and analytics.',
      image: '/placeholder.svg?height=480&width=640',
      tags: ['React', 'Node.js', 'MongoDB', 'Charts'],
      githubUrl: 'https://github.com/HoneySinghDev/ecommerce-dashboard',
      liveUrl: '#',
      category: 'Web',
    },
    {
      id: 3,
      title: 'Telegram Trading Bot',
      description:
        'An automated bot for Telegram that analyzes market trends and executes trades based on predefined strategies.',
      image: '/placeholder.svg?height=480&width=640',
      tags: ['Python', 'Telegram API', 'Data Analysis'],
      githubUrl: 'https://github.com/HoneySinghDev/telegram-trading-bot',
      liveUrl: '#',
      category: 'Bot',
    },
    {
      id: 4,
      title: 'Fitness Tracker App',
      description:
        'A mobile application for tracking workouts, nutrition, and progress towards fitness goals.',
      image: '/placeholder.svg?height=480&width=640',
      tags: ['React Native', 'Firebase', 'Health API'],
      githubUrl: 'https://github.com/HoneySinghDev/fitness-tracker',
      liveUrl: '#',
      category: 'Mobile',
    },
    {
      id: 5,
      title: 'Web Scraping Automation',
      description:
        'A collection of scripts for automating web scraping tasks across various websites and platforms.',
      image: '/placeholder.svg?height=480&width=640',
      tags: ['Python', 'Selenium', 'BeautifulSoup', 'Automation'],
      githubUrl: 'https://github.com/HoneySinghDev/web-scraping-automation',
      liveUrl: '#',
      category: 'Automation',
    },
    {
      id: 6,
      title: 'NFT Marketplace',
      description:
        'A platform for creating, buying, and selling non-fungible tokens with a focus on digital art.',
      image: '/placeholder.svg?height=480&width=640',
      tags: ['React', 'Ethereum', 'IPFS', 'Smart Contracts'],
      githubUrl: 'https://github.com/HoneySinghDev/nft-marketplace',
      liveUrl: '#',
      category: 'Web3',
    },
  ];

  const categories = ['All', 'Web', 'Mobile', 'Web3', 'Bot', 'Automation'];

  const filteredProjects =
    filter === 'All'
      ? projects
      : projects.filter(project => project.category === filter);

  return (
    <section
      ref={sectionRef}
      id='projects'
      className='py-20 bg-honey-50/50 dark:bg-honey-950/30'
    >
      <div className='container px-4 mx-auto'>
        <div className='max-w-3xl mx-auto text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            Featured Projects
          </h2>
          <div className='w-20 h-1 bg-honey-400 mx-auto mb-6'></div>
          <p className='text-lg text-muted-foreground'>
            Explore some of my recent work across various technologies and
            domains.
          </p>
        </div>

        <div className='flex flex-wrap justify-center gap-2 mb-12'>
          {categories.map(category => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilter(category)}
              className={
                filter === category ? 'bg-honey-500 hover:bg-honey-600' : ''
              }
            >
              {category}
            </Button>
          ))}
        </div>

        <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-8'>
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className={cn(
                'bg-white dark:bg-honey-900/20 rounded-lg overflow-hidden shadow-md border border-honey-200 dark:border-honey-800 transition-all duration-300 hover:shadow-lg hover:border-honey-300 dark:hover:border-honey-700 group',
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10',
                isVisible &&
                  `transition-all duration-700 delay-${index * 100} ease-out`
              )}
            >
              <div className='relative aspect-video overflow-hidden bg-honey-100 dark:bg-honey-800/20'>
                <Image
                  src={project.image || '/placeholder.svg'}
                  alt={project.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  className='transition-transform duration-500 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
                  <div className='flex space-x-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='text-white border-white hover:bg-white/20 hover:text-white'
                      asChild
                    >
                      <Link
                        href={project.githubUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Icon icon='lucide:github' className='h-4 w-4 mr-1' />{' '}
                        Code
                      </Link>
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='text-white border-white hover:bg-white/20 hover:text-white'
                      asChild
                    >
                      <Link
                        href={project.liveUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Icon
                          icon='lucide:external-link'
                          className='h-4 w-4 mr-1'
                        />{' '}
                        Demo
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-xl font-bold'>{project.title}</h3>
                  <Badge className='bg-honey-100 text-honey-800 hover:bg-honey-200 dark:bg-honey-900 dark:text-honey-400 dark:hover:bg-honey-900/80'>
                    {project.category}
                  </Badge>
                </div>
                <p className='text-muted-foreground mb-4 text-sm h-12 overflow-hidden'>
                  {project.description}
                </p>
                <div className='flex flex-wrap gap-2 mb-4'>
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className='inline-flex items-center text-xs px-2 py-1 bg-honey-50 dark:bg-honey-900/40 text-honey-700 dark:text-honey-300 rounded'
                    >
                      <Icon icon='lucide:hexagon' className='h-3 w-3 mr-1' />{' '}
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='text-center mt-12'>
          <Link
            href='https://github.com/HoneySinghDev'
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button variant='outline' size='lg' className='group'>
              <Icon
                icon='lucide:github'
                className='mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12'
              />
              <span>View All Projects on GitHub</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

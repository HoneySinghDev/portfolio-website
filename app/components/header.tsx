'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'GitHub', href: '#github' },
  { name: 'Contact', href: '#contact' },
];

export default function Header() {
  const { setTheme, theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    // Implement smooth scrolling
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-200',
        isScrolled
          ? 'bg-background/80 backdrop-blur-md border-b'
          : 'bg-transparent'
      )}
    >
      <div className='container flex h-16 items-center justify-between py-4'>
        <div className='flex gap-6 md:gap-10'>
          <Link
            href='#home'
            className='flex items-center space-x-2 hover:opacity-80 transition-opacity'
            onClick={() => handleNavClick('#home')}
          >
            <span className='font-bold text-xl md:text-2xl gradient-text'>
              Honey Singh
            </span>
          </Link>
        </div>

        <div className='hidden md:flex gap-6'>
          <nav className='flex items-center gap-6 text-sm'>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={e => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className={cn(
                  'transition-colors hover:text-foreground/80 text-foreground/60 font-medium'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className='rounded-full'
            aria-label='Toggle theme'
          >
            <Icon
              icon='lucide:sun'
              className='h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'
            />
            <Icon
              icon='lucide:moon'
              className='absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'
            />
          </Button>
        </div>

        <div className='md:hidden flex items-center'>
          <Button
            variant='ghost'
            size='icon'
            className='mr-2'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label='Toggle theme'
          >
            <Icon
              icon='lucide:sun'
              className='h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'
            />
            <Icon
              icon='lucide:moon'
              className='absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'
            />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <Icon icon='lucide:x' className='h-6 w-6' />
            ) : (
              <Icon icon='lucide:menu' className='h-6 w-6' />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='md:hidden h-screen bg-background'>
          <nav className='flex flex-col items-center gap-6 p-6 text-base'>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={e => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
                className={cn(
                  'transition-colors hover:text-foreground/80 text-foreground/60 font-medium py-2'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

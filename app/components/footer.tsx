'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/config';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const;

export default function Footer() {
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const clickCountRef = useRef(0);
  const konamiRef = useRef<string[]>([]);
  const konamiCode = useMemo(() => KONAMI_CODE, []);

  const createConfetti = useCallback(() => {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    // Random position, color, and animation delay
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.animationDelay = Math.random() * 5 + 's';

    document.body.appendChild(confetti);

    // Remove confetti after animation completes
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }, []);

  const activateEasterEgg = useCallback(() => {
    setShowEasterEgg(true);

    // Create confetti effect
    for (let i = 0; i < 100; i++) {
      createConfetti();
    }

    // Hide after 10 seconds
    setTimeout(() => {
      setShowEasterEgg(false);
    }, 10000);
  }, [createConfetti]);

  // Handle Konami code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newKonami = [...konamiRef.current, e.key];
      if (newKonami.length > konamiCode.length) {
        newKonami.shift();
      }
      konamiRef.current = newKonami;

      if (newKonami.join(',') === konamiCode.join(',')) {
        activateEasterEgg();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiCode, activateEasterEgg]);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current >= 4) {
      activateEasterEgg();
      clickCountRef.current = 0;
    }
  };

  return (
    <footer className='py-12 relative overflow-hidden'>
      {/* Background elements */}
      <div className='absolute inset-0 -z-10'>
        <div className='absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-honey-500/50 to-transparent'></div>
        <div className='absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-honey-900/20 to-transparent'></div>
      </div>

      <div className='container px-4 mx-auto'>
        <div className='flex flex-col items-center mb-8'>
          <motion.div
            className='text-3xl font-bold neon-text mb-2 cursor-pointer'
            onClick={handleLogoClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Honey Singh
          </motion.div>
          <p className='text-gray-400 text-sm mb-6 max-w-md text-center'>
            Building digital experiences with JavaScript, Python, Golang, and
            Rust.
          </p>

          <div className='flex gap-4 mb-8'>
            <Link
              href={siteConfig.personal.githubUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='p-3 rounded-full border-2 neon-border transition-all duration-300 hover:bg-neon-yellow/20'
              aria-label='Visit GitHub profile'
            >
              <Icon
                icon='lucide:github'
                className='h-5 w-5 text-neon-yellow'
                aria-hidden='true'
              />
            </Link>
            <Link
              href={siteConfig.contact.socialLinks.linkedin}
              target='_blank'
              rel='noopener noreferrer'
              className='p-3 rounded-full border-2 neon-border-blue transition-all duration-300 hover:bg-neon-blue/20'
              aria-label='Visit LinkedIn profile'
            >
              <Icon
                icon='lucide:linkedin'
                className='h-5 w-5 text-neon-blue'
                aria-hidden='true'
              />
            </Link>
            <Link
              href={siteConfig.contact.socialLinks.twitter}
              target='_blank'
              rel='noopener noreferrer'
              className='p-3 rounded-full border-2 neon-border-pink transition-all duration-300 hover:bg-neon-pink/20'
              aria-label='Visit Twitter profile'
            >
              <Icon
                icon='lucide:twitter'
                className='h-5 w-5 text-neon-pink'
                aria-hidden='true'
              />
            </Link>
            <Link
              href={`mailto:${siteConfig.contact.email}`}
              className='p-3 rounded-full border-2 neon-border-green transition-all duration-300 hover:bg-neon-green/20'
              aria-label='Send email'
            >
              <Icon
                icon='lucide:mail'
                className='h-5 w-5 text-neon-green'
                aria-hidden='true'
              />
            </Link>
          </div>

          <div className='flex flex-wrap justify-center gap-4 text-xs text-gray-400 mb-8'>
            <Link href='#home' className='hover:text-white transition-colors'>
              Home
            </Link>
            <Link href='#skills' className='hover:text-white transition-colors'>
              Skills & Projects
            </Link>
            <Link href='#github' className='hover:text-white transition-colors'>
              GitHub
            </Link>
            <Button
              variant='link'
              className='text-xs text-gray-400 hover:text-white p-0 h-auto'
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Back to Top
            </Button>
          </div>
        </div>

        <div className='text-center text-xs text-gray-500'>
          <p className='flex items-center justify-center gap-1 mb-2'>
            Made with{' '}
            <Icon
              icon='lucide:heart'
              className='h-3 w-3 text-honey-500 animate-pulse'
            />{' '}
            and <Icon icon='lucide:code' className='h-3 w-3 text-honey-300' />
          </p>
          <p>© {new Date().getFullYear()} Honey Singh. All rights reserved.</p>
          <p className='hidden md:block mt-1 text-gray-600'>
            <span className='text-gray-500'>Hint:</span> Try the Konami code
            ↑↑↓↓←→←→ba
          </p>
        </div>
      </div>

      {/* Easter Egg */}
      {showEasterEgg && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className='bg-black/70 backdrop-blur-sm p-8 rounded-lg border-2 border-honey-500 max-w-md text-center'>
            <Icon
              icon='lucide:sparkles'
              className='h-12 w-12 text-honey-400 mx-auto mb-4'
            />
            <h3 className='text-2xl font-bold neon-text mb-4'>
              You Found the Easter Egg!
            </h3>
            <p className='text-gray-300 mb-6'>
              Thanks for exploring my portfolio! I'm always open to new
              opportunities and collaborations.
            </p>
            <div className='text-honey-300 font-mono p-3 bg-black/50 rounded mb-6 text-sm'>
              <code>console.log(&quot;Hello, fellow developer!&quot;);</code>
            </div>
            <Button
              className='neon-button'
              onClick={() => setShowEasterEgg(false)}
            >
              Close
            </Button>
          </div>
        </motion.div>
      )}

      <style jsx global>{`
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          top: -10px;
          border-radius: 50%;
          animation: fall 5s linear forwards;
          z-index: 9999;
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
          }
        }
      `}</style>
    </footer>
  );
}

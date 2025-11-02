'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

export default function EasterEgg() {
  const [showEgg, setShowEgg] = useState(false);
  const sequenceRef = useRef<string[]>([]);

  useEffect(() => {
    const correctSequence = ['h', 'o', 'n', 'e', 'y']; // Type "honey" to trigger

    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const newSequence = [...sequenceRef.current, key].slice(
        -correctSequence.length
      );

      // Check if sequence matches
      if (newSequence.join('') === correctSequence.join('')) {
        setShowEgg(true);
        sequenceRef.current = [];
      } else {
        sequenceRef.current = newSequence;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (!showEgg) return null;

  return (
    <AnimatePresence>
      {showEgg && (
        <motion.div
          className='fixed bottom-4 right-4 z-50'
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className='bg-white dark:bg-honey-900 p-4 rounded-lg shadow-lg border border-honey-200 dark:border-honey-700 max-w-xs'>
            <div className='flex justify-between items-center mb-3'>
              <div className='flex items-center gap-2'>
                <Icon
                  icon='lucide:sparkles'
                  className='h-5 w-5 text-honey-500'
                />
                <span className='font-bold'>You found me! 🎉</span>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={() => setShowEgg(false)}
              >
                <Icon icon='lucide:x' className='h-3 w-3' />
              </Button>
            </div>
            <p className='text-sm text-muted-foreground mb-3'>
              Congratulations! You've discovered a hidden easter egg. Thanks for
              exploring my portfolio in detail!
            </p>
            <div className='gradient-text text-center font-bold'>
              Honey Singh
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

const SectionWrapper = React.forwardRef<HTMLElement, SectionWrapperProps>(
  ({ id, children, className = '' }, ref) => (
    <section
      ref={ref}
      id={id || undefined}
      className={cn(
        'py-12 md:py-20 w-full max-w-full overflow-x-hidden',
        className
      )}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className='container px-4 mx-auto'>{children}</div>
    </section>
  )
);

SectionWrapper.displayName = 'SectionWrapper';

export default SectionWrapper;

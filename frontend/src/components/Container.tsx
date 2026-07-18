import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps {
  children: ReactNode
  className?: string
  /**
   * By default, Container uses the global max-width (1400px).
   * Optional 'narrow' sizes can be passed if justified (e.g., for forms).
   */
  size?: 'default' | 'sm' | 'md' | 'lg' | 'xl'
}

export function Container({ children, className, size = 'default' }: ContainerProps) {
  return (
    <div className={cn(
      "w-full mx-auto px-6 sm:px-10 lg:px-16",
      size === 'default' && "max-w-[1400px]",
      size === 'sm' && "max-w-3xl",
      size === 'md' && "max-w-4xl",
      size === 'lg' && "max-w-5xl",
      size === 'xl' && "max-w-7xl",
      className
    )}>
      {children}
    </div>
  )
}

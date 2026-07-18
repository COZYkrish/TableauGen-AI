import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  id?: string
  children: ReactNode
  className?: string
  background?: 'default' | 'card' | 'none'
}

export function Section({ id, children, className, background = 'default' }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "w-full relative overflow-hidden py-20 md:py-24 lg:py-28",
        background === 'card' && "bg-[var(--color-bg-card)]/40",
        background === 'none' && "",
        className
      )}
    >
      {children}
    </section>
  )
}

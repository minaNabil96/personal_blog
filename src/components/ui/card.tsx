import { type HTMLAttributes, type ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean
}

export function Card({ glass = false, className = '', children, ...props }: CardProps) {
  const classes = [
    'rounded-2xl border overflow-hidden',
    glass
      ? 'border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl shadow-xl'
      : 'border-zinc-800 bg-zinc-900',
    className,
  ].join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pb-0 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 flex items-center gap-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

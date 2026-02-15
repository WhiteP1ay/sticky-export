import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default: 'bg-sky-500 text-slate-950 hover:bg-sky-400',
        outline:
          'border border-slate-700 bg-transparent text-slate-50 hover:bg-slate-800/80',
        ghost:
          'bg-transparent text-slate-200 hover:bg-slate-800 hover:text-slate-50',
        destructive: 'bg-red-500 text-slate-50 hover:bg-red-400',
        subtle: 'bg-slate-800 text-slate-50 hover:bg-slate-700',
      },
      size: {
        default: 'h-9 px-3 py-1.5',
        sm: 'h-8 px-2.5 text-xs',
        lg: 'h-10 px-4',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/** 基础按钮组件：样式来源于 shadcn 风格，纯展示+交互 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'



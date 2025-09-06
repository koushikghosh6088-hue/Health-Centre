import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "relative bg-blue-600 text-white shadow-lg hover:shadow-blue-500/50 hover:bg-blue-700 active:bg-blue-800 hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:rounded-lg after:bg-white/20 after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        destructive:
          "relative bg-red-600 text-white shadow-lg hover:shadow-red-500/50 hover:bg-red-700 active:bg-red-800 hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:rounded-lg after:bg-white/20 after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        outline:
          "relative border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:rounded-lg after:bg-blue-100/50 after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        secondary:
          "relative bg-blue-500 text-white shadow-lg hover:shadow-blue-400/50 hover:bg-blue-600 active:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 after:absolute after:inset-0 after:rounded-lg after:bg-white/20 after:opacity-0 hover:after:opacity-100 after:transition-opacity",
        ghost: "relative hover:bg-blue-100 hover:text-blue-600 after:absolute after:inset-0 after:rounded-lg after:bg-blue-50 after:opacity-0 hover:after:opacity-100 after:transition-opacity duration-200",
        link: "relative text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 transition-colors hover:-translate-y-0.5 active:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

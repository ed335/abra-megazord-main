"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-verde-oliva focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-verde-oliva text-white shadow-sm hover:bg-verde-escuro",
        destructive:
          "bg-erro text-white shadow-sm hover:bg-erro/90 focus-visible:ring-erro",
        outline:
          "border border-cinza-claro bg-white shadow-sm hover:bg-off-white hover:text-verde-escuro",
        secondary:
          "bg-off-white text-cinza-escuro shadow-sm hover:bg-cinza-claro/50",
        ghost:
          "hover:bg-off-white hover:text-verde-escuro",
        link: "text-verde-oliva hover:text-verde-escuro transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg gap-1.5 px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "size-10",
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

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium tracking-wide transition-all duration-300 ease-[var(--ease-lux)] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-black [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-ink text-background hover:bg-foreground/90 active:translate-y-px",
        outline:
          "border border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-background",
        ghost: "text-ink hover:bg-line/60",
        secondary: "bg-line text-ink hover:bg-line/70",
        link: "text-ink underline-offset-4 hover:underline",
        quiet: "bg-transparent text-ink hover:opacity-60",
      },
      size: {
        default: "h-11 px-7 uppercase text-xs tracking-[0.18em]",
        sm: "h-9 px-4 uppercase text-[11px] tracking-[0.16em]",
        lg: "h-14 px-10 uppercase text-xs tracking-[0.2em]",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

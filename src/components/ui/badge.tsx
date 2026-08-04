import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        default: "border-ink/20 text-ink",
        solid: "bg-ink text-background border-ink",
        muted: "border-line bg-mist text-muted",
        success: "border-ink text-ink",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

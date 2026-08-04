"use client";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  serif?: boolean;
  description?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  serif = false,
  description,
  align = "left",
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        className,
      )}
    >
      <div className="flex w-full flex-wrap items-end justify-between gap-6">
        <div className={cn("flex flex-col gap-4", align === "center" && "items-center")}>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2 className={cn("editorial-title text-ink", serif && "editorial-serif")}>{title}</h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? <p className="max-w-xl text-[15px] leading-relaxed text-muted">{description}</p> : null}
    </div>
  );
}

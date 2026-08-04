"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";
import { useAuthStore } from "@/store/auth-store";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  label?: boolean;
  size?: "sm" | "md";
}

export function WishlistButton({ productId, className, label = false, size = "md" }: WishlistButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const [busy, setBusy] = useState(false);

  const inWishlist = ids.has(productId);

  const handleClick = async () => {
    if (!isAuthenticated) {
      toast("Sign in to save items", { description: "Create an account to build your wishlist." });
      router.push("/login?next=" + encodeURIComponent(window.location.pathname));
      return;
    }
    setBusy(true);
    try {
      await toggle(productId);
      toast(inWishlist ? "Removed from wishlist" : "Saved to wishlist", { duration: 1800 });
    } catch {
      toast.error("Could not update wishlist");
    } finally {
      setBusy(false);
    }
  };

  const buttonClass =
    size === "sm"
      ? "size-8 border border-ink/15"
      : "size-10 border border-ink/15";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={inWishlist}
      className={cn(
        "flex items-center justify-center bg-background/90 backdrop-blur transition-all duration-300 hover:border-ink disabled:opacity-50",
        buttonClass,
        className,
      )}
    >
      <Heart
        className={cn(
          "transition-transform duration-300",
          size === "sm" ? "size-3.5" : "size-4",
          inWishlist && "fill-ink text-ink",
        )}
      />
      {label ? (
        <span className={cn("ml-2 text-xs uppercase tracking-[0.16em]", inWishlist ? "text-ink" : "text-muted")}>
          {inWishlist ? "Saved" : "Save"}
        </span>
      ) : null}
    </button>
  );
}

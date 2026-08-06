"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { mediaService, type MediaAsset } from "@/services/media";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ImageInputProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  aspect?: "wide" | "portrait" | "square";
}

export function ImageInput({ value, onChange, label = "Image", aspect = "wide" }: ImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [libOpen, setLibOpen] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const asset = await mediaService.upload(file, file.name, "cms");
      onChange(asset.url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const pick = (asset: MediaAsset) => {
    onChange(asset.url);
    setLibOpen(false);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <div className="flex items-start gap-3">
        <div
          className={`relative shrink-0 overflow-hidden border border-line bg-mist ${
            aspect === "wide" ? "aspect-[16/9] w-36" : aspect === "square" ? "aspect-square w-24" : "aspect-[3/4] w-24"
          }`}
        >
          {value ? (
            <Image src={value} alt={label} fill sizes="144px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted">
              <span className="text-[10px]">No image</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
            >
              {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
              Upload
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setLibOpen(true)}>
              <RefreshCw className="size-3.5" /> Library
            </Button>
            {value ? (
              <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}>
                <Trash2 className="size-3.5" /> Clear
              </Button>
            ) : null}
          </div>
          <Input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image URL"
            className="text-sm"
          />
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      <MediaLibraryDialog open={libOpen} onOpenChange={setLibOpen} onPick={pick} />
    </div>
  );
}

function MediaLibraryDialog({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (asset: MediaAsset) => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!open) return;
    setLoading(true);
    try {
      setAssets(await mediaService.list({ perPage: 60 }));
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (v) void load(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Media library</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" /> Loading media…
          </div>
        ) : assets.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            <p className="mb-4">No media uploaded yet.</p>
            <Button type="button" variant="outline" size="sm" onClick={() => { onOpenChange(false); }}>
              Close
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => onPick(asset)}
                className="group relative aspect-square overflow-hidden border border-line bg-mist"
              >
                <Image src={asset.thumbUrl ?? asset.url} alt={asset.originalName} fill sizes="160px" className="object-cover transition-transform duration-300 group-hover:scale-105" />
                <span className="absolute inset-x-0 bottom-0 truncate bg-ink/70 px-2 py-1 text-left text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100">
                  {asset.originalName}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="mt-6 flex items-center justify-end">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="mr-2 size-3.5" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

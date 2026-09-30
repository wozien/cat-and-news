import { Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
        <Newspaper className="size-4" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        Cat <span className="text-muted-foreground">&</span> News
      </span>
    </div>
  );
}

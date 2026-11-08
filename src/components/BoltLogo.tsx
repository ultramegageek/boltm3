import logo from "@/assets/bolt-logo-new.jpeg.asset.json";
import { cn } from "@/lib/utils";

export function BoltLogo({ className }: { className?: string }) {
  return <img src={logo.url} alt="bolt.m3 logo" className={cn("size-10 shrink-0 rounded-md object-cover", className)} />;
}
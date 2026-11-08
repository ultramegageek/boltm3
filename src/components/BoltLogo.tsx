import logo from "@/assets/bolt-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function BoltLogo({ className }: { className?: string }) {
  return <img src={logo.url} alt="bolt.m3 logo" className={cn("size-10 shrink-0 object-contain", className)} />;
}
declare module "lucide-react" {
  import type { FC, SVGProps } from "react";
  export type LucideProps = SVGProps<SVGSVGElement> & { size?: number | string };
  export type LucideIcon = FC<LucideProps>;
  export const Battery: LucideIcon;
  export const Bluetooth: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const MapPin: LucideIcon;
  export const Music: LucideIcon;
  export const Plane: LucideIcon;
  export const Shield: LucideIcon;
  export const Sliders: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Wifi: LucideIcon;
  export const Zap: LucideIcon;
}

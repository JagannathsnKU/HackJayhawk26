"use client";

/**
 * Nexus command layout — typography, motion, and metric panels inspired by the spatial showcase pattern.
 * Product imagery uses Unsplash (travel / operations). No earbud hardware or rotating product rings.
 */

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Battery,
  Sliders,
  ChevronRight,
  Zap,
  Shield,
  Plane,
  MapPin,
  LucideIcon,
} from "lucide-react";

export type ModuleId = "routes" | "vault";

export interface FeatureMetric {
  label: string;
  value: number;
  icon: LucideIcon;
}

export interface ModuleData {
  id: ModuleId;
  label: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  colors: {
    gradient: string;
    glow: string;
    ring: string;
  };
  stats: {
    connectionStatus: string;
    batteryLevel: number;
  };
  features: FeatureMetric[];
}

const MODULE_DATA: Record<ModuleId, ModuleData> = {
  routes: {
    id: "routes",
    label: "Routing",
    title: "Corridor sync",
    description:
      "Live corridor intelligence merges weather, crew windows, and policy so every leg stays inside guardrails without manual rework.",
    image:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=960&q=80",
    imageAlt: "Desert highway at dusk",
    colors: {
      gradient: "from-sky-600 to-indigo-950",
      glow: "bg-sky-400",
      ring: "border-sky-500/40",
    },
    stats: { connectionStatus: "Live mesh", batteryLevel: 92 },
    features: [
      { label: "Latency budget", value: 88, icon: Zap },
      { label: "Coverage", value: 96, icon: Plane },
    ],
  },
  vault: {
    id: "vault",
    label: "Treasury",
    title: "Policy vault",
    description:
      "Immutable policy snapshots, signed approvals, and treasury hooks keep spend aligned with what legal actually approved.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=960&q=80",
    imageAlt: "Analytics dashboards on a screen",
    colors: {
      gradient: "from-emerald-600 to-teal-950",
      glow: "bg-emerald-400",
      ring: "border-emerald-500/40",
    },
    stats: { connectionStatus: "Anchored", batteryLevel: 78 },
    features: [
      { label: "Compliance", value: 94, icon: Shield },
      { label: "Geo fidelity", value: 90, icon: MapPin },
    ],
  },
};

const ANIMATIONS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
    exit: { opacity: 0, y: -10, filter: "blur(5px)" },
  },
  image: (flip: boolean): Variants => ({
    initial: {
      opacity: 0,
      scale: 1.08,
      filter: "blur(12px)",
      x: flip ? -40 : 40,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      x: 0,
      transition: { type: "spring", stiffness: 220, damping: 24 },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      filter: "blur(16px)",
      transition: { duration: 0.22 },
    },
  }),
};

const BackgroundGradient = ({ flip }: { flip: boolean }) => (
  <div className="pointer-events-none fixed inset-0">
    <motion.div
      animate={{
        background: flip
          ? "radial-gradient(circle at 0% 45%, rgba(56, 189, 248, 0.14), transparent 55%)"
          : "radial-gradient(circle at 100% 45%, rgba(52, 211, 153, 0.14), transparent 55%)",
      }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0"
    />
  </div>
);

const ModuleVisual = ({ data, flip }: { data: ModuleData; flip: boolean }) => (
  <motion.div layout="position" className="group relative w-full max-w-md shrink-0">
    <motion.div
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute inset-[-8%] rounded-[2rem] bg-gradient-to-br ${data.colors.gradient} opacity-35 blur-3xl`}
    />
    <div
      className={`relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/30 shadow-2xl shadow-black/50 backdrop-blur-md ${data.colors.ring}`}
    >
      <div className="relative aspect-[4/5] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={data.id}
            variants={ANIMATIONS.image(flip)}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0"
          >
            <Image
              src={data.image}
              alt={data.imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    <motion.div
      layout="position"
      className="absolute -bottom-10 left-1/2 w-max -translate-x-1/2"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/85 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-400 backdrop-blur">
        <span className={`h-1.5 w-1.5 rounded-full ${data.colors.glow} animate-pulse`} />
        {data.stats.connectionStatus}
      </div>
    </motion.div>
  </motion.div>
);

const ModuleDetails = ({ data, flip }: { data: ModuleData; flip: boolean }) => {
  const alignClass = flip ? "items-start text-left" : "items-end text-right";
  const flexDirClass = flip ? "flex-row" : "flex-row-reverse";
  const barColorClass = flip ? "left-0 bg-sky-500" : "right-0 bg-emerald-500";

  return (
    <motion.div
      variants={ANIMATIONS.container}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex flex-col ${alignClass}`}
    >
      <motion.h2
        variants={ANIMATIONS.item}
        className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500"
      >
        {data.label} layer
      </motion.h2>
      <motion.h1
        variants={ANIMATIONS.item}
        className="mb-2 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl"
      >
        {data.title}
      </motion.h1>
      <motion.p
        variants={ANIMATIONS.item}
        className={`mb-8 max-w-sm leading-relaxed text-zinc-400 ${flip ? "mr-auto" : "ml-auto"}`}
      >
        {data.description}
      </motion.p>

      <motion.div
        variants={ANIMATIONS.item}
        className="w-full space-y-6 rounded-2xl border border-white/5 bg-zinc-900/45 p-6 backdrop-blur-sm"
      >
        {data.features.map((feature, idx) => (
          <div key={feature.label} className="group">
            <div
              className={`mb-3 flex items-center justify-between text-sm ${flexDirClass}`}
            >
              <div
                className={`flex items-center gap-2 ${feature.value > 50 ? "text-zinc-200" : "text-zinc-400"}`}
              >
                <feature.icon size={16} /> <span>{feature.label}</span>
              </div>
              <span className="font-mono text-xs text-zinc-500">{feature.value}%</span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${feature.value}%` }}
                transition={{ duration: 0.9, delay: 0.35 + idx * 0.12 }}
                className={`absolute top-0 bottom-0 ${barColorClass} opacity-85`}
              />
            </div>
          </div>
        ))}

        <div className={`flex pt-4 ${flip ? "justify-start" : "justify-end"}`}>
          <button
            type="button"
            className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-300 transition-colors hover:text-white"
          >
            <Sliders size={14} /> View specs
            <ChevronRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={ANIMATIONS.item}
        className={`mt-6 flex items-center gap-3 text-zinc-500 ${flexDirClass}`}
      >
        <Battery size={16} />
        <span className="text-sm font-medium">{data.stats.batteryLevel}% reserve</span>
      </motion.div>
    </motion.div>
  );
};

const ModuleSwitcher = ({
  activeId,
  onToggle,
}: {
  activeId: ModuleId;
  onToggle: (id: ModuleId) => void;
}) => {
  const options = Object.values(MODULE_DATA).map((m) => ({ id: m.id, label: m.label }));

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-10 z-50 flex justify-center">
      <motion.div
        layout
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900/85 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/5 backdrop-blur-2xl"
      >
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            type="button"
            onClick={() => onToggle(opt.id)}
            whileTap={{ scale: 0.96 }}
            className="relative flex h-11 w-28 items-center justify-center rounded-full text-sm font-medium focus:outline-none"
          >
            {activeId === opt.id && (
              <motion.div
                layoutId="nexus-island"
                className="absolute inset-0 rounded-full bg-gradient-to-b from-white/12 to-white/5 shadow-inner"
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-300 ${activeId === opt.id ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              {opt.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default function NexusSpatialShowcase() {
  const [active, setActive] = useState<ModuleId>("routes");
  const current = MODULE_DATA[active];
  const flip = active === "routes";

  return (
    <div className="relative flex min-h-[calc(100dvh-6rem)] w-full flex-col items-center justify-center overflow-hidden bg-transparent text-zinc-100 selection:bg-zinc-800">
      <BackgroundGradient flip={flip} />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-center px-6 py-10 md:py-16">
        <motion.div
          layout
          transition={{ type: "spring", bounce: 0, duration: 0.85 }}
          className={`flex w-full flex-col items-center justify-center gap-14 md:gap-24 lg:gap-32 ${
            flip ? "md:flex-row" : "md:flex-row-reverse"
          }`}
        >
          <ModuleVisual data={current} flip={flip} />
          <motion.div layout="position" className="w-full max-w-md pb-24 md:pb-8">
            <AnimatePresence mode="wait">
              <ModuleDetails key={active} data={current} flip={flip} />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      <ModuleSwitcher activeId={active} onToggle={setActive} />
    </div>
  );
}

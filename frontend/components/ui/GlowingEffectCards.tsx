"use client";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function GlowingEffectCards() {
  const cards = [
    {
      title: "Create Agent",
      description:
        "Build your custom AI trading agent with our intuitive interface",
      icon: "🤖",
      gradient: "from-blue-500/20 via-purple-500/20 to-pink-500/20",
    },
    {
      title: "Manage Strategy",
      description: "Monitor and adjust your trading strategies in real-time",
      icon: "📊",
      gradient: "from-green-500/20 via-teal-500/20 to-blue-500/20",
    },
    {
      title: "Scale Operations",
      description: "Easily scale your successful trading strategies",
      icon: "📈",
      gradient: "from-orange-500/20 via-red-500/20 to-purple-500/20",
    },
  ];

  return (
    <div className="relative w-full">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 animate-gradient-slow" />

      {/* Cards Grid */}
      <div className="relative z-10">
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
          <GridItem
            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
            {...cards[0]}
          />
          <GridItem
            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
            {...cards[1]}
          />
          <GridItem
            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
            {...cards[2]}
          />
          <GridItem
            area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
            {...cards[0]}
          />
          <GridItem
            area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
            {...cards[1]}
          />
        </ul>
      </div>
    </div>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  gradient: string;
}

const GridItem:any = ({
  area,
  icon,
  title,
  description,
  gradient,
}: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area} group`}>
      <div className="relative h-full rounded-2.5xl border p-2 md:rounded-3xl md:p-3 transition-transform duration-300 hover:scale-[1.02]">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div
          className={`relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-0.75 p-6 bg-gradient-to-br ${gradient} backdrop-blur-sm transition-all duration-300 group-hover:bg-opacity-30 dark:shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6`}
        >
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-600/30 p-2 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl/[1.375rem] font-semibold font-sans -tracking-4 md:text-2xl/[1.875rem] text-balance text-black dark:text-white transition-colors">
                {title}
              </h3>
              <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm/[1.125rem] md:text-base/[1.375rem] text-black/80 dark:text-neutral-400">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default GlowingEffectCards;

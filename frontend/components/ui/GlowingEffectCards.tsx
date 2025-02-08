"use client";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export function GlowingEffectCards() {
  const cards: any = [
    {
      title: "Create Agent",
      description:
        "Build your custom AI trading agent with our intuitive interface",
      icon: "🤖",
    },
    {
      title: "Manage Strategy",
      description: "Monitor and adjust your trading strategies in real-time",
      icon: "📊",
    },
    {
      title: "Scale Operations",
      description: "Easily scale your successful trading strategies",
      icon: "📈",
    },
  ];

  return (
    <div className="relative w-full">
      {/* FlickeringGrid Background */}
      <div className="absolute inset-0 overflow-hidden w-full">
        <FlickeringGrid
          className="absolute inset-0 z-0 "
          squareSize={4}
          gridGap={6}
          color="#6B7280"
          maxOpacity={0.5}
          flickerChance={0.1}
          height={1200}
        />
      </div>

      {/* Cards Grid */}
      <div className="relative z-10">
        <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
          <GridItem
            area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
            icon={cards[0].icon}
            title={cards[0].title}
            description={cards[0].description}
          />

          <GridItem
            area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
            icon={cards[1].icon}
            title={cards[1].title}
            description={cards[1].description}
          />

          <GridItem
            area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
            icon={cards[2].icon}
            title={cards[2].title}
            description={cards[2].description}
          />

          <GridItem
            area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
            icon={cards[0].icon}
            title={cards[0].title}
            description={cards[0].description}
          />

          <GridItem
            area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
            icon={cards[0].icon}
            title={cards[0].title}
            description={cards[0].description}
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
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      <div className="relative h-full rounded-2.5xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-0.75 p-6 bg-white/30 backdrop-blur-sm dark:bg-black/80 dark:shadow-[0px_0px_27px_0px_#2D2D2D] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-gray-600 p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl/[1.375rem] font-semibold font-sans -tracking-4 md:text-2xl/[1.875rem] text-balance text-black dark:text-white">
                {title}
              </h3>
              <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm/[1.125rem] md:text-base/[1.375rem] text-black dark:text-neutral-400">
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

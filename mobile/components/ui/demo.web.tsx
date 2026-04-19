import { CosmicParallaxBg } from './parallax-cosmic-background';

/**
 * Standalone demo (web). Use in a route or Storybook if you add one.
 * Welcome screen uses the same `CosmicParallaxBg` with Nexus copy.
 */
const DemoOne = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <CosmicParallaxBg head="Nexus" text="Secured, Safe, Travel" loop />
    </div>
  );
};

export { DemoOne };

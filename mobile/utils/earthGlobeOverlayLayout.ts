/** Must match `CosmicParallaxBg` earth mask (diameter + bottom offset). */
export const EARTH_DIAMETER_FACTOR = 1.78838;
const EARTH_BOTTOM_FACTOR = -0.42;

export function getEarthGlobeLayout(windowWidth: number) {
  const earthDiameter = Math.max(1, windowWidth) * EARTH_DIAMETER_FACTOR;
  const earthBottom = EARTH_BOTTOM_FACTOR * earthDiameter;
  const earthLeft = (windowWidth - earthDiameter) / 2;
  const earthRadius = earthDiameter / 2;
  return { earthDiameter, earthBottom, earthLeft, earthRadius };
}

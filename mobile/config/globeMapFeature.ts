/**
 * Globe tap → map screen. Set to `false` to disable the overlay and avoid any
 * map navigation from the backdrop (quick revert if something misbehaves).
 */
export const GLOBE_MAP_FROM_GLOBE_ENABLED = true;

/**
 * Only these stack routes get the invisible globe hit target. Everywhere else
 * the globe stays purely visual (no tap interception).
 *
 * `MainHome` is the first hub screen after Welcome (Continue / post sign-in).
 */
export const GLOBE_MAP_ROUTE_NAMES = ['MainHome'] as const;

export type GlobeMapHostRouteName = (typeof GLOBE_MAP_ROUTE_NAMES)[number];

export function isGlobeMapHostRoute(name: string | undefined): name is GlobeMapHostRouteName {
  return name != null && (GLOBE_MAP_ROUTE_NAMES as readonly string[]).includes(name);
}

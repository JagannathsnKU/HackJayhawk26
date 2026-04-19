/** Globe tap map — iconic Tokyo landmark (Marunouchi side). */
export const TOKYO_GLOBE_FOCUS = {
  latitude: 35.681236,
  longitude: 139.767125,
  title: 'Tokyo Station',
  description: 'Marunouchi · Chiyoda City',
};

/** Pins for the current-trip “Navigation” map (central Tokyo, tight framing). */
export type TokyoTripPin = {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
};

export const TOKYO_TRIP_PINS: TokyoTripPin[] = [
  {
    id: 'tokyo-st',
    title: 'Tokyo Station',
    description: 'JR Chūō · Yamanote interchange · Marunouchi exit',
    latitude: 35.681236,
    longitude: 139.767125,
  },
  {
    id: 'otemachi',
    title: 'Ōtemachi Financial City',
    description: 'Morning brief · Tower B conference level',
    latitude: 35.687291,
    longitude: 139.763306,
  },
  {
    id: 'imperial-east',
    title: 'Imperial Palace East Garden',
    description: 'Walking route to next meeting · 12 minutes',
    latitude: 35.6852,
    longitude: 139.7528,
  },
  {
    id: 'ginza',
    title: 'Ginza · Corridor Street',
    description: 'Lunch reservation · kaiseki · 12:45',
    latitude: 35.6717,
    longitude: 139.765,
  },
  {
    id: 'shinjuku',
    title: 'Shinjuku · Nishiguchi',
    description: 'Hotel check-in · baggage hold until room ready',
    latitude: 35.6896,
    longitude: 139.7006,
  },
  {
    id: 'roppongi',
    title: 'Roppongi Hills Mori Tower',
    description: 'Evening partner office · 52F reception',
    latitude: 35.6605,
    longitude: 139.7292,
  },
];

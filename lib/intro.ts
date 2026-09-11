import type { ContentSettings } from './content-settings';
export const introSeenKey = 'aat_intro_seen';
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export function introStages(s: ContentSettings) {
  const target: [number, number] = [s.longitude, s.latitude];
  return [
    {
      label: 'WORLD',
      log: 'SEARCH REGION',
      center: [0, 20] as [number, number],
      zoom: 1.3,
    },
    {
      label: 'EUROPE',
      log: 'REGION ACQUIRED',
      center: [15, 51] as [number, number],
      zoom: 3.7,
    },
    {
      label: s.locationCountry.toUpperCase(),
      log: 'COUNTRY ACQUIRED',
      center: [s.longitude, s.latitude - 1.5] as [number, number],
      zoom: 6,
    },
    {
      label: s.locationCounty.toUpperCase(),
      log: 'COUNTY ACQUIRED',
      center: [s.longitude, s.latitude + 0.05] as [number, number],
      zoom: 9,
    },
    {
      label: s.locationName.toUpperCase(),
      log: 'LOCAL SECTOR',
      center: target,
      zoom: 13,
    },
    {
      label: 'EXACT COORDINATES',
      log: 'COORDINATES LOCKED',
      center: target,
      zoom: 16.5,
    },
  ];
}
export function coordinates(
  s: Pick<ContentSettings, 'latitude' | 'longitude'>,
) {
  return `${Math.abs(s.latitude).toFixed(6)} ${s.latitude < 0 ? 'S' : 'N'} / ${Math.abs(s.longitude).toFixed(6)} ${s.longitude < 0 ? 'W' : 'E'}`;
}

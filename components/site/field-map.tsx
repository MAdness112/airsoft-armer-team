'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { ContentSettings } from '@/lib/content-settings';
import { coordinates } from '@/lib/intro';
import { TargetMarker } from './target-marker';
const GeoMap = dynamic(() => import('./geo-map'), { ssr: false });
export function FieldMap({ settings }: { settings: ContentSettings }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="home-field-map">
      {!failed && (
        <GeoMap
          center={[settings.longitude, settings.latitude]}
          zoom={13}
          duration={0}
          transitionId={0}
          onFailure={() => setFailed(true)}
        />
      )}
      <TargetMarker />
      <a
        href={`https://www.openstreetmap.org/?mlat=${settings.latitude}&mlon=${settings.longitude}#map=16/${settings.latitude}/${settings.longitude}`}
        target="_blank"
        rel="noreferrer"
      >
        {coordinates(settings)} ↗
      </a>
      {failed && (
        <span className="field-map-fallback">
          {settings.locationName} // MAP UNAVAILABLE
        </span>
      )}
    </div>
  );
}

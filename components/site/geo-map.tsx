'use client';

import { useEffect, useRef } from 'react';
import { AttributionControl, Map as LibreMap } from 'maplibre-gl';
import type { LayerSpecification, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { easeInOutCubic } from '@/lib/intro';

export interface MapDiagnostics {
  center: [number, number];
  zoom: number;
  mapLoaded: boolean;
  styleLoaded: boolean;
  tileErrors: string[];
}

const satelliteTileUrl =
  process.env.NEXT_PUBLIC_SATELLITE_TILE_URL ||
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

const satelliteAttribution =
  process.env.NEXT_PUBLIC_SATELLITE_ATTRIBUTION ||
  'Source: Esri, Vantor, Earthstar Geographics, and the GIS User Community';

const defaultSatelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [satelliteTileUrl],
      tileSize: 256,
      maxzoom: 19,
      attribution: satelliteAttribution,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#080b0e' },
    },
    {
      id: 'satellite-imagery',
      type: 'raster',
      source: 'satellite',
      paint: {
        'raster-opacity': 1,
        'raster-fade-duration': 120,
        'raster-brightness-max': 0.92,
        'raster-contrast': 0.08,
        'raster-saturation': -0.18,
      },
    },
  ],
};

const boundaryLayerIds = [
  'europe-fill',
  'europe-line',
  'romania-fill',
  'romania-line',
  'suceava-fill',
  'suceava-glow',
  'suceava-line',
] as const;

function addBoundaryLayers(instance: LibreMap) {
  if (!instance.getSource('europe-boundary')) {
    instance.addSource('europe-boundary', {
      type: 'geojson',
      data: '/geo/europe.geojson',
    });
  }
  if (!instance.getSource('romania-boundary')) {
    instance.addSource('romania-boundary', {
      type: 'geojson',
      data: '/geo/romania.geojson',
      attribution: 'geoBoundaries / StatSilk (CC BY 3.0)',
    });
  }
  if (!instance.getSource('suceava-boundary')) {
    instance.addSource('suceava-boundary', {
      type: 'geojson',
      data: '/geo/suceava.geojson',
      attribution: 'geoBoundaries / World Bank (CC BY 4.0)',
    });
  }

  const layers: LayerSpecification[] = [
    {
      id: 'europe-fill',
      type: 'fill',
      source: 'europe-boundary',
      paint: {
        'fill-color': '#b9c7ce',
        'fill-opacity': 0,
        'fill-opacity-transition': { duration: 420 },
      },
    },
    {
      id: 'europe-line',
      type: 'line',
      source: 'europe-boundary',
      paint: {
        'line-color': '#c3d0d6',
        'line-width': 0.85,
        'line-opacity': 0,
        'line-blur': 0.35,
        'line-opacity-transition': { duration: 420 },
      },
    },
    {
      id: 'romania-fill',
      type: 'fill',
      source: 'romania-boundary',
      paint: {
        'fill-color': '#d31f26',
        'fill-opacity': 0,
        'fill-opacity-transition': { duration: 380 },
      },
    },
    {
      id: 'romania-line',
      type: 'line',
      source: 'romania-boundary',
      paint: {
        'line-color': '#e05257',
        'line-width': 1.45,
        'line-opacity': 0,
        'line-blur': 0.25,
        'line-opacity-transition': { duration: 380 },
      },
    },
    {
      id: 'suceava-fill',
      type: 'fill',
      source: 'suceava-boundary',
      paint: {
        'fill-color': '#d31f26',
        'fill-opacity': 0,
        'fill-opacity-transition': { duration: 360 },
      },
    },
    {
      id: 'suceava-glow',
      type: 'line',
      source: 'suceava-boundary',
      paint: {
        'line-color': '#d31f26',
        'line-width': 4,
        'line-opacity': 0,
        'line-blur': 3,
        'line-opacity-transition': { duration: 360 },
      },
    },
    {
      id: 'suceava-line',
      type: 'line',
      source: 'suceava-boundary',
      paint: {
        'line-color': '#e05a5f',
        'line-width': 1.35,
        'line-opacity': 0,
        'line-opacity-transition': { duration: 360 },
      },
    },
  ];

  for (const layer of layers) {
    if (!instance.getLayer(layer.id)) instance.addLayer(layer);
  }
}

function showBoundaryStage(instance: LibreMap, stage: number) {
  const opacity: Record<(typeof boundaryLayerIds)[number], number> = {
    'europe-fill': stage === 1 ? 0.035 : 0,
    'europe-line': stage === 1 ? 0.52 : 0,
    'romania-fill': stage === 2 ? 0.09 : 0,
    'romania-line': stage === 2 ? 0.9 : 0,
    'suceava-fill': stage === 3 ? 0.055 : 0,
    'suceava-glow': stage === 3 ? 0.26 : 0,
    'suceava-line': stage === 3 ? 0.92 : 0,
  };
  for (const id of boundaryLayerIds) {
    if (!instance.getLayer(id)) continue;
    instance.setPaintProperty(
      id,
      id.endsWith('fill') ? 'fill-opacity' : 'line-opacity',
      opacity[id],
    );
  }
}

export default function GeoMap({
  center,
  zoom,
  duration = 700,
  transitionId,
  debug = false,
  onFailure,
  onMoveEnd,
  onDiagnostics,
}: {
  center: [number, number];
  zoom: number;
  duration?: number;
  transitionId: number;
  debug?: boolean;
  onFailure?: () => void;
  onMoveEnd?: (transitionId: number) => void;
  onDiagnostics?: (diagnostics: MapDiagnostics) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LibreMap | null>(null);
  const loaded = useRef(false);
  const styleLoaded = useRef(false);
  const activeTransition = useRef(transitionId);
  const callbacks = useRef({ onFailure, onMoveEnd, onDiagnostics });
  const initial = useRef({ center, zoom, transitionId });
  callbacks.current = { onFailure, onMoveEnd, onDiagnostics };
  const [longitude, latitude] = center;

  useEffect(() => {
    if (!container.current) return;
    let active = true;
    let styleTimeout: ReturnType<typeof setTimeout>;
    const tileErrors: string[] = [];
    const report = (instance: LibreMap) => {
      const current = instance.getCenter();
      callbacks.current.onDiagnostics?.({
        center: [current.lng, current.lat],
        zoom: instance.getZoom(),
        mapLoaded: loaded.current,
        styleLoaded: styleLoaded.current,
        tileErrors: [...tileErrors],
      });
    };
    try {
      const instance = new LibreMap({
        container: container.current,
        style:
          process.env.NEXT_PUBLIC_SATELLITE_STYLE_URL ||
          process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
          defaultSatelliteStyle,
        center: initial.current.center,
        zoom: initial.current.zoom,
        interactive: false,
        attributionControl: false,
        fadeDuration: 100,
        renderWorldCopies: true,
      });
      map.current = instance;
      activeTransition.current = initial.current.transitionId;
      instance.addControl(
        new AttributionControl({ compact: true }),
        'top-right',
      );
      const resize = () => {
        if (active) {
          instance.resize();
          report(instance);
        }
      };
      requestAnimationFrame(() => requestAnimationFrame(resize));
      instance.on('load', () => {
        if (!active) return;
        clearTimeout(styleTimeout);
        loaded.current = true;
        styleLoaded.current = true;
        if (process.env.NODE_ENV !== 'production') {
          console.log('MAP LOADED');
          console.log('MAP STYLE LOADED');
        }
        instance.resize();
        addBoundaryLayers(instance);
        showBoundaryStage(instance, activeTransition.current);
        report(instance);
        callbacks.current.onMoveEnd?.(activeTransition.current);
      });
      instance.on('styledata', () => {
        if (!active || !instance.isStyleLoaded()) return;
        styleLoaded.current = true;
        clearTimeout(styleTimeout);
        if (process.env.NODE_ENV !== 'production')
          console.log('MAP STYLE LOADED');
        report(instance);
      });
      instance.on('move', () => {
        if (debug) report(instance);
      });
      instance.on('moveend', () => {
        if (!active || !loaded.current) return;
        report(instance);
        callbacks.current.onMoveEnd?.(activeTransition.current);
      });
      instance.on('error', (event) => {
        const message = event.error?.message || 'Unknown MapLibre error';
        tileErrors.push(message);
        if (tileErrors.length > 6) tileErrors.shift();
        console.error('MAP TILE/STYLE ERROR', event.error || event);
        report(instance);
      });
      instance.on('webglcontextlost', () => {
        console.error('MAP WEBGL CONTEXT LOST');
        callbacks.current.onFailure?.();
      });
      styleTimeout = setTimeout(() => {
        if (active && !instance.isStyleLoaded()) {
          console.error('MAP STYLE LOAD TIMEOUT');
          callbacks.current.onFailure?.();
        }
      }, 10_000);
      return () => {
        active = false;
        clearTimeout(styleTimeout);
        loaded.current = false;
        styleLoaded.current = false;
        instance.stop();
        instance.remove();
        map.current = null;
      };
    } catch (error) {
      console.error('MAP INITIALIZATION ERROR', error);
      callbacks.current.onFailure?.();
    }
  }, [debug]);

  useEffect(() => {
    const instance = map.current;
    if (!instance || !loaded.current) return;
    instance.stop();
    activeTransition.current = transitionId;
    showBoundaryStage(instance, transitionId);
    instance.flyTo({
      center: [longitude, latitude],
      zoom,
      duration,
      easing: easeInOutCubic,
      // Reduced-motion users receive duration 0 from MapIntro. Mark the remaining
      // flights essential so MapLibre does not silently collapse camera stages.
      essential: true,
    });
  }, [longitude, latitude, zoom, duration, transitionId]);

  return (
    <div
      ref={container}
      className="geo-map map-layer"
      aria-label="Satellite location map"
      data-map-layer="real-map"
    />
  );
}

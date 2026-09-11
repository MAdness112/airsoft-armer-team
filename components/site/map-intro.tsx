'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ContentSettings } from '@/lib/content-settings';
import { coordinates, introSeenKey, introStages } from '@/lib/intro';
import type { MapDiagnostics } from './geo-map';
import { TargetMarker } from './target-marker';

const GeoMap = dynamic(() => import('./geo-map'), { ssr: false });

export function MapIntro({
  settings,
  force = false,
  onComplete,
}: {
  settings: ContentSettings;
  force?: boolean;
  onComplete?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [targetStage, setTargetStage] = useState(0);
  const [settledStage, setSettledStage] = useState(-1);
  const [leaving, setLeaving] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [mapActive, setMapActive] = useState(false);
  const [mapDebug, setMapDebug] = useState(false);
  const [diagnostics, setDiagnostics] = useState<MapDiagnostics>({
    center: [0, 20],
    zoom: 1.3,
    mapLoaded: false,
    styleLoaded: false,
    tileErrors: [],
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const done = useRef(false);
  const lastCompleted = useRef(-1);
  const oldOverflow = useRef<string | null>(null);
  const finishCallback = useRef(onComplete);
  finishCallback.current = onComplete;
  const stages = useMemo(() => introStages(settings), [settings]);
  const cameraDuration = mapDebug
    ? 1600
    : Math.max(450, Math.min(900, (settings.introDuration * 1000 - 2200) / 5));

  const finish = useCallback((skip = false) => {
    if (done.current) return;
    done.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    try {
      sessionStorage.setItem(introSeenKey, 'true');
    } catch {}
    if (oldOverflow.current !== null)
      document.body.style.overflow = oldOverflow.current;
    if (skip) {
      setMapActive(false);
      setVisible(false);
      finishCallback.current?.();
      return;
    }
    setLeaving(true);
    timers.current.push(
      setTimeout(() => {
        setMapActive(false);
        setVisible(false);
        finishCallback.current?.();
      }, 450),
    );
  }, []);

  useEffect(() => {
    let seen = false;
    try {
      seen =
        sessionStorage.getItem(introSeenKey) === 'true' ||
        sessionStorage.getItem('aat-intro-seen') === '1';
    } catch {}
    const query = new URLSearchParams(location.search);
    const forced = force || query.get('intro') === '1';
    if (!forced && (!settings.introEnabled || (settings.introOnce && seen)))
      return;
    done.current = false;
    lastCompleted.current = -1;
    setVisible(true);
    setLeaving(false);
    setTargetStage(0);
    setSettledStage(-1);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(reduce);
    setMapDebug(
      process.env.NODE_ENV !== 'production' && query.get('mapDebug') === '1',
    );
    const offline = query.get('introFallback') === '1';
    setFallback(offline || !settings.introMapEnabled);
    setMapActive(!offline && settings.introMapEnabled);
    oldOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      if (oldOverflow.current !== null)
        document.body.style.overflow = oldOverflow.current;
    };
  }, [
    force,
    settings.introEnabled,
    settings.introMapEnabled,
    settings.introOnce,
  ]);

  useEffect(() => {
    if (!visible || !fallback) return;
    const timer = setTimeout(
      () => {
        setSettledStage(targetStage);
        if (targetStage < 5) setTargetStage((current) => current + 1);
        else timers.current.push(setTimeout(() => finish(), 1400));
      },
      reduced ? 250 : cameraDuration,
    );
    return () => clearTimeout(timer);
  }, [cameraDuration, fallback, finish, reduced, targetStage, visible]);

  useEffect(() => {
    if (!visible) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, finish]);

  const handleMoveEnd = useCallback(
    (completedStage: number) => {
      if (
        !visible ||
        fallback ||
        completedStage !== targetStage ||
        completedStage <= lastCompleted.current
      )
        return;
      lastCompleted.current = completedStage;
      setSettledStage(completedStage);
      if (reduced || completedStage === 5)
        timers.current.push(
          setTimeout(() => finish(), reduced ? 1200 : mapDebug ? 4000 : 1600),
        );
      else
        timers.current.push(
          setTimeout(
            () => setTargetStage((current) => Math.min(5, current + 1)),
            180,
          ),
        );
    },
    [fallback, finish, mapDebug, reduced, targetStage, visible],
  );

  const fail = useCallback(() => {
    setFallback(true);
    setMapActive(false);
  }, []);
  if (!visible) return null;
  const phase = stages[targetStage];
  const locked = settledStage >= 5;
  return (
    <dialog
      open
      className={`geo-intro ${leaving ? 'leaving' : ''} ${reduced ? 'reduced' : ''}`}
      aria-label="AAT geolocation introduction"
      aria-modal="true"
      data-stage={targetStage}
      data-settled-stage={settledStage}
      data-mode={fallback ? 'fallback' : 'map'}
      data-target={`${settings.longitude},${settings.latitude}`}
    >
      <div className="geo-visual shown" aria-hidden="true">
        {mapActive && !fallback && (
          <GeoMap
            center={phase.center}
            zoom={phase.zoom}
            duration={reduced ? 0 : targetStage === 0 ? 0 : cameraDuration}
            transitionId={targetStage}
            debug={mapDebug}
            onFailure={fail}
            onMoveEnd={handleMoveEnd}
            onDiagnostics={setDiagnostics}
          />
        )}
        <div className="geo-dark-overlay" />
        <div
          className={`geo-grid ${fallback ? 'fallback' : ''}`}
          style={{
            backgroundSize: `${Math.max(24, 120 - targetStage * 17)}px ${Math.max(24, 120 - targetStage * 17)}px`,
          }}
        />
        {fallback && (
          <div className="geo-fallback-region" key={phase.label}>
            {phase.label}
            <small>OFFLINE GEOINT // CONCEPTUAL LOCATION</small>
          </div>
        )}
        <div className="geo-vignette" />
      </div>
      <div className="geo-ui">
        {settings.introShowBlackice && (
          <img
            className="blackice-watermark"
            src={settings.blackiceSymbolUrl}
            alt=""
            aria-hidden="true"
          />
        )}
        <header className="geo-header">
          <span>AAT // GEOLOCATION SYSTEM</span>
          <span>{locked ? 'SIGNAL 100%' : 'GEOINT ACTIVE'}</span>
        </header>
        {settledStage < 0 && (
          <div className="geo-initial">INITIALIZING MAP...</div>
        )}
        {targetStage > 0 && !locked && (
          <div
            key={`stage-label-${targetStage}`}
            className={`geo-stage-label ${targetStage >= 4 ? 'hold' : ''}`}
          >
            <span>LOCATING</span>
            <b>
              {targetStage >= 4
                ? settings.locationName.toUpperCase()
                : phase.label}
            </b>
          </div>
        )}
        {targetStage >= 4 && !locked && <TargetMarker />}
        {locked && (
          <>
            <TargetMarker locked />
            <div className="geo-target-label">
              <span>TARGET ACQUIRED / UNIT LOCATED</span>
              <h2>AIRSOFT ARMER TEAM</h2>
              <p>{settings.locationName.toUpperCase()}</p>
              <small>
                {settings.locationCounty.toUpperCase()} //{' '}
                {settings.locationCountry.toUpperCase()}
              </small>
              {settings.introShowCoordinates && (
                <code>{coordinates(settings)}</code>
              )}
            </div>
          </>
        )}
        {settings.introShowLog && settledStage >= 0 && (
          <div className="geo-log">
            <p>AAT GEOINT // ACTIVE</p>
            {stages.slice(0, settledStage + 1).map((item, index) => (
              <div key={item.log}>
                <span>{item.log}</span>
                <b>{index === 5 ? 'TRUE' : item.label}</b>
              </div>
            ))}
          </div>
        )}
        {mapDebug && (
          <output className="geo-debug">
            <b>MAP DEBUG</b>
            <span>MAP LOADED: {String(diagnostics.mapLoaded)}</span>
            <span>STYLE LOADED: {String(diagnostics.styleLoaded)}</span>
            <span>
              CURRENT CENTER: {diagnostics.center[1].toFixed(6)} /{' '}
              {diagnostics.center[0].toFixed(6)}
            </span>
            <span>CURRENT ZOOM: {diagnostics.zoom.toFixed(2)}</span>
            <span>TILE ERRORS: {diagnostics.tileErrors.length}</span>
          </output>
        )}
        {settings.introShowBlackice && (
          <span className="geo-credit">SYSTEM DESIGN // BLACKICE</span>
        )}
        <button className="geo-skip" autoFocus onClick={() => finish(true)}>
          SKIP INTRO →
        </button>
      </div>
    </dialog>
  );
}

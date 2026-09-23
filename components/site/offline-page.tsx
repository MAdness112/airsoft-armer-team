import type { SiteSettings } from '@/lib/types';

export function OfflinePage({ settings }: { settings: SiteSettings }) {
  return (
    <main className="offline-page">
      <div className="offline-grid" aria-hidden="true" />
      <div className="offline-scan" aria-hidden="true" />
      <section className="offline-panel">
        <p className="offline-kicker">AAT // SYSTEM STATUS</p>
        <div className="offline-indicator"><span /> OFFLINE</div>
        <h1>{settings.offlineTitle}</h1>
        <p className="offline-copy">{settings.offlineMessage}</p>
        <div className="offline-rule" />
        <p className="offline-location">
          {settings.locationName.toUpperCase()} // {settings.locationCounty.toUpperCase()} // {settings.locationCountry.toUpperCase()}
        </p>
        <small>AIRSOFT ARMER TEAM</small>
      </section>
    </main>
  );
}

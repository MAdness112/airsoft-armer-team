import type { SiteSettings } from '@/lib/types';
import { LanguageToggle } from './language-provider';

export function OfflinePage({ settings }: { settings: SiteSettings }) {
  return (
    <main className="offline-page">
      <LanguageToggle />
      <div className="offline-grid" aria-hidden="true" />
      <div className="offline-scan" aria-hidden="true" />
      <div className="offline-coordinates" aria-hidden="true">
        <span>47.537722 N</span><span>25.383181 E</span>
      </div>
      <section className="offline-panel">
        <i className="offline-corner corner-nw" aria-hidden="true" />
        <i className="offline-corner corner-ne" aria-hidden="true" />
        <i className="offline-corner corner-sw" aria-hidden="true" />
        <i className="offline-corner corner-se" aria-hidden="true" />
        <div className="offline-classification">
          <span>AAT // COMMAND NETWORK</span><b>RESTRICTED</b>
        </div>
        <div className="offline-reticle" aria-hidden="true">
          <span>AAT</span>
        </div>
        <p className="offline-kicker">SYSTEM STATUS // MAINTENANCE PROTOCOL</p>
        <div className="offline-indicator"><span /> OFFLINE</div>
        <h1>{settings.offlineTitle}</h1>
        <p className="offline-copy">{settings.offlineMessage}</p>
        <div className="offline-rule" />
        <p className="offline-location">
          {settings.locationName.toUpperCase()} // {settings.locationCounty.toUpperCase()} // {settings.locationCountry.toUpperCase()}
        </p>
        <small>AIRSOFT ARMER TEAM</small>
        <div className="offline-code" aria-hidden="true">
          <span>UNIT // AAT-01</span><span>LINK // STANDBY</span>
        </div>
      </section>
    </main>
  );
}

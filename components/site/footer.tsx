import Link from 'next/link';
import { getSettings } from '@/lib/data';
export async function Footer() {
  const settings = await getSettings();
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <div className="footer-wordmark">
            AIRSOFT
            <br />
            <span>ARMER TEAM</span>
          </div>
          <p>
            {settings.locationName.toUpperCase()}
            <br />
            {settings.locationCounty.toUpperCase()} //{' '}
            {settings.locationCountry.toUpperCase()}
          </p>
        </div>
        <div>
          <h3>NAVIGATION</h3>
          <Link href="/team">Echipa</Link>
          <Link href="/operations">Jocuri</Link>
          <Link href="/gallery">Galerie</Link>
          <Link href="/about">Despre noi</Link>
        </div>
        <div>
          <h3>CONTACT</h3>
          <Link href="/contact">Trimite un mesaj</Link>
          <Link href="/recruitment">Join the unit</Link>
          <span>Social links // configurează în admin</span>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>{settings.footerText}</span>
        {settings.blackiceFooterEnabled && (
          <small className="blackice-footer">SYSTEM BY BLACKICE</small>
        )}
        <p>
          Airsoft Armer Team este o echipă sportivă/recreațională de airsoft și
          nu reprezintă o unitate militară sau instituție publică.
        </p>
      </div>
    </footer>
  );
}

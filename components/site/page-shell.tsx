import { getSettings } from '@/lib/data';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { OfflinePage } from './offline-page';

export async function PageShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  if (settings.offlineMode) return <OfflinePage settings={settings} />;
  return <><Navbar/><main>{children}</main><Footer/></>;
}
export function PageHero({eyebrow,title,subtitle,image}:Readonly<{eyebrow:string;title:string;subtitle:string;image?:string}>){return <section className="page-hero" style={image?{backgroundImage:`linear-gradient(90deg,#080a09ee,#080a0960),url('${image}')`}:undefined}><div className="shell"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div></section>}

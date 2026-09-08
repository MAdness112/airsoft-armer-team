import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { MapIntro } from '@/components/site/map-intro';
import { Navbar } from '@/components/site/navbar';
import { Footer } from '@/components/site/footer';
import { AlbumCard, MemberCard } from '@/components/site/cards';
import { getAlbums, getMembers, getOperations } from '@/lib/data';

export default async function Home() {
  const [members,operations,albums]=await Promise.all([getMembers(),getOperations(),getAlbums()]);
  const latest=operations[0];
  return <main><MapIntro/><Navbar/><section className="hero" id="home">
    <div className="hero-media" aria-hidden="true"/><div className="hero-shade" aria-hidden="true"/><div className="hero-grid" aria-hidden="true"/>
    <div className="hero-content shell"><div className="hero-kicker"><span/> Tactical Airsoft Unit</div><h1>AIRSOFT<br/><strong>ARMER TEAM</strong></h1><p className="hero-place">FUNDU MOLDOVEI <i>//</i> SUCEAVA <i>//</i> ROMANIA</p><p className="hero-tagline">PLAY HARD. MOVE TOGETHER.</p><div className="hero-actions"><Link className="button button-primary" href="/team">Descoperă echipa <ArrowRight size={17}/></Link><Link className="button button-ghost" href="/operations">Vezi misiunile</Link></div></div>
    <div className="hero-side" aria-hidden="true"><div><small>UNIT</small><b>AAT</b></div><div><small>STATUS</small><b className="online">ACTIVE</b></div><div><small>LOCATION</small><b>FMD / RO</b></div></div>
    <a className="scroll-cue" href="#unit"><span>SCROLL TO DEPLOY</span><ArrowDown size={15}/></a>
  </section><section className="intro-section shell" id="unit"><div className="section-index"><span>AAT // 01</span><b>UNIT</b></div><div className="intro-image"><img src="/images/team-demo.png" alt="Imagine demonstrativă cu o echipă de airsoft la briefing"/><span>DEMO PHOTOGRAPHY // REPLACE IN ADMIN</span></div><div className="intro-copy"><p className="eyebrow">WHO WE ARE</p><h2>MORE THAN<br/>A TEAM.</h2><p>Airsoft Armer Team este o echipă de airsoft din Fundu Moldovei, formată în jurul disciplinei, jocului de echipă și pasiunii pentru experiențe tactice.</p><p className="demo-note">Conținut demonstrativ — textul poate fi modificat din administrare.</p><Link className="text-link" href="/about">Citește povestea noastră <ArrowRight size={16}/></Link></div></section>
  <section className="content-section shell"><div className="section-heading split"><div><p className="eyebrow">AAT // 02 — UNIT</p><h2>MEET THE UNIT</h2></div><Link className="text-link" href="/team">ALL OPERATORS <ArrowRight size={16}/></Link></div><div className="member-grid home-members">{members.slice(0,3).map(m=><MemberCard key={m.id} member={m}/>)}</div></section>
  {latest&&<section className="latest-section"><div className="shell"><div className="section-heading"><p className="eyebrow">AAT // 03 — OPERATIONS</p><h2>LATEST DEPLOYMENT</h2></div><Link className="latest-card" href={`/operations/${latest.slug}`}><img src={latest.cover} alt={`Copertă ${latest.title}`}/><div><p>{new Date(latest.date).toLocaleDateString('ro-RO')} // {latest.location}</p><h3>{latest.title}</h3><span>{latest.memberIds.length} DEPLOYED OPERATORS</span><b>OPEN MISSION FILE <ArrowRight size={17}/></b></div></Link></div></section>}
  <section className="content-section shell"><div className="section-heading split"><div><p className="eyebrow">AAT // 04 — FIELD ARCHIVE</p><h2>LATEST FIELD INTEL</h2></div><Link className="text-link" href="/gallery">VIEW ARCHIVE <ArrowRight size={16}/></Link></div><div className="album-grid">{albums.slice(0,2).map(a=><AlbumCard key={a.id} album={a}/>)}</div></section>
  <section className="stats"><div className="shell">{[['MEMBRI',members.length],['JOCURI',operations.length],['ALBUME',albums.length],['FOTOGRAFII',albums.reduce((n,a)=>n+a.photos.length,0)]].map(([l,v])=><div key={l}><b>{String(v).padStart(2,'0')}</b><span>{l}</span><small>DEMO / CALCULATED</small></div>)}</div></section>
  <section className="values-home shell"><div><p className="eyebrow">AAT // 05 — VALUES</p><h2>HOW WE<br/>MOVE.</h2></div>{['TEAMWORK','DISCIPLINE','FAIR PLAY','TACTICS','RESPECT'].map((x,i)=><p key={x}><span>0{i+1}</span>{x}</p>)}</section>
  <section className="join"><img src="/images/hero-demo.png" alt="Imagine demonstrativă cu echipă de airsoft"/><div className="shell"><p className="eyebrow">JOIN THE UNIT</p><h2>THINK YOU<br/>BELONG HERE?</h2><Link className="button button-primary" href="/recruitment">SEE REQUIREMENTS <ArrowRight size={17}/></Link></div></section><Footer/></main>;
}

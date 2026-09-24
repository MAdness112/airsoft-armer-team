'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

export type Locale = 'ro' | 'en';
type LanguageContextValue = { locale: Locale; setLocale: (locale: Locale) => void };
const LanguageContext = createContext<LanguageContextValue>({ locale: 'ro', setLocale: () => {} });

const phrases: [string, string][] = [
  ['ACASĂ', 'HOME'], ['ECHIPA', 'TEAM'], ['JOCURI', 'OPERATIONS'], ['GALERIE', 'GALLERY'], ['DESPRE NOI', 'ABOUT US'],
  ['NAVIGAȚIE', 'NAVIGATION'], ['TRIMITE UN MESAJ', 'SEND A MESSAGE'], ['ALĂTURĂ-TE ECHIPEI', 'JOIN THE UNIT'],
  ['UNITATE TACTICĂ DE AIRSOFT', 'TACTICAL AIRSOFT UNIT'], ['DESCOPERĂ ECHIPA', 'DISCOVER THE TEAM'], ['VEZI MISIUNILE', 'VIEW MISSIONS'],
  ['UNITATE', 'UNIT'], ['STARE', 'STATUS'], ['ACTIV', 'ACTIVE'], ['LOCAȚIE', 'LOCATION'], ['DERULEAZĂ PENTRU DESFĂȘURARE', 'SCROLL TO DEPLOY'],
  ['CINE SUNTEM', 'WHO WE ARE'], ['MAI MULT DECÂT O ECHIPĂ.', 'MORE THAN A TEAM.'], ['CITEȘTE POVESTEA NOASTRĂ', 'READ OUR STORY'],
  ['MAI MULT DECÂT', 'MORE THAN'], ['O ECHIPĂ.', 'A TEAM.'], ['JOACĂ INTENS. ACȚIONEAZĂ ÎMPREUNĂ.', 'PLAY HARD. MOVE TOGETHER.'],
  ['CUNOAȘTE ECHIPA', 'MEET THE UNIT'], ['TOȚI OPERATORII', 'ALL OPERATORS'], ['ULTIMA MISIUNE', 'LATEST DEPLOYMENT'],
  ['OPERATORI DESFĂȘURAȚI', 'DEPLOYED OPERATORS'], ['DESCHIDE DOSARUL MISIUNII', 'OPEN MISSION FILE'],
  ['ARHIVĂ DE TEREN', 'FIELD ARCHIVE'], ['ULTIMELE INFORMAȚII DIN TEREN', 'LATEST FIELD INTEL'], ['VEZI ARHIVA', 'VIEW ARCHIVE'],
  ['MEMBRI', 'MEMBERS'], ['ALBUME', 'ALBUMS'], ['FOTOGRAFII', 'PHOTOS'], ['CALCULAT', 'CALCULATED'],
  ['VALORI', 'VALUES'], ['CUM OPERĂM.', 'HOW WE MOVE.'], ['ALĂTURĂ-TE UNITĂȚII', 'JOIN THE UNIT'],
  ['CUM', 'HOW WE'], ['OPERĂM.', 'MOVE.'], ['COEZIUNE', 'TEAMWORK'], ['DISCIPLINĂ', 'DISCIPLINE'],
  ['FAIR PLAY', 'FAIR PLAY'], ['TACTICĂ', 'TACTICS'], ['RESPECT', 'RESPECT'],
  ['CREZI CĂ LOCUL TĂU ESTE AICI?', 'THINK YOU BELONG HERE?'], ['VEZI CERINȚELE', 'SEE REQUIREMENTS'],
  ['CREZI CĂ', 'THINK YOU'], ['LOCUL TĂU ESTE AICI?', 'BELONG HERE?'],
  ['OAMENII DIN SPATELE EMBLEMEI.', 'THE PEOPLE BEHIND THE PATCH.'], ['TOȚI', 'ALL'], ['REZERVĂ', 'RESERVE'], ['VETERANI', 'VETERANS'],
  ['NICIUN MEMBRU GĂSIT', 'NO MEMBERS FOUND'], ['DOSAR OPERATOR', 'OPERATOR DOSSIER'], ['ÎNREGISTRARE DEMO', 'DEMO RECORD'],
  ['INDICATIV', 'CALLSIGN'], ['NUME', 'NAME'], ['ROL', 'ROLE'], ['MEMBRU DIN', 'MEMBER SINCE'], ['ID OPERATOR', 'OPERATOR ID'],
  ['BIOGRAFIE', 'BIOGRAPHY'], ['DINCOLO DE INDICATIV.', 'BEHIND THE CALLSIGN.'], ['ECHIPAMENT OPERATOR', 'OPERATOR LOADOUT'],
  ['PRIMARĂ', 'PRIMARY'], ['SECUNDARĂ', 'SECONDARY'], ['ECHIPAMENT', 'GEAR'], ['SPECIALIZARE', 'SPECIALTY'], ['STIL DE JOC', 'PLAY STYLE'],
  ['INFORMAȚII ASOCIATE', 'TAGGED INTEL'], ['VIZUALIZEAZĂ DOSARUL', 'VIEW DOSSIER'], ['ACHIZIȚIONEAZĂ ȚINTA', 'ACQUIRE TARGET'],
  ['DOSARE DE MISIUNE', 'MISSION FILES'], ['RAPOARTE DUPĂ ACȚIUNE // OPERAȚIUNI DE TEREN', 'AFTER ACTION REPORTS // FIELD OPERATIONS'],
  ['NICIO OPERAȚIUNE ÎNREGISTRATĂ', 'NO OPERATIONS LOGGED'], ['VEZI RAPORTUL DUPĂ ACȚIUNE', 'VIEW AFTER ACTION REPORT'],
  ['OPERAȚIUNEA', 'OPERATION'], ['DETALIILE MISIUNII', 'MISSION DETAILS'], ['DATA', 'DATE'], ['ORGANIZATOR', 'ORGANIZER'],
  ['DOSAR DEMO', 'DEMO FILE'], ['TIP EVENIMENT', 'EVENT TYPE'], ['ECHIPA PE TEREN', 'THE UNIT ON FIELD'],
  ['RAPORT DUPĂ ACȚIUNE', 'AFTER ACTION REPORT'], ['INFORMAȚII VIZUALE', 'VISUAL INTEL'],
  ['MISIUNE', 'MISSION'], ['BRIEFING', 'BRIEF'], ['OPERAȚIUNEA ANTERIOARĂ', 'PREVIOUS OPERATION'], ['OPERAȚIUNEA URMĂTOARE', 'NEXT OPERATION'],
  ['ECHIPA DESFĂȘURATĂ', 'DEPLOYED UNIT'], ['ÎNAPOI LA OPERAȚIUNI', 'BACK TO OPERATIONS'],
  ['ARHIVA FOTO', 'PHOTO ARCHIVE'], ['OPERAȚIUNILE. OAMENII. MOMENTELE.', 'THE OPERATIONS. THE PEOPLE. THE MOMENTS.'],
  ['TOȚI ANII', 'ALL YEARS'], ['EVENIMENT', 'EVENT'], ['MEMBRU', 'MEMBER'], ['NICIO INFORMAȚIE DIN TEREN', 'NO FIELD INTEL FOUND'],
  ['FOTOGRAFIE', 'PHOTO'], ['ÎNCHIDE', 'CLOSE'], ['ANTERIOR', 'PREVIOUS'], ['URMĂTOR', 'NEXT'], ['DESCARCĂ', 'DOWNLOAD'],
  ['ALBUM DEMO', 'DEMO ALBUM'], ['DATE DEMO', 'DEMO DATA'], ['CREDIT FOTO', 'PHOTO CREDIT'],
  ['IDENTITATE', 'IDENTITY'], ['POVESTEA NOASTRĂ', 'OUR STORY'], ['FORMAȚI ÎN BUCOVINA.', 'BUILT IN BUCOVINA.'],
  ['O ECHIPĂ UNITĂ PRIN ÎNCREDERE, DISCIPLINĂ ȘI EXPERIENȚA DIN TEREN.', 'A TEAM BUILT AROUND TRUST, DISCIPLINE AND THE FIELD.'],
  ['CE JUCĂM', 'WHAT WE PLAY'], ['OBIECTIV CLAR.', 'TACTICS WITH PURPOSE.'], ['EMBLEMA NOASTRĂ', 'OUR PATCH'],
  ['TEREN PROPRIU', 'HOME FIELD'], ['TERENUL NOSTRU.', 'THE GROUND WE KNOW.'], ['HARTĂ INDISPONIBILĂ', 'MAP UNAVAILABLE'],
  ['TERENUL', 'THE GROUND'], ['NOSTRU.', 'WE KNOW.'],
  ['STABILEȘTE CONTACTUL', 'ESTABLISH CONTACT'], ['JOACĂ ALĂTURI DE NOI. INVITĂ ECHIPA. ÎNCEPE O CONVERSAȚIE.', 'PLAY WITH US. INVITE THE TEAM. START A CONVERSATION.'],
  ['CANAL DE CONTACT', 'CONTACT CHANNEL'], ['HAI SĂ VORBIM.', "LET'S TALK."],
  ['Folosește formularul. Adresa de contact și canalele sociale se configurează din admin.', 'Use the form. The contact address and social channels are configured in admin.'],
  ['CONECTAT LA SUPABASE', 'SUPABASE CONNECTED'], ['SUBIECT', 'SUBJECT'], ['MESAJ', 'MESSAGE'], ['TRIMITE MESAJUL', 'SEND MESSAGE'],
  ['SE TRANSMITE...', 'TRANSMITTING...'], ['MESAJ PRIMIT', 'MESSAGE RECEIVED'], ['EROARE DE COMUNICARE // ÎNCEARCĂ DIN NOU', 'COMMUNICATION FAILURE // TRY AGAIN'],
  ['ALĂTURĂ-TE ECHIPEI', 'JOIN THE UNIT'], ['CREZI CĂ LOCUL TĂU ESTE AICI?', 'THINK YOU BELONG HERE?'], ['CERINȚE // DEMO', 'REQUIREMENTS // DEMO'],
  ['ÎNCEPE CU MENTALITATEA POTRIVITĂ.', 'START WITH THE RIGHT MINDSET.'], ['APLICĂ', 'APPLY'], ['LOCALITATE', 'LOCATION'], ['EXPERIENȚĂ', 'EXPERIENCE'],
  ['ÎNCEPE CU', 'START WITH'], ['MENTALITATEA POTRIVITĂ.', 'THE RIGHT MINDSET.'],
  ['Vârsta minimă — de configurat', 'Minimum age — configure in admin'], ['Echipament — de configurat', 'Equipment — configure in admin'],
  ['Experiență — de configurat', 'Experience — configure in admin'], ['Localitate — de configurat', 'Location — configure in admin'],
  ['Respectarea regulamentului', 'Compliance with the rules'],
  ['Nu am inventat cerințe reale. Completează-le din administrare.', 'No real requirements were invented. Complete them in admin.'],
  ['COD DE CONDUITĂ', 'CODE OF CONDUCT'], ['SIGURANȚĂ. RESPECT. FAIR PLAY.', 'SAFETY. RESPECT. FAIR PLAY.'],
  ['SIGURANȚĂ', 'SAFETY'], ['COMPORTAMENT', 'CONDUCT'], ['REGULI DE JOC', 'GAME RULES'],
  ['Integritatea jocului este responsabilitatea fiecărui participant.', 'The integrity of the game is the responsibility of every participant.'],
  ['Protecția oculară adecvată este obligatorie în zona de joc.', 'Proper eye protection is mandatory in the playing area.'],
  ['Respect pentru coechipieri, adversari, organizatori și teren.', 'Respect teammates, opponents, organizers and the field.'],
  ['Briefingul și limitele stabilite de organizator au prioritate.', 'The briefing and limits set by the organizer take priority.'],
  ['Document demonstrativ. Regulile finale trebuie validate și publicate de echipă.', 'Demonstration document. The final rules must be validated and published by the team.'],
  ['ȚINTĂ NEGĂSITĂ', 'TARGET NOT FOUND'], ['ÎNAPOI LA BAZĂ', 'RETURN TO BASE'], ['REÎNCEARCĂ CONEXIUNEA', 'RETRY CONNECTION'],
  ['SISTEM ÎN AȘTEPTARE', 'SYSTEM STANDBY'], ['SITE TEMPORAR OFFLINE', 'SITE TEMPORARILY OFFLINE'],
  ['Revenim în curând. Airsoft Armer Team pregătește următoarea misiune.', 'We will be back soon. Airsoft Armer Team is preparing the next mission.'],
  ['REȚEA DE COMANDĂ', 'COMMAND NETWORK'], ['RESTRICȚIONAT', 'RESTRICTED'], ['PROTOCOL DE MENTENANȚĂ', 'MAINTENANCE PROTOCOL'],
  ['STARE SISTEM', 'SYSTEM STATUS'],
  ['ACCES PUBLIC SUSPENDAT', 'PUBLIC ACCESS SUSPENDED'], ['LEGĂTURĂ // ÎN AȘTEPTARE', 'LINK // STANDBY'],
  ['LOCALIZARE', 'LOCATING'], ['ȚINTĂ IDENTIFICATĂ / UNITATE LOCALIZATĂ', 'TARGET ACQUIRED / UNIT LOCATED'], ['SARI PESTE INTRO', 'SKIP INTRO'],
  ['SISTEM GEOLOCALIZARE', 'GEOLOCATION SYSTEM'], ['INFORMAȚII GEO // ACTIVE', 'GEOINT // ACTIVE'],
  ['ROMÂNIA', 'ROMANIA'], ['BUCOVINA', 'BUCOVINA'], ['ECHIPĂ', 'TEAM'], ['CONTACT', 'CONTACT'], ['MENIU', 'MENU'],
  ['O echipă formată din oameni cu experiențe, domenii și skill-uri diferite, uniți de aceeași mentalitate: disciplină, adaptare și eficiență în teren.', 'A team of people with different backgrounds and skills, united by the same mindset: discipline, adaptability and efficiency in the field.'],
  ['Suntem Airsoft Armer Team. Ne reunim pentru jocul de echipă, comunicare și fair play.', 'We are Airsoft Armer Team. We come together for teamwork, communication and fair play.'],
  ['Scenarii, jocuri de echipă și experiențe construite în jurul comunicării, responsabilității și fair play-ului.', 'Scenarios, team games and experiences built around communication, responsibility and fair play.'],
  ['Principiile care ne țin împreună, pe teren și în afara lui.', 'The principles that keep us together, on and off the field.'],
  ['Airsoft Armer Team este o echipă sportivă/recreațională de airsoft și nu reprezintă o unitate militară sau instituție publică.', 'Airsoft Armer Team is a recreational airsoft team and does not represent a military unit or public institution.'],
  ['CANALE SOCIALE // CONFIGURABILE DIN ADMIN', 'SOCIAL LINKS // CONFIGURE IN ADMIN'], ['TOATE DREPTURILE REZERVATE', 'ALL RIGHTS RESERVED'],
  ['MISIUNE', 'MISSION'], ['MIȘCARE', 'MOVEMENT'], ['COORDONARE', 'COORDINATION'], ['EXECUȚIE', 'EXECUTION'],
  ['SISTEM CREAT DE BLACKICE', 'SYSTEM BY BLACKICE'],
  ['Copertă album', 'Album cover'], ['Copertă', 'Cover'], ['Portret', 'Portrait'],
  ['Selectează limba', 'Select language'],
  ['Ianuarie', 'January'], ['Februarie', 'February'], ['Martie', 'March'], ['Aprilie', 'April'], ['Mai', 'May'], ['Iunie', 'June'],
  ['Iulie', 'July'], ['August', 'August'], ['Septembrie', 'September'], ['Octombrie', 'October'], ['Noiembrie', 'November'], ['Decembrie', 'December'],
];

const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
const roToEn = new Map(phrases.map(([ro, en]) => [normalize(ro).toLocaleUpperCase('ro'), en]));
const enToRo = new Map(phrases.map(([ro, en]) => [normalize(en).toUpperCase(), ro]));

function translated(value: string, locale: Locale) {
  const clean = normalize(value);
  if (!clean) return value;
  const direct = locale === 'en' ? roToEn.get(clean.toLocaleUpperCase('ro')) : enToRo.get(clean.toUpperCase());
  if (direct) return value.replace(clean, direct);
  let result = clean;
  if (locale === 'ro') {
    result = result
      .replace(/^AAT \/\/ ALL RIGHTS RESERVED$/i, 'AAT // TOATE DREPTURILE REZERVATE')
      .replace(/^AAT \/\/ (\d+) — VALUES$/i, 'AAT // $1 — VALORI')
      .replace(/^AAT \/\/ (\d+) — OPERATIONS$/i, 'AAT // $1 — OPERAȚIUNI')
      .replace(/^AAT \/\/ (\d+) — FIELD ARCHIVE$/i, 'AAT // $1 — ARHIVĂ DE TEREN')
      .replace(/^HOME \/\//i, 'ACASĂ //')
      .replace(/^OPERATION \/\//i, 'OPERAȚIUNE //')
      .replace(/Uneori agresiv\./gi, 'Uneori ofensiv.')
      .replace(/MISSION \/\/ MOVEMENT \/\/ COORDINATION \/\/ EXECUTION/gi, 'MISIUNE // MIȘCARE // COORDONARE // EXECUȚIE');
  } else {
    result = result
      .replace(/^AAT \/\/ TOATE DREPTURILE REZERVATE$/i, 'AAT // ALL RIGHTS RESERVED')
      .replace(/^AAT \/\/ (\d+) — VALORI$/i, 'AAT // $1 — VALUES')
      .replace(/^AAT \/\/ (\d+) — OPERAȚIUNI$/i, 'AAT // $1 — OPERATIONS')
      .replace(/^AAT \/\/ (\d+) — ARHIVĂ DE TEREN$/i, 'AAT // $1 — FIELD ARCHIVE')
      .replace(/^ACASĂ \/\//i, 'HOME //')
      .replace(/^OPERAȚIUNE \/\//i, 'OPERATION //');
  }
  result = result
    .replace(/(\d+) OPERATORI DESFĂȘURAȚI/gi, '$1 DEPLOYED OPERATORS')
    .replace(/(\d+) DEPLOYED OPERATORS/gi, locale === 'ro' ? '$1 OPERATORI DESFĂȘURAȚI' : '$1 DEPLOYED OPERATORS')
    .replace(/(\d+) FOTOGRAFII/gi, '$1 PHOTOS')
    .replace(/(\d+) PHOTOS/gi, locale === 'ro' ? '$1 FOTOGRAFII' : '$1 PHOTOS');
  return value.replace(clean, result);
}

function translateDocument(locale: Locale) {
  if (location.pathname.startsWith('/admin')) return;
  document.documentElement.lang = locale;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) continue;
    const current = node.nodeValue ?? '';
    const next = translated(current, locale);
    if (next !== current) node.nodeValue = next;
  }
  document.querySelectorAll<HTMLElement>('[aria-label],[title],[placeholder],img[alt]').forEach((element) => {
    for (const attr of ['aria-label', 'title', 'placeholder', 'alt']) {
      const value = element.getAttribute(attr);
      if (value) {
        const next = translated(value, locale);
        if (next !== value) element.setAttribute(attr, next);
      }
    }
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [locale, updateLocale] = useState<Locale>('ro');
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('lang');
    const saved = localStorage.getItem('aat_locale');
    const initial = requested === 'en' || requested === 'ro' ? requested : saved === 'en' ? 'en' : 'ro';
    localStorage.setItem('aat_locale', initial);
    updateLocale(initial);
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => translateDocument(locale));
    return () => cancelAnimationFrame(frame);
  }, [locale, pathname]);
  const value = useMemo(() => ({
    locale,
    setLocale(next: Locale) {
      localStorage.setItem('aat_locale', next);
      document.cookie = `aat_locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
      updateLocale(next);
    },
  }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function LanguageToggle() {
  const { locale, setLocale } = useContext(LanguageContext);
  return (
    <div className="language-toggle" aria-label={locale === 'ro' ? 'Selectează limba' : 'Select language'}>
      <button className={locale === 'ro' ? 'active' : ''} onClick={() => setLocale('ro')} aria-pressed={locale === 'ro'}>RO</button>
      <span>/</span>
      <button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')} aria-pressed={locale === 'en'}>EN</button>
    </div>
  );
}

export function useLanguage() { return useContext(LanguageContext); }

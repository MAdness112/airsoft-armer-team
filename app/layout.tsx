import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import './globals.css';
import {EasterEgg} from '@/components/site/easter-egg';
import {LanguageProvider} from '@/components/site/language-provider';
export const metadata:Metadata={title:{default:'Airsoft Armer Team',template:'%s | Airsoft Armer Team'},description:'Site-ul oficial Airsoft Armer Team din Fundu Moldovei, Suceava.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ro"><body><LanguageProvider>{children}<EasterEgg/></LanguageProvider></body></html>}

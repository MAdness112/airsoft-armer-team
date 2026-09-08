import type { Metadata } from 'next';
import './globals.css';
import {EasterEgg} from '@/components/site/easter-egg';
export const metadata:Metadata={title:{default:'Airsoft Armer Team',template:'%s | Airsoft Armer Team'},description:'Site-ul oficial Airsoft Armer Team din Fundu Moldovei, Suceava.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ro"><body>{children}<EasterEgg/></body></html>}

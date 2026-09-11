import type { ContentSettings } from './content-settings';
export type MemberStatus = 'active' | 'reserve' | 'veteran';
export interface Member {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  callsign: string;
  role: string;
  roleId?: string;
  profilePosition?: string;
  heroPosition?: string;
  status: MemberStatus;
  operatorId?: string;
  shortBio?: string;
  bio?: string;
  profileImage: string;
  heroImage?: string;
  memberSince?: string;
  primaryReplica?: string;
  secondaryReplica?: string;
  gear?: string;
  specialty?: string;
  playStyle?: string;
  motto?: string;
  badges?: string[];
  featured?: boolean;
  displayOrder: number;
  isDemo?: boolean;
}
export interface Operation {
  id: string;
  slug: string;
  title: string;
  date: string;
  location: string;
  description: string;
  cover: string;
  eventType?: string;
  organizer?: string;
  memberIds: string[];
  tags: string[];
  albumSlug?: string;
  result?: string;
  isDemo?: boolean;
}
export interface Photo {
  id: string;
  url: string;
  alt: string;
  memberIds: string[];
  sortOrder: number;
}
export interface Album {
  id: string;
  slug: string;
  title: string;
  date: string;
  location: string;
  description: string;
  cover: string;
  photographer?: string;
  tags: string[];
  memberIds: string[];
  photos: Photo[];
  downloadEnabled: boolean;
  isDemo?: boolean;
}
export interface SiteSettings extends ContentSettings {
  teamName: string;
  shortName: string;
  tagline: string;
  location: string;
  contactEmail: string;
  introEnabled: boolean;
  introMapEnabled: boolean;
  recruitmentEnabled: boolean;
  footerText: string;
  accentColor: string;
}

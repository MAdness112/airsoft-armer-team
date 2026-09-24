import {contentDefaults} from './content-settings';
import type {Album,Member,Operation,SiteSettings} from './types';
const portraits=['/images/team-demo.png','/images/hero-demo.png','/images/operation-demo.png'];
export const members:Member[]=[
 {id:'m1',slug:'blackice',firstName:'Cosmin',lastName:'—',callsign:'BLACKICE',role:'Team Member',status:'active',operatorId:'AAT-01',shortBio:'Operator Airsoft Armer Team.',bio:'Profil de operator Airsoft Armer Team.',profileImage:portraits[0],heroImage:portraits[0],primaryReplica:'M4 platform',secondaryReplica:'—',gear:'Plate carrier',specialty:'Assault',playStyle:'Team-oriented',motto:'Move together.',badges:[],featured:true,displayOrder:1,isDemo:false},
 {id:'m2',slug:'ghost',firstName:'Membru',lastName:'AAT',callsign:'GHOST',role:'Recon',status:'active',shortBio:'Operator Airsoft Armer Team.',profileImage:portraits[1],specialty:'Recon',badges:[],featured:true,displayOrder:2,isDemo:false},
 {id:'m3',slug:'viper',firstName:'Membru',lastName:'AAT',callsign:'VIPER',role:'Support',status:'active',shortBio:'Operator Airsoft Armer Team.',profileImage:portraits[2],specialty:'Support',badges:[],featured:true,displayOrder:3,isDemo:false},
 {id:'m4',slug:'nomad',firstName:'Membru',lastName:'AAT',callsign:'NOMAD',role:'Assault',status:'reserve',shortBio:'Operator Airsoft Armer Team.',profileImage:portraits[0],badges:[],displayOrder:4,isDemo:false},
 {id:'m5',slug:'raven',firstName:'Membru',lastName:'AAT',callsign:'RAVEN',role:'Medic',status:'veteran',shortBio:'Operator Airsoft Armer Team.',profileImage:portraits[1],badges:[],displayOrder:5,isDemo:false},
];
export const operations:Operation[]=[
 {id:'o1',slug:'dark-forest-demo',title:'Operation Dark Forest',date:'2026-08-12',location:'Fundu Moldovei',description:'Dosar de operațiune Airsoft Armer Team.',cover:'/images/operation-demo.png',eventType:'Milsim',organizer:'Airsoft Armer Team',memberIds:['m1','m2','m3'],tags:['forest'],albumSlug:'dark-forest-demo',isDemo:false},
 {id:'o2',slug:'red-dawn-demo',title:'Red Dawn',date:'2026-06-23',location:'Suceava',description:'Raport de teren Airsoft Armer Team.',cover:'/images/hero-demo.png',eventType:'Skirmish',memberIds:['m1','m4'],tags:[],albumSlug:'red-dawn-demo',isDemo:false},
 {id:'o3',slug:'frozen-ground-demo',title:'Frozen Ground',date:'2026-01-18',location:'Bucovina',description:'Raport de teren Airsoft Armer Team.',cover:'/images/team-demo.png',eventType:'Scenario',memberIds:['m2','m3'],tags:['winter'],isDemo:false},
];
const demoPhotos=['/images/operation-demo.png','/images/team-demo.png','/images/hero-demo.png','/images/operation-demo.png','/images/hero-demo.png','/images/team-demo.png'].map((url,i)=>({id:`p${i+1}`,url,alt:`Fotografie airsoft ${i+1}`,memberIds:i%2?['m1']:['m2','m3'],sortOrder:i}));
export const albums:Album[]=[
 {id:'a1',slug:'dark-forest-demo',title:'Operation Dark Forest',date:'2026-08-12',location:'Fundu Moldovei',description:'Arhivă foto din teren.',cover:'/images/operation-demo.png',photographer:'AAT',tags:['forest'],memberIds:['m1','m2','m3'],photos:demoPhotos,downloadEnabled:false,isDemo:false},
 {id:'a2',slug:'red-dawn-demo',title:'Red Dawn',date:'2026-06-23',location:'Suceava',description:'Arhivă foto din teren.',cover:'/images/hero-demo.png',tags:[],memberIds:['m1','m4'],photos:demoPhotos.slice(0,4),downloadEnabled:false,isDemo:false},
];
export const settings:SiteSettings={...contentDefaults,teamName:'Airsoft Armer Team',shortName:'AAT',tagline:'PLAY HARD. MOVE TOGETHER.',location:'Fundu Moldovei, Suceava, România',contactEmail:'CONFIGURE_IN_ADMIN',introEnabled:true,introMapEnabled:true,recruitmentEnabled:true,footerText:'AAT // ALL RIGHTS RESERVED',accentColor:'#B41F25'};

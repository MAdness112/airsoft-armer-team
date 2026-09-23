import { z } from 'zod';
const valueSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  icon: z.string(),
});
export const contentSchema = z.object({
  offlineMode: z.boolean().default(false),
  offlineTitle: z.string().min(1).default('SITE TEMPORAR OFFLINE'),
  offlineMessage: z
    .string()
    .default('Revenim în curând. Airsoft Armer Team pregătește următoarea misiune.'),
  locationName: z.string().min(1).default('Fundu Moldovei'),
  locationCounty: z.string().min(1).default('Suceava'),
  locationCountry: z.string().min(1).default('Romania'),
  latitude: z.number().min(-85).max(85).default(47.5377220457023),
  longitude: z.number().min(-180).max(180).default(25.38318096284483),
  introEnabled: z.boolean().default(true),
  introMapEnabled: z.boolean().default(true),
  introOnce: z.boolean().default(true),
  introDuration: z.number().min(6).max(9).default(8.5),
  introShowCoordinates: z.boolean().default(true),
  introShowLog: z.boolean().default(true),
  introShowBlackice: z.boolean().default(true),
  blackiceHeroEnabled: z.boolean().default(true),
  blackiceFooterEnabled: z.boolean().default(false),
  blackiceSymbolUrl: z.string().default('/images/blackice-symbol.png'),
  aboutTitle: z.string().min(1).default('WHO WE ARE'),
  aboutSubtitle: z
    .string()
    .default('A TEAM BUILT AROUND TRUST, DISCIPLINE AND THE FIELD.'),
  aboutShortDescription: z
    .string()
    .default(
      'Airsoft Armer Team este o echipă de airsoft din Fundu Moldovei, formată în jurul disciplinei, jocului de echipă și pasiunii pentru experiențe tactice.',
    ),
  aboutMainDescription: z
    .string()
    .default(
      'Suntem Airsoft Armer Team. Ne reunim pentru jocul de echipă, comunicare și fair play.',
    ),
  aboutStory: z
    .string()
    .default(
      'Acesta este un spațiu editorial pentru povestea reală a echipei. Completează povestea din Admin → About.',
    ),
  aboutWhatWePlay: z
    .string()
    .default(
      'Scenarii, jocuri de echipă și experiențe construite în jurul comunicării, responsabilității și fair play-ului.',
    ),
  aboutValuesIntro: z
    .string()
    .default('Principiile care ne țin împreună, pe teren și în afara lui.'),
  aboutHomeField: z.string().default('Fundu Moldovei, Suceava, România'),
  aboutPatchDescription: z
    .string()
    .default('Simbolul echipei și identitatea pe care o reprezentăm împreună.'),
  aboutQuote: z.string().default(''),
  fieldImage: z.string().default('/images/hero-demo.png'),
  fieldShowMap: z.boolean().default(true),
  values: z
    .array(valueSchema)
    .max(30)
    .default(
      ['TEAMWORK', 'DISCIPLINE', 'FAIR PLAY', 'TACTICS', 'RESPECT'].map(
        (title, i) => ({ id: String(i + 1), title, description: '', icon: '' }),
      ),
    ),
});
export type ContentSettings = z.infer<typeof contentSchema>;
export const contentDefaults: ContentSettings = contentSchema.parse({});
export function readContent(input: unknown): ContentSettings {
  const source =
    input && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {};
  const output = { ...contentDefaults };
  for (const key of Object.keys(
    contentSchema.shape,
  ) as (keyof ContentSettings)[]) {
    const result = contentSchema.shape[key].safeParse(source[key]);
    if (result.success) Object.assign(output, { [key]: result.data });
  }
  return output;
}
export const aboutFields = [
  ['aboutTitle', 'PAGE TITLE'],
  ['aboutSubtitle', 'HERO SUBTITLE'],
  ['aboutShortDescription', 'SHORT DESCRIPTION'],
  ['aboutMainDescription', 'MAIN DESCRIPTION'],
  ['aboutStory', 'OUR STORY'],
  ['aboutWhatWePlay', 'WHAT WE PLAY'],
  ['aboutValuesIntro', 'OUR VALUES INTRO'],
  ['aboutHomeField', 'HOME FIELD DESCRIPTION'],
  ['aboutPatchDescription', 'PATCH / TEAM LOGO DESCRIPTION'],
  ['aboutQuote', 'OPTIONAL QUOTE'],
] as const;
export const locationFields = [
  ['locationName', 'LOCATION NAME'],
  ['locationCounty', 'COUNTY'],
  ['locationCountry', 'COUNTRY'],
  ['latitude', 'LATITUDE'],
  ['longitude', 'LONGITUDE'],
] as const;
export const introToggles = [
  ['introEnabled', 'INTRO ENABLED'],
  ['introMapEnabled', 'INTRO LOCATION ENABLED'],
  ['introOnce', 'INTRO SHOW ONCE PER SESSION'],
  ['introShowCoordinates', 'SHOW COORDINATES'],
  ['introShowLog', 'SHOW LOCATION LOG'],
  ['introShowBlackice', 'SHOW BLACKICE IN INTRO'],
  ['blackiceHeroEnabled', 'SHOW BLACKICE IN HERO'],
  ['blackiceFooterEnabled', 'SYSTEM BY BLACKICE IN FOOTER'],
] as const;

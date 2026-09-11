import type { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import Markdown from 'react-markdown';
import { PageHero, PageShell } from '@/components/site/page-shell';
import { getSettings } from '@/lib/data';
import { FieldMap } from '@/components/site/field-map';
export const metadata: Metadata = { title: 'Despre noi' };
function Text({ children }: { children: string }) {
  return (
    <div className="about-markdown">
      <Markdown>{children}</Markdown>
    </div>
  );
}
export default async function AboutPage() {
  const s = await getSettings();
  return (
    <PageShell>
      <PageHero
        eyebrow="AAT // IDENTITY"
        title={s.aboutTitle}
        subtitle={s.aboutSubtitle}
        image="/images/team-demo.png"
      />
      <section className="editorial shell">
        <Text>{s.aboutShortDescription}</Text>
        <Text>{s.aboutMainDescription}</Text>
        <div className="editorial-block">
          <span>01</span>
          <div>
            <p className="eyebrow">OUR STORY</p>
            <h2>BUILT IN BUCOVINA.</h2>
            <Text>{s.aboutStory}</Text>
          </div>
        </div>
        {s.fieldImage && (
          <img src={s.fieldImage} alt={`${s.locationName} — terenul echipei`} />
        )}
        <div className="editorial-block">
          <span>02</span>
          <div>
            <p className="eyebrow">WHAT WE PLAY</p>
            <h2>TACTICS WITH PURPOSE.</h2>
            <Text>{s.aboutWhatWePlay}</Text>
          </div>
        </div>
        <Text>{s.aboutValuesIntro}</Text>
        <div className="values">
          {s.values.map((v, i) => (
            <div key={v.id}>
              <small>{v.icon || String(i + 1).padStart(2, '0')}</small>
              <b>{v.title}</b>
              <p>{v.description}</p>
            </div>
          ))}
        </div>
        <div className="editorial-block">
          <span>03</span>
          <div>
            <p className="eyebrow">OUR PATCH</p>
            <Text>{s.aboutPatchDescription}</Text>
          </div>
        </div>
        {s.aboutQuote && (
          <blockquote className="about-quote">{s.aboutQuote}</blockquote>
        )}
        <div className="home-field">
          <div>
            <p className="eyebrow">HOME // {s.locationName.toUpperCase()}</p>
            <h2>
              THE GROUND
              <br />
              WE KNOW.
            </h2>
            <p>
              {s.locationName}, {s.locationCounty}, {s.locationCountry}
            </p>
            <Text>{s.aboutHomeField}</Text>
          </div>
          {s.fieldShowMap && <FieldMap settings={s} />}
        </div>
      </section>
    </PageShell>
  );
}

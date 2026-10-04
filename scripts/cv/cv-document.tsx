import { Document, Font, Link, Page, Text, View } from '@react-pdf/renderer';
import path from 'node:path';
import type { ReactNode } from 'react';

import { SKILL_CATEGORIES } from '@/lib/constants';
import { formatRolePeriod, sortEarlierWork, sortRoles, techAll, techName } from '@/lib/derive';
import type { CareerRole, Content } from '@/lib/schemas';

import { FONT_FAMILY, styles } from './styles';

const FONT_DIR = path.join(process.cwd(), 'scripts/cv/fonts');

// Helvetica and the other standard PDF fonts cannot draw "→", which appears in many periods.
Font.register({
  family: FONT_FAMILY,
  fonts: [
    { src: path.join(FONT_DIR, 'Inter-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONT_DIR, 'Inter-SemiBold.ttf'), fontWeight: 600 },
  ],
});
// Hyphenation would split words across lines and break text extraction of the PDF.
Font.registerHyphenationCallback((word) => [word]);

const CATEGORY_LABELS = {
  languages: 'Languages',
  frameworks: 'Frameworks',
  cloud: 'Cloud',
  databases: 'Databases',
  devops: 'DevOps',
  messaging: 'Messaging',
  ai: 'AI',
  testing: 'Testing',
} as const;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text style={styles.sectionTitle} minPresenceAhead={40}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Bullets({ label, items }: { label: string; items?: string[] }) {
  if (!items) return null;
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      {items.map((item) => (
        <View key={item} style={styles.bullet} wrap={false}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Role({ role, content }: { role: CareerRole; content: Content }) {
  const names = (slugs: string[]) => slugs.map((slug) => techName(content.technologies, slug));

  return (
    <View style={styles.role}>
      <View style={styles.roleHeader} wrap={false}>
        <Text style={styles.roleTitle}>
          {role.role} · {role.company}
        </Text>
        <Text style={styles.muted}>{formatRolePeriod(role)}</Text>
      </View>
      <Text style={styles.muted}>
        {role.location} · {role.type}
      </Text>
      <Text style={styles.paragraph}>{role.summary}</Text>
      <Bullets label="Responsibilities" items={role.responsibilities} />
      <Bullets label="Achievements" items={role.achievements} />
      {role.progression ? (
        <View>
          <Text style={styles.label}>Progression</Text>
          {role.progression.map((step) => (
            <Text key={step.title} style={styles.phase}>
              {step.title} — {step.focus}
            </Text>
          ))}
        </View>
      ) : null}
      {role.phases ? (
        <View>
          <Text style={styles.label}>Phases</Text>
          {role.phases.map((phase) => (
            <View key={phase.label} style={styles.phase} wrap={false}>
              <Text>
                {phase.label} <Text style={styles.muted}>({phase.period})</Text>
              </Text>
              <Text style={styles.muted}>
                {phase.client_sector} · {names(phase.tech).join(', ')}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      <Bullets label="AI work" items={role.ai_work} />
      <Bullets label="Notes" items={role.notes} />
      <Text style={[styles.paragraph, styles.muted]}>
        Technologies: {names(techAll(role)).join(', ')}
      </Text>
    </View>
  );
}

export function CvDocument({ content }: { content: Content }) {
  const { profile } = content;

  return (
    <Document
      title={`${profile.name} — CV`}
      author={profile.name}
      subject={`Curriculum vitae of ${profile.name}, ${profile.title}`}
      creator={profile.name}
    >
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.title}>{profile.title}</Text>
          <View style={styles.contact}>
            <Text style={styles.contactItem}>{profile.location}</Text>
            <Link src={`mailto:${profile.email}`} style={styles.contactItem}>
              {profile.email}
            </Link>
            <Link src={profile.links.linkedin} style={styles.contactItem}>
              {profile.links.linkedin}
            </Link>
            <Link src={profile.links.github} style={styles.contactItem}>
              {profile.links.github}
            </Link>
          </View>
        </View>

        <Section title="Profile">
          <Text>{profile.summary}</Text>
        </Section>

        <Section title="Experience">
          {sortRoles(content.career).map((role) => (
            <Role key={`${role.company}-${role.start}`} role={role} content={content} />
          ))}
        </Section>

        <Section title="Earlier work">
          {sortEarlierWork(content.earlierWork).map((entry) => (
            <View key={entry.title} style={styles.earlier} wrap={false}>
              <Text>
                <Text style={styles.roleTitle}>{entry.title}</Text>
                <Text style={styles.muted}>
                  {' '}
                  · {entry.company} · {entry.period} · {entry.role} · {entry.sector}
                </Text>
              </Text>
              <Text style={styles.muted}>
                {entry.stack.map((slug) => techName(content.technologies, slug)).join(', ')}
              </Text>
            </View>
          ))}
        </Section>

        <Section title="Skills">
          {SKILL_CATEGORIES.map((category) => (
            <View key={category} style={styles.skillRow} wrap={false}>
              <Text style={styles.skillCategory}>{CATEGORY_LABELS[category]}</Text>
              <Text style={styles.skillList}>
                {content.skills[category]
                  .map((skill) => `${skill.name} (${capitalize(skill.level)})`)
                  .join(', ')}
              </Text>
            </View>
          ))}
        </Section>

        <Section title="Languages">
          <Text>
            {profile.spoken_languages
              .map((language) => `${language.name} (${capitalize(language.level)})`)
              .join(', ')}
          </Text>
        </Section>
      </Page>
    </Document>
  );
}

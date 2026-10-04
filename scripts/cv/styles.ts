import { StyleSheet } from '@react-pdf/renderer';

export const FONT_FAMILY = 'Inter';

const INK = '#111827';
const MUTED = '#4b5563';
const RULE = '#d1d5db';

export const styles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    lineHeight: 1.4,
    color: INK,
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
  },
  name: { fontSize: 20, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 },
  title: { fontSize: 11, color: MUTED, marginTop: 2, lineHeight: 1.3 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, color: MUTED },
  contactItem: { marginRight: 10, color: MUTED, textDecoration: 'none' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    marginTop: 14,
    marginBottom: 6,
    paddingBottom: 2,
    borderBottomWidth: 0.75,
    borderBottomColor: RULE,
  },
  role: { marginBottom: 9 },
  roleHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  roleTitle: { fontWeight: 600 },
  muted: { color: MUTED },
  label: { fontWeight: 600, marginTop: 3 },
  paragraph: { marginTop: 2 },
  bullet: { flexDirection: 'row', marginTop: 1 },
  bulletMark: { width: 10 },
  bulletText: { flex: 1 },
  phase: { marginTop: 2 },
  earlier: { marginBottom: 4 },
  skillRow: { flexDirection: 'row', marginBottom: 2 },
  skillCategory: { width: 78, fontWeight: 600 },
  skillList: { flex: 1 },
});

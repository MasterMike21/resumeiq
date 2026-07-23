import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  header: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#1E293B', pb: 8 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  role: { fontSize: 12, color: '#475569', marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1E1B4B', marginTop: 12, marginBottom: 6, textTransform: 'uppercase' },
  bullet: { fontSize: 10, color: '#334155', marginBottom: 4, leading: 1.4 },
});

const ResumePdfDocument = ({ name, role, skills, bullets }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.name}>{name || "Verified Candidate"}</Text>
        <Text style={styles.role}>{role || "Full-Stack Software Engineer"}</Text>
      </View>

      <View>
        <Text style={styles.sectionTitle}>Technical Core Stack</Text>
        <Text style={styles.bullet}>{Array.isArray(skills) ? skills.join(' • ') : skills}</Text>
      </View>

      <View>
        <Text style={styles.sectionTitle}>Key Professional Achievements (ATS Optimized)</Text>
        {(bullets || [
          "Architected responsive microservices engine utilizing Node.js and MongoDB, scaling data bandwidth by +35%.",
          "Deployed real-time state synchronization algorithms across frontend React dashboards, cutting network latency."
        ]).map((bullet, idx) => (
          <Text key={idx} style={styles.bullet}>• {bullet}</Text>
        ))}
      </View>
    </Page>
  </Document>
);

export default function PdfExport({ name, role, skills, bullets }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
      <div>
        <h4 className="text-sm font-bold text-white">Export ATS-Compliant PDF</h4>
        <p className="text-xs text-slate-400">Generate single-page recruiter ready document.</p>
      </div>

      <PDFDownloadLink
        document={<ResumePdfDocument name={name} role={role} skills={skills} bullets={bullets} />}
        fileName={`ResumeIQ_${name ? name.replace(/\s+/g, '_') : 'Optimized'}.pdf`}
        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2"
      >
        {({ loading }) => (
          <>
            <Download size={14} />
            {loading ? 'Preparing PDF...' : 'Download PDF'}
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
}
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { Card, Text, Button, Chip, ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import XLSX from 'xlsx';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';

// Native modules — only available on mobile
const DocumentPicker = Platform.OS !== 'web' ? require('expo-document-picker') : null;
const FileSystem = Platform.OS !== 'web' ? require('expo-file-system') : null;
const Sharing = Platform.OS !== 'web' ? require('expo-sharing') : null;

export default function ImportExportScreen() {
  const { theme } = useTheme();
  const { members, importMembers, exportMembersData } = useData();
  const c = theme.colors;
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState(null); // { rows, mapped, errors }
  const [importDone, setImportDone] = useState(null); // { added, skipped }

  // ── Smart column mapper ──────────────────────────────────────────────────
  const detectCol = (headers, ...keywords) => {
    const lower = headers.map(h => (h || '').toString().toLowerCase().trim());
    for (const kw of keywords) {
      const idx = lower.findIndex(h => h.includes(kw));
      if (idx !== -1) return headers[idx];
    }
    return null;
  };

  const mapRow = (row, colMap) => {
    const g = (col) => col ? (row[col] ?? '') : '';
    const name = String(g(colMap.name)).trim();
    const phone = String(g(colMap.phone)).trim().replace(/\D/g, '').slice(-10);
    const plan = String(g(colMap.plan)).trim();
    const startDate = parseDate(g(colMap.startDate));
    const endDate = parseDate(g(colMap.endDate));
    const dueAmount = parseFloat(g(colMap.dueAmount)) || 0;
    const status = String(g(colMap.status)).trim().toLowerCase() || 'active';
    const rollNo = String(g(colMap.rollNo)).trim();
    const fatherName = String(g(colMap.fatherName)).trim();
    const dob = parseDate(g(colMap.dob));
    const address = String(g(colMap.address)).trim();
    const gender = String(g(colMap.gender)).trim() || 'Male';
    return { name, phone, plan, startDate, endDate, dueAmount, status, rollNo, fatherName, dob, address, gender };
  };

  const parseDate = (val) => {
    if (!val) return '';
    // Excel serial date number
    if (typeof val === 'number') {
      const d = XLSX.SSF.parse_date_code(val);
      if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    }
    const s = String(val).trim();
    if (!s || s === 'undefined') return '';
    // Try DD/MM/YYYY
    const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
    if (dmy) {
      const year = dmy[3].length === 2 ? '20' + dmy[3] : dmy[3];
      return `${year}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    }
    // Try YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    return s;
  };

  // ── IMPORT ────────────────────────────────────────────────────────────────
  const handlePickFile = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: use HTML file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx,.xls';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          setImporting(true);
          setPreview(null);
          setImportDone(null);
          const reader = new FileReader();
          reader.onload = async (ev) => {
            try {
              const data = new Uint8Array(ev.target.result);
              const workbook = XLSX.read(data, { type: 'array', cellDates: false });
              await processWorkbook(workbook);
            } catch (err) {
              Alert.alert('Error', 'File read nahi hua: ' + err.message);
            }
            setImporting(false);
          };
          reader.readAsArrayBuffer(file);
        };
        input.click();
        return;
      }

      // Mobile
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
               'application/vnd.ms-excel', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      setImporting(true);
      setPreview(null);
      setImportDone(null);
      const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
      const workbook = XLSX.read(base64, { type: 'base64', cellDates: false });
      await processWorkbook(workbook);
      setImporting(false);
    } catch (e) {
      setImporting(false);
      Alert.alert('Error', 'File read nahi hua: ' + e.message);
    }
  };

  const processWorkbook = async (workbook) => {
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (!jsonData.length) {
      Alert.alert('Error', 'Excel file mein koi data nahi mila!');
      return;
    }
    const headers = Object.keys(jsonData[0]);
    const colMap = {
      rollNo:     detectCol(headers, 'serial', 's.no', 'roll', 'sr', 'id'),
      name:       detectCol(headers, 'name', 'full name', 'member name', 'naam'),
      fatherName: detectCol(headers, 'father', 'parent'),
      phone:      detectCol(headers, 'mobile', 'phone', 'contact', 'number'),
      plan:       detectCol(headers, 'plan', 'membership', 'package'),
      startDate:  detectCol(headers, 'join', 'start', 'from', 'joining'),
      endDate:    detectCol(headers, 'expiry', 'expire', 'end', 'valid', 'due date'),
      dueAmount:  detectCol(headers, 'due', 'pending', 'balance', 'remaining'),
      status:     detectCol(headers, 'status'),
      dob:        detectCol(headers, 'dob', 'birth', 'birthday'),
      address:    detectCol(headers, 'address', 'addr'),
      gender:     detectCol(headers, 'gender', 'sex'),
    };
    const mapped = jsonData.map((row, i) => ({ ...mapRow(row, colMap), _row: i + 2 }));
    const valid = mapped.filter(r => r.name && r.name.length > 1);
    const errors = mapped.filter(r => !r.name || r.name.length <= 1);
    setPreview({ rows: valid, errors, total: jsonData.length, colMap, headers });
  };

  const handleConfirmImport = async () => {
    if (!preview) return;
    setImporting(true);
    try {
      const result = await importMembers(preview.rows);
      setImportDone(result);
      setPreview(null);
    } catch (e) {
      Alert.alert('Error', 'Import failed: ' + e.message);
    }
    setImporting(false);
  };

  // ── EXPORT ────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!members.length) { Alert.alert('Error', 'Koi member nahi hai export karne ke liye'); return; }
    setExporting(true);
    try {
      const rows = members.map((m, i) => ({
        'S.No': i + 1,
        'Roll No': m.rollNo || '',
        'Name': m.name || '',
        'Father Name': m.fatherName || '',
        'Phone': m.phone || '',
        'Plan': m.plan || '',
        'Join Date': m.startDate || '',
        'Expiry Date': m.endDate || '',
        'Due Amount': m.dueAmount || 0,
        'Paid Amount': m.paidAmount || 0,
        'Total Amount': m.totalAmount || 0,
        'Status': m.status || 'active',
        'DOB': m.dob || '',
        'Address': m.address || '',
        'Gender': m.gender || '',
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Members');
      ws['!cols'] = [
        { wch: 5 }, { wch: 8 }, { wch: 22 }, { wch: 20 }, { wch: 14 },
        { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 8 },
      ];

      const date = new Date().toISOString().slice(0, 10);
      const fileName = `Gym_Members_${date}.xlsx`;

      if (Platform.OS === 'web') {
        // Web: trigger browser download
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Mobile: save and share
        const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const fileUri = FileSystem.cacheDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Gym Members Export',
          });
        } else {
          Alert.alert('Saved', `File saved:\n${fileUri}`);
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Export failed: ' + e.message);
    }
    setExporting(false);
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

      {/* Import Card */}
      <Card style={[styles.card, { backgroundColor: c.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="file-import" size={28} color="#4CAF50" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.cardTitle, { color: c.text }]}>Import from Excel</Text>
              <Text style={{ fontSize: 12, color: c.muted }}>
                Excel (.xlsx) file se members import karein — Firebase automatically update hoga
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            icon="file-excel"
            onPress={handlePickFile}
            loading={importing}
            disabled={importing}
            buttonColor="#4CAF50"
            style={{ marginTop: 14, borderRadius: 8 }}
            labelStyle={{ fontWeight: '700' }}>
            {importing ? 'Reading File...' : 'Select Excel File'}
          </Button>
        </Card.Content>
      </Card>

      {/* Preview */}
      {preview && (
        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: c.text, marginBottom: 8 }]}>Preview</Text>
            <View style={styles.statsRow}>
              <Chip icon="check-circle" style={{ backgroundColor: '#E8F5E9' }} textStyle={{ color: '#4CAF50', fontSize: 12 }}>
                Valid: {preview.rows.length}
              </Chip>
              <Chip icon="alert-circle" style={{ backgroundColor: '#FFEBEE' }} textStyle={{ color: '#F44336', fontSize: 12 }}>
                Skipped: {preview.errors.length}
              </Chip>
              <Chip icon="file" style={{ backgroundColor: '#E3F2FD' }} textStyle={{ color: '#2196F3', fontSize: 12 }}>
                Total: {preview.total}
              </Chip>
            </View>

            {/* Column map detected */}
            <Text style={{ fontSize: 12, color: c.muted, marginTop: 10, marginBottom: 4 }}>Detected Columns:</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {Object.entries(preview.colMap).filter(([, v]) => v).map(([k, v]) => (
                <Chip key={k} compact style={{ backgroundColor: '#F3E5F5', marginBottom: 4 }}
                  textStyle={{ fontSize: 10, color: '#7B1FA2' }}>{k}: {v}</Chip>
              ))}
            </View>

            {/* Sample rows */}
            <Text style={{ fontSize: 12, color: c.muted, marginTop: 10 }}>First 3 members preview:</Text>
            {preview.rows.slice(0, 3).map((r, i) => (
              <View key={i} style={[styles.previewRow, { borderColor: c.border }]}>
                <Text style={{ fontWeight: '600', color: c.text, fontSize: 13 }}>{r.name}</Text>
                <Text style={{ fontSize: 11, color: c.muted }}>{r.phone} • {r.plan} • Expiry: {r.endDate || 'N/A'}</Text>
              </View>
            ))}

            <View style={styles.btnRow}>
              <Button mode="outlined" onPress={() => setPreview(null)}
                style={{ flex: 1 }} textColor={c.muted}>Cancel</Button>
              <Button mode="contained" icon="cloud-upload" onPress={handleConfirmImport}
                buttonColor="#4CAF50" style={{ flex: 2, marginLeft: 8 }}
                labelStyle={{ fontWeight: '700' }}>
                Import {preview.rows.length} Members to Firebase
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Import Done */}
      {importDone && (
        <Card style={[styles.card, { backgroundColor: '#E8F5E9', borderColor: '#4CAF50', borderWidth: 1 }]}>
          <Card.Content style={{ alignItems: 'center', paddingVertical: 20 }}>
            <MaterialCommunityIcons name="check-circle" size={48} color="#4CAF50" />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginTop: 8 }}>Import Successful!</Text>
            <Text style={{ color: '#388E3C', marginTop: 4 }}>✅ Added: {importDone.added} members</Text>
            <Text style={{ color: '#F57C00', marginTop: 2 }}>⏭ Skipped (already exist): {importDone.skipped}</Text>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Firebase automatically sync ho gaya!</Text>
            <Button mode="contained" buttonColor="#4CAF50" style={{ marginTop: 12 }}
              onPress={() => setImportDone(null)}>Done</Button>
          </Card.Content>
        </Card>
      )}

      {/* Export Card */}
      <Card style={[styles.card, { backgroundColor: c.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="file-export" size={28} color="#2196F3" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.cardTitle, { color: c.text }]}>Export to Excel</Text>
              <Text style={{ fontSize: 12, color: c.muted }}>
                Saare {members.length} members ka data Excel file mein export karein
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            icon="microsoft-excel"
            onPress={handleExport}
            loading={exporting}
            disabled={exporting || !members.length}
            buttonColor="#2196F3"
            style={{ marginTop: 14, borderRadius: 8 }}
            labelStyle={{ fontWeight: '700' }}>
            {exporting ? 'Creating Excel...' : `Export ${members.length} Members`}
          </Button>
        </Card.Content>
      </Card>

      {/* Info Card */}
      <Card style={[styles.card, { backgroundColor: '#FFF8E1' }]}>
        <Card.Content>
          <Text style={{ fontWeight: '700', color: '#F57C00', marginBottom: 6 }}>
            📋 Excel Import Tips
          </Text>
          {[
            'Name, Phone, Plan, Join Date, Expiry Date columns detect ho jaate hain automatically',
            'Columns ka exact naam zaruri nahi — "name", "full name", "member name" sab kaam karte hain',
            'Date format: DD/MM/YYYY ya YYYY-MM-DD dono chalenge',
            'Agar member pehle se exist karta hai (same phone) toh skip ho jayega',
            'Import ke baad Firebase real-time sync hota hai — sab phones pe update',
          ].map((tip, i) => (
            <Text key={i} style={{ fontSize: 12, color: '#7B5800', marginBottom: 3 }}>• {tip}</Text>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 12, marginBottom: 14, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  previewRow: { borderWidth: 1, borderRadius: 8, padding: 8, marginTop: 6 },
  btnRow: { flexDirection: 'row', marginTop: 14 },
});

import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, Searchbar, Chip, FAB, Button, TextInput, Avatar, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { openWhatsApp, makeCall, formatDisplayDate } from '../../utils/helpers';

export default function EnquiryScreen({ navigation }) {
  const { theme } = useTheme();
  const { enquiries, addEnquiry, updateEnquiry, deleteEnquiry } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', interest: 'Gym', source: 'Walk-in', notes: '' });
  const c = theme.colors;

  const getFiltered = () => {
    let filtered = [...enquiries];
    if (selectedFilter !== 'all') filtered = filtered.filter(e => e.status === selectedFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => e.name?.toLowerCase().includes(q) || e.phone?.includes(q));
    }
    return filtered;
  };

  const handleAdd = async () => {
    if (!form.name.trim()) { Alert.alert('Error', 'Enter name'); return; }
    if (!form.phone || form.phone.length < 10) { Alert.alert('Error', 'Enter valid phone'); return; }
    await addEnquiry(form);
    setForm({ name: '', phone: '', interest: 'Gym', source: 'Walk-in', notes: '' });
    setShowAdd(false);
    Alert.alert('Success', 'Enquiry added!');
  };

  const handleConvert = (enquiry) => {
    Alert.alert('Convert to Member', `Convert ${enquiry.name} to member?`, [
      { text: 'Cancel' },
      { text: 'Convert', onPress: async () => {
        await updateEnquiry(enquiry.id, { status: 'converted' });
        navigation.navigate('AddMember', { prefill: { name: enquiry.name, phone: enquiry.phone } });
      }},
    ]);
  };

  const handleFollowUp = (enquiry) => {
    updateEnquiry(enquiry.id, { status: 'followup' });
    openWhatsApp(enquiry.phone, `Hi ${enquiry.name}, this is SG Fitness Evolution. We'd love to have you join our gym! Any questions?`);
  };

  const handleDelete = (enquiry) => {
    Alert.alert('Delete', `Delete enquiry for ${enquiry.name}?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEnquiry(enquiry.id) },
    ]);
  };

  const statusColors = { new: '#2196F3', followup: '#FF9800', converted: '#4CAF50', lost: '#FF5252' };
  const statusLabels = { new: 'New', followup: 'Follow Up', converted: 'Converted', lost: 'Lost' };

  const renderEnquiry = ({ item }) => (
    <Card style={[styles.card, { backgroundColor: c.surface }]}>
      <Card.Content>
        <View style={styles.row}>
          <Avatar.Text size={44} label={item.name?.substring(0, 2).toUpperCase()}
            style={{ backgroundColor: (statusColors[item.status] || '#999') + '25' }}
            labelStyle={{ color: statusColors[item.status] || '#999', fontWeight: 'bold' }} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: c.text }]}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: c.muted }}>{item.phone} • {item.interest}</Text>
            <Text style={{ fontSize: 11, color: c.muted }}>Source: {item.source} • {formatDisplayDate(item.createdAt)}</Text>
          </View>
          <Chip mode="flat" style={{ backgroundColor: (statusColors[item.status] || '#999') + '18', height: 24 }}
            textStyle={{ fontSize: 10, color: statusColors[item.status] }}>{statusLabels[item.status] || item.status}</Chip>
        </View>
        {item.notes ? <Text style={{ fontSize: 12, color: c.muted, marginTop: 6, fontStyle: 'italic' }}>"{item.notes}"</Text> : null}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actBtn} onPress={() => openWhatsApp(item.phone)}>
            <MaterialCommunityIcons name="whatsapp" size={20} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actBtn} onPress={() => makeCall(item.phone)}>
            <MaterialCommunityIcons name="phone" size={20} color="#2196F3" />
          </TouchableOpacity>
          {item.status !== 'converted' && (
            <>
              <Button compact mode="contained" onPress={() => handleConvert(item)}
                style={{ backgroundColor: '#4CAF50', marginLeft: 8 }} labelStyle={{ fontSize: 11 }}>Convert</Button>
              <Button compact mode="outlined" onPress={() => handleFollowUp(item)}
                style={{ marginLeft: 5 }} labelStyle={{ fontSize: 11 }}>Follow Up</Button>
            </>
          )}
          <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => handleDelete(item)}>
            <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <Searchbar placeholder="Search enquiries..." value={searchQuery} onChangeText={setSearchQuery}
        style={[styles.search, { backgroundColor: c.surface }]} />
      
      <View style={styles.filterRow}>
        {[{ id: 'all', l: `All (${enquiries.length})` }, { id: 'new', l: 'New' }, { id: 'followup', l: 'Follow Up' },
          { id: 'converted', l: 'Converted' }, { id: 'lost', l: 'Lost' }].map(f => (
          <Chip key={f.id} selected={selectedFilter === f.id} onPress={() => setSelectedFilter(f.id)}
            style={[styles.fChip, selectedFilter === f.id && { backgroundColor: c.primary + '20' }]}
            textStyle={{ fontSize: 11, color: selectedFilter === f.id ? c.primary : c.muted }}>{f.l}</Chip>
        ))}
      </View>

      {showAdd && (
        <Card style={[styles.addCard, { backgroundColor: '#FFF9E6' }]}>
          <Card.Content>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: c.primary }}>New Enquiry</Text>
            <TextInput label="Name *" value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))}
              mode="outlined" style={styles.inp} dense />
            <TextInput label="Phone *" value={form.phone} onChangeText={v => setForm(p => ({ ...p, phone: v }))}
              mode="outlined" keyboardType="phone-pad" maxLength={10} style={styles.inp} dense />
            <TextInput label="Interest" value={form.interest} onChangeText={v => setForm(p => ({ ...p, interest: v }))}
              mode="outlined" style={styles.inp} dense />
            <TextInput label="Source" value={form.source} onChangeText={v => setForm(p => ({ ...p, source: v }))}
              mode="outlined" style={styles.inp} dense />
            <TextInput label="Notes" value={form.notes} onChangeText={v => setForm(p => ({ ...p, notes: v }))}
              mode="outlined" style={styles.inp} dense />
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <Button mode="contained" onPress={handleAdd} style={{ flex: 1, marginRight: 5, backgroundColor: c.primary }}>Add</Button>
              <Button mode="outlined" onPress={() => setShowAdd(false)} style={{ flex: 1, marginLeft: 5 }}>Cancel</Button>
            </View>
          </Card.Content>
        </Card>
      )}

      <FlatList data={getFiltered()} renderItem={renderEnquiry} keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-question" size={50} color={c.muted} />
            <Text style={{ color: c.muted, marginTop: 10 }}>No enquiries</Text>
          </View>
        } />

      <FAB icon="plus" style={[styles.fab, { backgroundColor: c.primary }]} color="#fff"
        onPress={() => setShowAdd(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 15, marginBottom: 8, elevation: 2, borderRadius: 10 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8, flexWrap: 'wrap' },
  fChip: { marginRight: 6, marginBottom: 4, height: 30 },
  card: { marginHorizontal: 15, marginVertical: 4, elevation: 1, borderRadius: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 0.5, borderColor: '#E0E0E0' },
  actBtn: { padding: 6 },
  addCard: { marginHorizontal: 15, marginBottom: 10, elevation: 2 },
  inp: { marginBottom: 8, backgroundColor: 'transparent' },
  empty: { alignItems: 'center', paddingTop: 60 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});

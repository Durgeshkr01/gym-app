import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Card, Text, SegmentedButtons, TextInput, Button, Chip, Menu, Avatar, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { openWhatsApp, sendSMS, fillTemplate } from '../../utils/helpers';

export default function BroadcastScreen({ navigation }) {
  const { theme } = useTheme();
  const { members, getMemberStatus, messageTemplates, saveMessageTemplates } = useData();
  const c = theme.colors;
  const [tab, setTab] = useState('broadcast');
  const [message, setMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateText, setTemplateText] = useState('');

  const groups = [
    { id: 'all', label: 'All', icon: 'account-group' },
    { id: 'active', label: 'Active', icon: 'account-check' },
    { id: 'expiring', label: 'Expiring', icon: 'clock-alert' },
    { id: 'expired', label: 'Expired', icon: 'account-off' },
    { id: 'dues', label: 'With Dues', icon: 'cash-remove' },
    { id: 'birthday', label: 'Birthday', icon: 'cake-variant' },
    { id: 'custom', label: 'Custom', icon: 'account-multiple-check' },
  ];

  const getGroupMembers = () => {
    if (selectedGroup === 'custom') return members.filter(m => selectedMembers.includes(m.id));
    if (selectedGroup === 'all') return members;
    if (selectedGroup === 'birthday') {
      const today = new Date();
      return members.filter(m => {
        if (!m.dob) return false;
        const d = new Date(m.dob);
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
      });
    }
    return members.filter(m => {
      const s = getMemberStatus(m);
      if (selectedGroup === 'active') return s === 'active';
      if (selectedGroup === 'expiring') return s === 'expiring';
      if (selectedGroup === 'expired') return s === 'expired';
      if (selectedGroup === 'dues') return (m.dueAmount || 0) > 0;
      return true;
    });
  };

  const handleSendWhatsApp = () => {
    const targets = getGroupMembers();
    if (targets.length === 0) { Alert.alert('Error', 'No members in group'); return; }
    if (!message.trim()) { Alert.alert('Error', 'Enter message'); return; }
    Alert.alert('Send WhatsApp', `Send to ${targets.length} member(s) via WhatsApp?`, [
      { text: 'Cancel' },
      { text: 'Send', onPress: () => {
        targets.forEach((m, i) => {
          const filled = fillTemplate(message, { name: m.name, phone: m.phone, plan: m.plan, amount: m.dueAmount || 0, due: m.dueAmount || 0 });
          setTimeout(() => openWhatsApp(m.phone, filled), i * 2000);
        });
        Alert.alert('Sending', `Opening WhatsApp for ${targets.length} member(s). Please send each message.`);
      }},
    ]);
  };

  const handleSendSMS = () => {
    const targets = getGroupMembers();
    if (targets.length === 0) { Alert.alert('Error', 'No members in group'); return; }
    if (!message.trim()) { Alert.alert('Error', 'Enter message'); return; }
    targets.forEach((m, i) => {
      const filled = fillTemplate(message, { name: m.name, phone: m.phone, plan: m.plan, amount: m.dueAmount || 0 });
      setTimeout(() => sendSMS(m.phone, filled), i * 1500);
    });
  };

  const toggleMember = (id) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSaveTemplate = async (key) => {
    const updated = { ...messageTemplates, [key]: templateText };
    await saveMessageTemplates(updated);
    setEditingTemplate(null);
    Alert.alert('Saved', 'Template updated!');
  };

  const templateKeys = [
    { key: 'welcome', label: 'Welcome Message', icon: 'hand-wave' },
    { key: 'renewal', label: 'Renewal Reminder', icon: 'refresh' },
    { key: 'expiry', label: 'Expiry Notice', icon: 'clock-alert' },
    { key: 'birthday', label: 'Birthday Wish', icon: 'cake-variant' },
    { key: 'dues', label: 'Dues Reminder', icon: 'cash-remove' },
    { key: 'general', label: 'General Notice', icon: 'bullhorn' },
  ];

  const renderBroadcast = () => (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 15 }}>
      <Text style={[styles.secTitle, { color: c.text }]}>Select Group</Text>
      <View style={styles.groupRow}>
        {groups.map(g => (
          <TouchableOpacity key={g.id} style={[styles.groupBtn, selectedGroup === g.id && { backgroundColor: c.primary + '20', borderColor: c.primary }]}
            onPress={() => setSelectedGroup(g.id)}>
            <MaterialCommunityIcons name={g.icon} size={22} color={selectedGroup === g.id ? c.primary : c.muted} />
            <Text style={{ fontSize: 10, color: selectedGroup === g.id ? c.primary : c.muted, marginTop: 2 }}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.countBox, { backgroundColor: c.primary + '10' }]}>
        <MaterialCommunityIcons name="account-group" size={18} color={c.primary} />
        <Text style={{ color: c.primary, fontWeight: '600', marginLeft: 6 }}>{getGroupMembers().length} recipients</Text>
      </View>

      {selectedGroup === 'custom' && (
        <Card style={[styles.memberList, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text style={{ fontWeight: '600', marginBottom: 8, color: c.text }}>Select Members</Text>
            <ScrollView style={{ maxHeight: 200 }}>
              {members.map(m => (
                <TouchableOpacity key={m.id} style={styles.memberRow} onPress={() => toggleMember(m.id)}>
                  <Checkbox status={selectedMembers.includes(m.id) ? 'checked' : 'unchecked'} color={c.primary} />
                  <Text style={{ flex: 1, color: c.text }}>{m.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 12 }}>{m.phone}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>
      )}

      <Text style={[styles.secTitle, { color: c.text, marginTop: 15 }]}>Quick Templates</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {templateKeys.map(t => (
          <Chip key={t.key} icon={t.icon} mode="outlined" style={{ marginRight: 6 }}
            onPress={() => setMessage(messageTemplates[t.key] || `Hi {name}, message about ${t.label.toLowerCase()}`)}>
            {t.label}
          </Chip>
        ))}
      </ScrollView>

      <TextInput label="Message" value={message} onChangeText={setMessage} mode="outlined"
        multiline numberOfLines={4} style={{ backgroundColor: c.surface, marginBottom: 5 }}
        placeholder="Use {name}, {phone}, {plan}, {amount} for personalization" />
      <Text style={{ fontSize: 11, color: c.muted, marginBottom: 15 }}>Variables: {'{name}'}, {'{phone}'}, {'{plan}'}, {'{amount}'}, {'{due}'}</Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button mode="contained" icon="whatsapp" onPress={handleSendWhatsApp}
          style={{ flex: 1, backgroundColor: '#25D366' }} labelStyle={{ color: '#fff' }}>WhatsApp</Button>
        <Button mode="contained" icon="message" onPress={handleSendSMS}
          style={{ flex: 1, backgroundColor: '#2196F3' }} labelStyle={{ color: '#fff' }}>SMS</Button>
      </View>
    </ScrollView>
  );

  const renderTemplates = () => (
    <ScrollView contentContainerStyle={{ padding: 15 }}>
      <Text style={{ fontSize: 12, color: c.muted, marginBottom: 10 }}>
        Customize messages. Use {'{name}'}, {'{phone}'}, {'{plan}'}, {'{amount}'} for auto-fill.
      </Text>
      {templateKeys.map(t => (
        <Card key={t.key} style={[styles.tCard, { backgroundColor: c.surface }]}>
          <Card.Content>
            <View style={styles.row}>
              <MaterialCommunityIcons name={t.icon} size={20} color={c.primary} />
              <Text style={{ flex: 1, fontWeight: '600', marginLeft: 10, color: c.text }}>{t.label}</Text>
              {editingTemplate === t.key ? (
                <Button compact mode="contained" onPress={() => handleSaveTemplate(t.key)}
                  style={{ backgroundColor: c.primary }}>Save</Button>
              ) : (
                <TouchableOpacity onPress={() => { setEditingTemplate(t.key); setTemplateText(messageTemplates[t.key] || ''); }}>
                  <MaterialCommunityIcons name="pencil" size={20} color={c.primary} />
                </TouchableOpacity>
              )}
            </View>
            {editingTemplate === t.key ? (
              <TextInput value={templateText} onChangeText={setTemplateText} mode="outlined"
                multiline numberOfLines={3} style={{ marginTop: 8, backgroundColor: 'transparent' }} dense />
            ) : (
              <Text style={{ fontSize: 12, color: c.muted, marginTop: 8 }}>{messageTemplates[t.key] || 'No template set'}</Text>
            )}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  const renderIDCard = () => (
    <ScrollView contentContainerStyle={{ padding: 15 }}>
      <Card style={[styles.idCard, { backgroundColor: c.primary }]}>
        <Card.Content style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>SG FITNESS EVOLUTION</Text>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', marginVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="account" size={35} color={c.primary} />
          </View>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>Member Name</Text>
          <Text style={{ fontSize: 12, color: '#ffffffcc' }}>Roll No: 1</Text>
          <View style={styles.idDetails}>
            <View style={styles.idRow}>
              <Text style={styles.idLabel}>Phone:</Text>
              <Text style={styles.idValue}>9876543210</Text>
            </View>
            <View style={styles.idRow}>
              <Text style={styles.idLabel}>Plan:</Text>
              <Text style={styles.idValue}>Monthly</Text>
            </View>
            <View style={styles.idRow}>
              <Text style={styles.idLabel}>Valid:</Text>
              <Text style={styles.idValue}>01/01/2024 - 01/02/2024</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      <Text style={{ textAlign: 'center', color: c.muted, marginTop: 15, fontSize: 12 }}>
        ID Card generation will be available with member data.{'\n'}Select a member from Members screen to generate.
      </Text>
      <Button mode="outlined" icon="account-group" onPress={() => navigation.navigate('Members')}
        style={{ marginTop: 10 }}>Go to Members</Button>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <SegmentedButtons value={tab} onValueChange={setTab}
        buttons={[
          { value: 'broadcast', label: 'Broadcast', icon: 'bullhorn' },
          { value: 'templates', label: 'Templates', icon: 'file-document' },
          { value: 'idcard', label: 'ID Card', icon: 'card-account-details' },
        ]}
        style={{ margin: 15, marginBottom: 5 }} />
      {tab === 'broadcast' && renderBroadcast()}
      {tab === 'templates' && renderTemplates()}
      {tab === 'idcard' && renderIDCard()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  secTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  groupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  groupBtn: { width: 70, height: 60, borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center' },
  countBox: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 10 },
  memberList: { marginBottom: 10, borderRadius: 10 },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  tCard: { marginBottom: 10, borderRadius: 10, elevation: 1 },
  idCard: { borderRadius: 15, elevation: 3 },
  idDetails: { width: '100%', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderColor: '#ffffff44' },
  idRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  idLabel: { color: '#ffffffaa', fontSize: 12 },
  idValue: { color: '#fff', fontSize: 12, fontWeight: '600' },
});

import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Clipboard } from 'react-native';
import { Card, Text, TextInput, Button, Chip, Modal, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { openWhatsApp, sendSMS, makeCall, fillTemplate } from '../../utils/helpers';

export default function MessageSettingsScreen({ navigation }) {
  const { theme } = useTheme();
  const { messageTemplates, saveMessageTemplates } = useData();
  const c = theme.colors;

  const normalise = (tpls) => {
    const out = {};
    for (const [k, v] of Object.entries(tpls)) {
      if (typeof v === 'string') out[k] = { whatsapp: v, sms: v };
      else out[k] = { whatsapp: v?.whatsapp || '', sms: v?.sms || '' };
    }
    return out;
  };

  const [templates, setTemplates] = useState(normalise(messageTemplates));
  const [editKey, setEditKey] = useState(null);
  const [editChannel, setEditChannel] = useState('whatsapp');

  const templateDefs = [
    { key: 'welcome', label: 'Welcome Message', icon: 'hand-wave', color: '#4CAF50',
      desc: 'Sent when a new member joins. Variables: {name}, {phone}, {plan}, {rollNo}',
      defaultWA: 'Welcome to SG Fitness Evolution, {name}! 🏋️\nYour Roll No: {rollNo}\nPlan: {plan}\nLet\'s achieve your fitness goals together! 💪',
      defaultSMS: 'Welcome to SG Fitness Evolution, {name}! Roll No: {rollNo}, Plan: {plan}. Happy training!',
    },
    { key: 'renewal', label: 'Renewal Reminder', icon: 'refresh', color: '#2196F3',
      desc: 'Sent to members whose plan is about to expire. Variables: {name}, {plan}, {endDate}',
      defaultWA: 'Hi {name}, your {plan} membership is expiring on {endDate}. Please renew to continue your fitness journey! 💪 - SG Fitness Evolution',
      defaultSMS: 'Hi {name}, your {plan} membership expires on {endDate}. Please renew. - SG Fitness Evolution',
    },
    { key: 'expiry', label: 'Expiry Notice', icon: 'clock-alert', color: '#FF9800',
      desc: 'Sent when membership has expired. Variables: {name}, {plan}, {endDate}',
      defaultWA: 'Hi {name}, your gym membership has expired on {endDate}. We miss you! Come renew today. 🏋️ - SG Fitness Evolution',
      defaultSMS: 'Hi {name}, membership expired on {endDate}. Please renew. - SG Fitness Evolution',
    },
    { key: 'birthday', label: 'Birthday Wish', icon: 'cake-variant', color: '#E91E63',
      desc: 'Auto-sent on member birthday. Variables: {name}',
      defaultWA: 'Happy Birthday {name}! 🎂🥳 Wishing you an amazing year ahead!\nEnjoy your special day. - SG Fitness Evolution',
      defaultSMS: 'Happy Birthday {name}! Wishing you a great year. - SG Fitness Evolution',
    },
    { key: 'dues', label: 'Dues Reminder', icon: 'cash-remove', color: '#F44336',
      desc: 'Sent for payment reminders. Variables: {name}, {due_amount}',
      defaultWA: 'Dear {name}, you have pending dues of ₹{due_amount} at SG Fitness Evolution.\n\nPlease clear your dues at your earliest convenience.\n\nThank you! 🙏',
      defaultSMS: 'Dear {name}, pending dues ₹{due_amount} at SG Fitness Evolution. Please clear soon.',
    },
    { key: 'general', label: 'General Notice', icon: 'bullhorn', color: '#9C27B0',
      desc: 'For broadcast announcements. Variables: {name}',
      defaultWA: 'Hi {name}, this is an announcement from SG Fitness Evolution. We hope to see you at the gym soon! 💪',
      defaultSMS: 'Hi {name}, announcement from SG Fitness Evolution.',
    },
    { key: 'checkin', label: 'Attendance Alert', icon: 'clock-check', color: '#009688',
      desc: 'Sent when member checks in. Variables: {name}',
      defaultWA: 'Hi {name}! 💪 Your attendance has been marked at SG Fitness Evolution.\nKeep crushing your goals! 🏋️',
      defaultSMS: 'Hi {name}, attendance marked at SG Fitness Evolution. Keep it up!',
    },
    { key: 'inactive', label: 'Inactive Member', icon: 'account-off', color: '#795548',
      desc: 'Sent to members who haven\'t visited. Variables: {name}',
      defaultWA: 'Hi {name}, we miss you at SG Fitness Evolution! 😊\nIt\'s been a while since your last visit.\nCome back and let\'s get back on track! 💪🔥',
      defaultSMS: 'Hi {name}, we miss you at SG Fitness Evolution! Come back and continue your fitness journey!',
    },
  ];

  const sampleData = { name: 'John', phone: '9876543210', plan: 'Monthly', rollNo: '1',
    startDate: '01/01/2026', endDate: '31/01/2026', expiryDate: '31/01/2026', dueAmount: '500',
    gymName: 'SG Fitness Evolution' };

  const updateTemplate = (key, channel, value) => {
    setTemplates(prev => ({ ...prev, [key]: { ...prev[key], [channel]: value } }));
  };

  const handleSave = async () => {
    await saveMessageTemplates(templates);
    Alert.alert('Saved!', 'All message templates updated successfully.');
  };

  const handleReset = (key) => {
    const def = templateDefs.find(t => t.key === key);
    if (def) {
      setTemplates(prev => ({
        ...prev,
        [key]: { whatsapp: def.defaultWA, sms: def.defaultSMS },
      }));
    }
  };

  const handleResetAll = () => {
    Alert.alert('Reset All', 'Reset all templates to defaults?', [
      { text: 'Cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => {
        const defaults = {};
        templateDefs.forEach(t => { defaults[t.key] = { whatsapp: t.defaultWA, sms: t.defaultSMS }; });
        setTemplates(defaults);
      }},
    ]);
  };

  // Action: Test WhatsApp with sample data
  const handleTestWA = (key) => {
    const msg = fillTemplate(templates[key]?.whatsapp || '', sampleData);
    Alert.alert('Test WhatsApp', 'Enter a phone number to send test WhatsApp message.\n\nPreview:\n' + msg, [
      { text: 'Cancel' },
      { text: 'Preview Only', onPress: () => {} },
    ]);
  };

  // Action: Test SMS with sample data
  const handleTestSMS = (key) => {
    const msg = fillTemplate(templates[key]?.sms || '', sampleData);
    Alert.alert('Test SMS', 'Preview:\n\n' + msg, [
      { text: 'Cancel' },
      { text: 'OK' },
    ]);
  };

  // Action: Open edit modal
  const handleEdit = (key) => {
    setEditKey(key);
    setEditChannel('whatsapp');
  };

  const getVars = (desc) => desc.match(/\{(\w+)\}/g) || [];

  const editDef = editKey ? templateDefs.find(t => t.key === editKey) : null;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 30 }}>
        {/* Info tip */}
        <View style={[styles.tipBox, { backgroundColor: c.primary + '10' }]}>
          <MaterialCommunityIcons name="information" size={18} color={c.primary} />
          <Text style={{ flex: 1, marginLeft: 8, fontSize: 12, color: c.primary }}>
            Customize templates for auto-messages. Use variables in {'{curly braces}'} for personalization.
          </Text>
        </View>

        {templateDefs.map(tDef => {
          const waText = templates[tDef.key]?.whatsapp || tDef.defaultWA;
          const vars = getVars(tDef.desc);
          return (
            <Card key={tDef.key} style={[styles.card, { backgroundColor: c.surface }]}>
              <Card.Content>
                {/* Template header */}
                <View style={styles.headerRow}>
                  <View style={[styles.iconBox, { backgroundColor: tDef.color + '15' }]}>
                    <MaterialCommunityIcons name={tDef.icon} size={20} color={tDef.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>{tDef.label}</Text>
                    <Text style={{ fontSize: 11, color: c.muted, marginTop: 1 }}>{tDef.desc}</Text>
                  </View>
                </View>

                {/* Template text preview (like old app) */}
                <View style={[styles.templateBox, { backgroundColor: c.background, borderColor: tDef.color + '30' }]}>
                  <Text style={{ fontSize: 13, color: c.text, lineHeight: 20 }}>{waText}</Text>
                </View>

                {/* 4 Action buttons row (like old app) */}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
                    onPress={() => handleTestWA(tDef.key)}>
                    <MaterialCommunityIcons name="whatsapp" size={14} color="#fff" />
                    <Text style={styles.actionLabel}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF9800' }]}
                    onPress={() => handleTestSMS(tDef.key)}>
                    <MaterialCommunityIcons name="message-text" size={14} color="#fff" />
                    <Text style={styles.actionLabel}>SMS</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2196F3' }]}
                    onPress={() => {
                      try { Clipboard.setString(waText); Alert.alert('Copied!', 'Template copied to clipboard.'); }
                      catch(e) { Alert.alert('Copy', waText); }
                    }}>
                    <MaterialCommunityIcons name="content-copy" size={14} color="#fff" />
                    <Text style={styles.actionLabel}>Copy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#9C27B0' }]}
                    onPress={() => handleEdit(tDef.key)}>
                    <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
                    <Text style={styles.actionLabel}>Edit</Text>
                  </TouchableOpacity>
                </View>

                {/* Reset link */}
                <TouchableOpacity onPress={() => handleReset(tDef.key)} style={{ alignSelf: 'center', marginTop: 6 }}>
                  <Text style={{ fontSize: 12, color: c.muted }}>Reset</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          );
        })}

        {/* Bottom save row */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Button mode="contained" onPress={handleSave} icon="content-save"
            style={{ flex: 2, backgroundColor: c.primary }}>Save All Templates</Button>
          <Button mode="outlined" onPress={handleResetAll} icon="refresh"
            style={{ flex: 1 }}>Reset All</Button>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Portal>
        <Modal visible={!!editKey} onDismiss={() => setEditKey(null)}
          contentContainerStyle={[styles.modal, { backgroundColor: c.surface }]}>
          {editDef && (
            <ScrollView>
              <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 10 }}>
                Edit: {editDef.label}
              </Text>

              {/* Channel toggle */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <TouchableOpacity
                  style={[styles.channelTab, editChannel === 'whatsapp' && { backgroundColor: '#25D366', borderColor: '#25D366' }]}
                  onPress={() => setEditChannel('whatsapp')}>
                  <MaterialCommunityIcons name="whatsapp" size={16} color={editChannel === 'whatsapp' ? '#fff' : '#25D366'} />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: editChannel === 'whatsapp' ? '#fff' : '#25D366', marginLeft: 4 }}>WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.channelTab, editChannel === 'sms' && { backgroundColor: '#FF9800', borderColor: '#FF9800' }]}
                  onPress={() => setEditChannel('sms')}>
                  <MaterialCommunityIcons name="message-text" size={16} color={editChannel === 'sms' ? '#fff' : '#FF9800'} />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: editChannel === 'sms' ? '#fff' : '#FF9800', marginLeft: 4 }}>SMS</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={templates[editDef.key]?.[editChannel] || (editChannel === 'whatsapp' ? editDef.defaultWA : editDef.defaultSMS)}
                onChangeText={v => updateTemplate(editDef.key, editChannel, v)}
                mode="outlined"
                multiline
                numberOfLines={6}
                style={{ backgroundColor: c.background }}
                dense
              />

              {/* Variables hint */}
              <Text style={{ fontSize: 11, color: c.muted, marginTop: 6 }}>Available variables:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                {getVars(editDef.desc).map(v => (
                  <Chip key={v} mode="flat" style={{ height: 24, backgroundColor: editDef.color + '12' }}
                    textStyle={{ fontSize: 10, color: editDef.color }}>{v}</Chip>
                ))}
              </View>

              {/* Preview */}
              <Text style={{ fontSize: 11, color: c.muted, marginTop: 10 }}>Preview:</Text>
              <View style={[styles.templateBox, { backgroundColor: c.background, borderColor: editDef.color + '30', marginTop: 4 }]}>
                <Text style={{ fontSize: 12, color: c.text, lineHeight: 18 }}>
                  {fillTemplate(templates[editDef.key]?.[editChannel] || '', sampleData)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                <Button mode="contained" onPress={() => { setEditKey(null); }}
                  style={{ flex: 1, backgroundColor: editDef.color }}>Done</Button>
                <Button mode="outlined" onPress={() => {
                  const def = editChannel === 'whatsapp' ? editDef.defaultWA : editDef.defaultSMS;
                  updateTemplate(editDef.key, editChannel, def);
                }} style={{ flex: 1 }}>Reset</Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tipBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 12 },
  card: { marginBottom: 12, borderRadius: 12, elevation: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  templateBox: { padding: 12, borderRadius: 8, borderWidth: 1, marginTop: 4 },
  varsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 6 },
  actionLabel: { fontSize: 11, fontWeight: '600', color: '#fff', marginLeft: 4 },
  modal: { margin: 20, padding: 20, borderRadius: 15, maxHeight: '80%' },
  channelTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#ddd' },
});

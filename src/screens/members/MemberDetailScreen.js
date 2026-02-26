import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Avatar, Chip, Divider, Menu, IconButton, TextInput, Portal, Dialog, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { openWhatsApp, makeCall, sendSMS, getStatusColor, getStatusLabel, formatDisplayDate, calculateAge, formatCurrencyFull, fillTemplate, generateBill } from '../../utils/helpers';
import DateInput from '../../components/DateInput';

export default function MemberDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { members, deleteMember, collectDues, renewMember, plans, settings, messageTemplates } = useData();
  const c = theme.colors;
  const memberId = route?.params?.memberId;
  const member = members.find(m => m.id === memberId);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showCollect, setShowCollect] = useState(false);
  const [collectAmount, setCollectAmount] = useState('');
  const [showRenew, setShowRenew] = useState(false);
  const [renewPlanId, setRenewPlanId] = useState('');
  const [renewAmount, setRenewAmount] = useState('');
  const [renewMenuVisible, setRenewMenuVisible] = useState(false);
  const [renewMode, setRenewMode] = useState('auto'); // 'auto' | 'custom'
  const [renewStartDate, setRenewStartDate] = useState('');
  const [renewEndDate, setRenewEndDate] = useState('');

  if (!member) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <MaterialCommunityIcons name="account-off" size={60} color={c.muted} />
        <Text style={{ color: c.muted, marginTop: 10 }}>Member not found</Text>
      </View>
    );
  }

  const status = member.status || 'active';
  const statusColor = getStatusColor(status);

  const handleDelete = () => {
    Alert.alert('Delete Member', `Are you sure you want to delete ${member.name}?`, [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteMember(member.id); navigation.goBack(); } },
    ]);
  };

  const handleCollect = async () => {
    const amt = parseFloat(collectAmount);
    if (!amt || amt <= 0) { Alert.alert('Error', 'Enter valid amount'); return; }
    await collectDues(member.id, amt);
    setShowCollect(false);
    setCollectAmount('');
    Alert.alert('Success', `₹${amt} collected from ${member.name}`);
  };

  const handleRenew = async () => {
    if (!renewPlanId) { Alert.alert('Error', 'Select a plan'); return; }
    if (renewMode === 'custom') {
      if (!renewStartDate || !renewEndDate) { Alert.alert('Error', 'Start aur End date dono bharein (DD/MM/YYYY)'); return; }
      // convert DD/MM/YYYY to YYYY-MM-DD
      const toISO = (dmy) => {
        const p = dmy.trim().split('/');
        if (p.length === 3) return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
        return dmy;
      };
      const start = toISO(renewStartDate);
      const end = toISO(renewEndDate);
      if (new Date(end) <= new Date(start)) { Alert.alert('Error', 'End date, Start date se baad honi chahiye'); return; }
      const amt = parseFloat(renewAmount) || 0;
      await renewMember(member.id, renewPlanId, amt, 0, start, end);
    } else {
      const amt = parseFloat(renewAmount) || 0;
      await renewMember(member.id, renewPlanId, amt);
    }
    setShowRenew(false);
    setRenewMode('auto');
    setRenewStartDate('');
    setRenewEndDate('');
    const selectedPlan = plans.find(p => p.id === renewPlanId);
    const paymentSummary = { plan: selectedPlan?.name || 'Plan', amount: parseFloat(renewAmount) || 0, mode: 'Cash', date: new Date().toISOString(), status: 'paid' };
    Alert.alert('Membership Renewed! 🎉', `${member.name}'s membership renew ho gaya!`, [
      { text: '📲 Send Bill on WhatsApp', onPress: () => {
        const bill = generateBill(member, paymentSummary, settings?.gymName, settings?.gymPhone);
        openWhatsApp(member.phone, bill);
      }},
      { text: 'OK', style: 'cancel' },
    ]);
  };

  const sendWelcome = () => {
    const tmpl = messageTemplates?.welcome?.whatsapp || 'Welcome {name}!';
    const msg = fillTemplate(tmpl, { ...member, gymName: settings.gymName, gymPhone: settings.gymPhone });
    openWhatsApp(member.phone, msg);
  };

  const InfoRow = ({ icon, label, value, color }) => (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={20} color={color || c.muted} />
      <Text style={[styles.infoLabel, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: color || c.text }]}>{value || '-'}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header Card */}
      <Card style={[styles.headerCard, { backgroundColor: statusColor }]}>
        <Card.Content style={styles.headerContent}>
          <Avatar.Text size={70} label={member.name?.substring(0, 2).toUpperCase()}
            style={{ backgroundColor: 'rgba(255,255,255,0.25)' }} labelStyle={{ color: '#fff', fontWeight: 'bold' }} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{member.name}</Text>
            <Text style={styles.headerSub}>Roll #{member.rollNo} • {getStatusLabel(status)}</Text>
            <Text style={styles.headerSub}>{member.phone}</Text>
          </View>
          <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)}
            anchor={<IconButton icon="dots-vertical" iconColor="#fff" onPress={() => setMenuVisible(true)} />}>
            <Menu.Item onPress={() => { setMenuVisible(false); navigation.navigate('AddMember', { memberId: member.id }); }} title="Edit" leadingIcon="pencil" />
            <Menu.Item onPress={() => { setMenuVisible(false); handleDelete(); }} title="Delete" leadingIcon="delete" />
          </Menu>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.qBtn, { backgroundColor: '#25D366' }]} onPress={() => openWhatsApp(member.phone)}>
          <MaterialCommunityIcons name="whatsapp" size={22} color="#fff" />
          <Text style={styles.qBtnText}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.qBtn, { backgroundColor: '#2196F3' }]} onPress={() => makeCall(member.phone)}>
          <MaterialCommunityIcons name="phone" size={22} color="#fff" />
          <Text style={styles.qBtnText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.qBtn, { backgroundColor: '#FF9800' }]} onPress={() => sendSMS(member.phone)}>
          <MaterialCommunityIcons name="message-text" size={22} color="#fff" />
          <Text style={styles.qBtnText}>SMS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.qBtn, { backgroundColor: '#9C27B0' }]} onPress={sendWelcome}>
          <MaterialCommunityIcons name="hand-wave" size={22} color="#fff" />
          <Text style={styles.qBtnText}>Welcome</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Info */}
      <Card style={[styles.card, { backgroundColor: c.surface }]}>
        <Card.Content>
          <Text style={[styles.secTitle, { color: c.primary }]}>Personal Information</Text>
          <InfoRow icon="account" label="Name" value={member.name} />
          <InfoRow icon="account-supervisor" label="Father" value={member.fatherName} />
          <InfoRow icon="phone" label="Phone" value={member.phone} />
          {member.altPhone && <InfoRow icon="phone-plus" label="Alt Phone" value={member.altPhone} />}
          {member.email && <InfoRow icon="email" label="Email" value={member.email} />}
          <InfoRow icon="calendar" label="DOB" value={member.dob ? `${formatDisplayDate(member.dob)} (${calculateAge(member.dob)})` : '-'} />
          <InfoRow icon="gender-male-female" label="Gender" value={member.gender} />
          {member.address && <InfoRow icon="home" label="Address" value={member.address} />}
        </Card.Content>
      </Card>

      {/* Body Details */}
      <Card style={[styles.card, { backgroundColor: c.surface }]}>
        <Card.Content>
          <Text style={[styles.secTitle, { color: c.primary }]}>Body Details</Text>
          <InfoRow icon="human-male-height" label="Height" value={member.height ? `${member.height} cm` : '-'} />
          <InfoRow icon="weight" label="Weight" value={member.weight ? `${member.weight} kg` : '-'} />
          <InfoRow icon="water" label="Blood Group" value={member.bloodGroup} />
        </Card.Content>
      </Card>

      {/* Membership Details */}
      <Card style={[styles.card, { backgroundColor: c.surface }]}>
        <Card.Content>
          <Text style={[styles.secTitle, { color: c.primary }]}>Membership & Payment</Text>
          <InfoRow icon="card-account-details" label="Plan" value={member.plan} />
          <InfoRow icon="calendar-start" label="Start Date" value={formatDisplayDate(member.startDate)} />
          <InfoRow icon="calendar-end" label="End Date" value={formatDisplayDate(member.endDate)} color={statusColor} />
          <Divider style={{ marginVertical: 8 }} />
          <InfoRow icon="cash" label="Total Amount" value={formatCurrencyFull(member.totalAmount)} />
          <InfoRow icon="cash-check" label="Paid Amount" value={formatCurrencyFull(member.paidAmount)} color="#4CAF50" />
          <InfoRow icon="cash-remove" label="Due Amount" value={formatCurrencyFull(member.dueAmount)} color={member.dueAmount > 0 ? '#FF5252' : '#4CAF50'} />
          {member.discount > 0 && <InfoRow icon="sale" label="Discount" value={formatCurrencyFull(member.discount)} color="#FF9800" />}
        </Card.Content>
      </Card>

      {/* Collect Dues */}
      {showCollect && (
        <Card style={[styles.card, { backgroundColor: '#FFF9E6' }]}>
          <Card.Content>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Collect Dues</Text>
            <Text style={{ marginBottom: 8, color: '#666' }}>Pending: ₹{member.dueAmount}</Text>
            <TextInput label="Amount to Collect" value={collectAmount} onChangeText={setCollectAmount}
              mode="outlined" keyboardType="numeric" style={{ marginBottom: 10 }} />
            <View style={{ flexDirection: 'row' }}>
              <Button mode="contained" onPress={handleCollect} style={{ flex: 1, marginRight: 5, backgroundColor: '#4CAF50' }}>Collect</Button>
              <Button mode="outlined" onPress={() => setShowCollect(false)} style={{ flex: 1, marginLeft: 5 }}>Cancel</Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Renew */}
      {showRenew && (
        <Card style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
          <Card.Content>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Renew Membership</Text>
            <TouchableOpacity onPress={() => setRenewMenuVisible(true)}>
              <TextInput label="Select Plan" value={plans.find(p => p.id === renewPlanId)?.name || ''} mode="outlined"
                editable={false} pointerEvents="none" style={{ marginBottom: 10 }} right={<TextInput.Icon icon="chevron-down" />} />
            </TouchableOpacity>
            <Portal>
              <Dialog visible={renewMenuVisible} onDismiss={() => setRenewMenuVisible(false)} style={{ backgroundColor: '#fff', borderRadius: 12 }}>
                <Dialog.Title style={{ fontSize: 16 }}>Select Plan</Dialog.Title>
                <Dialog.ScrollArea style={{ maxHeight: 300, paddingHorizontal: 0 }}>
                  <ScrollView>
                    {plans.map(p => (
                      <TouchableOpacity key={p.id} onPress={() => { setRenewPlanId(p.id); setRenewAmount(String(p.amount || p.price || 0)); setRenewMenuVisible(false); }}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, backgroundColor: renewPlanId === p.id ? 'rgba(255,107,53,0.1)' : 'transparent' }}>
                        <RadioButton value={p.id} status={renewPlanId === p.id ? 'checked' : 'unchecked'} color="#FF6B35" />
                        <Text style={{ fontSize: 14, marginLeft: 8, flex: 1 }}>{p.name} - ₹{p.amount || p.price || 0}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Dialog.ScrollArea>
                <Dialog.Actions>
                  <Button onPress={() => setRenewMenuVisible(false)}>Cancel</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>

            {/* Duration Mode */}
            <Text style={{ fontWeight: 'bold', color: '#333', marginBottom: 6 }}>Membership Duration</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }} onPress={() => setRenewMode('auto')}>
              <RadioButton value="auto" status={renewMode === 'auto' ? 'checked' : 'unchecked'} onPress={() => setRenewMode('auto')} color="#4CAF50" />
              <Text style={{ color: '#333' }}>Auto — Aaj se plan ke hisaab se ({plans.find(p => p.id === renewPlanId)?.duration || '--'} din)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }} onPress={() => setRenewMode('custom')}>
              <RadioButton value="custom" status={renewMode === 'custom' ? 'checked' : 'unchecked'} onPress={() => setRenewMode('custom')} color="#4CAF50" />
              <Text style={{ color: '#333' }}>Custom Date — Khud date choose karo</Text>
            </TouchableOpacity>

            {renewMode === 'custom' && (
              <View style={{ backgroundColor: '#F1F8E9', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 12, color: '#558B2F', marginBottom: 6 }}>Format: DD/MM/YYYY (auto-formats as you type)</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <DateInput value={renewStartDate} onChangeText={setRenewStartDate}
                      label="Start Date" style={{ backgroundColor: '#fff' }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <DateInput value={renewEndDate} onChangeText={setRenewEndDate}
                      label="End Date" style={{ backgroundColor: '#fff' }} />
                  </View>
                </View>
              </View>
            )}

            <TextInput label="Paid Amount" value={renewAmount} onChangeText={setRenewAmount}
              mode="outlined" keyboardType="numeric" textColor="#333" style={{ marginBottom: 10 }} />
            <View style={{ flexDirection: 'row' }}>
              <Button mode="contained" onPress={handleRenew} style={{ flex: 1, marginRight: 5, backgroundColor: '#4CAF50' }}>Renew</Button>
              <Button mode="outlined" onPress={() => { setShowRenew(false); setRenewMode('auto'); setRenewStartDate(''); setRenewEndDate(''); }} style={{ flex: 1, marginLeft: 5 }}>Cancel</Button>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Button mode="contained" icon="autorenew" onPress={() => setShowRenew(!showRenew)}
          style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]}>Renew</Button>
        {(member.dueAmount || 0) > 0 && (
          <Button mode="contained" icon="cash" onPress={() => setShowCollect(!showCollect)}
            style={[styles.actionBtn, { backgroundColor: '#FF6B35' }]}>Collect Dues</Button>
        )}
        <Button mode="outlined" icon="pencil"
          onPress={() => navigation.navigate('AddMember', { memberId: member.id })}
          style={styles.actionBtn}>Edit</Button>
      </View>

      {member.notes ? (
        <Card style={[styles.card, { backgroundColor: c.surface }]}>
          <Card.Content>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: c.primary, marginBottom: 5 }}>Notes</Text>
            <Text style={{ color: c.text }}>{member.notes}</Text>
          </Card.Content>
        </Card>
      ) : null}

      <Text style={{ textAlign: 'center', fontSize: 11, color: c.muted, marginVertical: 10 }}>
        Added: {formatDisplayDate(member.createdAt)}
      </Text>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { marginHorizontal: 12, marginTop: 12, marginBottom: 8, elevation: 4, borderRadius: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerInfo: { flex: 1, marginLeft: 15 },
  headerName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  quickActions: { flexDirection: 'row', paddingHorizontal: 8, marginBottom: 10 },
  qBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, marginHorizontal: 3 },
  qBtnText: { color: '#fff', fontSize: 11, fontWeight: '600', marginLeft: 4 },
  card: { marginHorizontal: 12, marginBottom: 10, elevation: 2, borderRadius: 10 },
  secTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  infoLabel: { fontSize: 13, marginLeft: 10, width: 80 },
  infoValue: { fontSize: 14, fontWeight: '500', flex: 1 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 10, flexWrap: 'wrap' },
  actionBtn: { marginRight: 8, marginBottom: 8 },
});

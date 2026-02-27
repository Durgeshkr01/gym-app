import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, Text, TextInput, Button, Chip, Menu, Divider, RadioButton, Checkbox, Portal, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { openWhatsApp, fillTemplate } from '../../utils/helpers';
import DateInput from '../../components/DateInput';

export default function AddMemberScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { addMember, updateMember, plans, members, settings, messageTemplates } = useData();
  const c = theme.colors;

  const editId = route?.params?.memberId;
  const prefill = route?.params?.prefill;
  const editMember = editId ? members.find(m => m.id === editId) : null;
  const isEditing = !!editMember;

  const todayStr = new Date().toISOString().split('T')[0];
  const formatDateDMY = (d) => {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return d;
  };
  const parseDateDMY = (d) => {
    if (!d) return '';
    const parts = d.split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return d;
  };

  const [form, setForm] = useState({
    rollNo: editMember?.rollNo?.toString() || '',
    name: editMember?.name || prefill?.name || '',
    fatherName: editMember?.fatherName || '',
    phone: editMember?.phone || prefill?.phone || '',
    age: editMember?.age?.toString() || '',
    height: editMember?.height || '',
    dob: editMember?.dob ? formatDateDMY(editMember.dob) : '',
    joinDate: editMember?.startDate ? formatDateDMY(editMember.startDate) : formatDateDMY(todayStr),
    plan: editMember?.plan || '',
    planId: editMember?.planId || '',
    planAmount: editMember?.planAmount?.toString() || '',
    paidAmount: editMember?.paidAmount?.toString() || '',
    paymentMode: editMember?.paymentMode || 'Online',
    durationMode: 'auto',
    customDays: '',
    customEndDate: '',
  });
  const [planMenuVisible, setPlanMenuVisible] = useState(false);
  const [payModeMenuVisible, setPayModeMenuVisible] = useState(false);
  const [sendWelcome, setSendWelcome] = useState(true);
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const getSelectedPlan = () => plans.find(p => p.id === form.planId || p.name === form.plan);

  const selectPlan = (plan) => {
    updateField('plan', plan.name);
    updateField('planId', plan.id);
    updateField('planAmount', String(plan.amount || plan.price || 0));
    setPlanMenuVisible(false);
  };

  // calculate expiry date
  const getExpiryDate = () => {
    const joinStr = parseDateDMY(form.joinDate);
    if (!joinStr) return '';
    const joinDt = new Date(joinStr);
    if (isNaN(joinDt.getTime())) return '';

    let days = 0;
    const plan = getSelectedPlan();
    if (form.durationMode === 'auto' && plan) {
      days = plan.duration;
    } else if (form.durationMode === 'custom' && form.customDays) {
      days = parseInt(form.customDays) || 0;
    } else if (form.durationMode === 'specific' && form.customEndDate) {
      return form.customEndDate; // already DD/MM/YYYY
    }
    if (days <= 0) return '';
    const exp = new Date(joinDt);
    exp.setDate(exp.getDate() + days);
    return formatDateDMY(exp.toISOString().split('T')[0]);
  };

  const getExpiryISO = () => {
    const disp = getExpiryDate();
    return parseDateDMY(disp);
  };

  const getDurationDays = () => {
    const plan = getSelectedPlan();
    if (form.durationMode === 'auto' && plan) return plan.duration;
    if (form.durationMode === 'custom') return parseInt(form.customDays) || 0;
    return plan?.duration || 0;
  };

  const handleSave = async () => {
    if (!form.rollNo.trim()) { Alert.alert('Error', 'Enter Roll Number'); return; }
    if (!form.name.trim()) { Alert.alert('Error', 'Enter Full Name'); return; }
    if (!form.phone || form.phone.length < 10) { Alert.alert('Error', 'Enter valid Mobile Number'); return; }
    if (!form.joinDate) { Alert.alert('Error', 'Enter Join Date'); return; }
    if (!form.plan) { Alert.alert('Error', 'Select a Plan'); return; }

    // check duplicate roll no
    if (!isEditing) {
      const existing = members.find(m => m.rollNo?.toString() === form.rollNo.trim());
      if (existing) { Alert.alert('Error', `Roll Number ${form.rollNo} already exists for ${existing.name}`); return; }
    }

    setSaving(true);
    try {
      const saveData = {
        rollNo: parseInt(form.rollNo) || form.rollNo,
        name: form.name,
        fatherName: form.fatherName,
        phone: form.phone,
        age: form.age,
        height: form.height,
        dob: parseDateDMY(form.dob),
        startDate: parseDateDMY(form.joinDate),
        endDate: getExpiryISO(),
        plan: form.plan,
        planId: form.planId,
        planAmount: form.planAmount,
        paidAmount: form.paidAmount,
        paymentMode: form.paymentMode,
        admissionFee: '0',
        discount: '0',
      };

      if (isEditing) {
        await updateMember(editId, saveData);
        Alert.alert('Success', 'Member updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        const member = await addMember(saveData);
        if (sendWelcome && form.phone) {
          const template = messageTemplates?.welcome || 'Welcome to SG Fitness Evolution, {name}! 🏋️\nRoll No: {rollNo}\nPlan: {plan}\nLet\'s achieve your fitness goals! 💪';
          const msg = fillTemplate(template, { name: form.name, rollNo: form.rollNo, plan: form.plan, phone: form.phone });
          openWhatsApp(form.phone, msg);
        }
        Alert.alert('Success', `Member added! Roll #${form.rollNo}`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to save');
    }
    setSaving(false);
  };

  const expiryDisplay = getExpiryDate();
  const plan = getSelectedPlan();

  return (
    <ScrollView style={[styles.container, { backgroundColor: c.background }]} keyboardShouldPersistTaps="handled">
      {/* Row 1: Roll Number + Full Name */}
      <View style={styles.formBox}>
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: c.text }]}>Roll Number *</Text>
            <TextInput value={form.rollNo} onChangeText={v => updateField('rollNo', v)}
              mode="outlined" keyboardType="number-pad" placeholder="Enter Roll Number"
              style={styles.input} textColor={c.text} dense />
          </View>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: c.text }]}>Full Name *</Text>
            <TextInput value={form.name} onChangeText={v => updateField('name', v)}
              mode="outlined" placeholder="" style={styles.input} textColor={c.text} dense />
          </View>
        </View>

        {/* Row 2: Father's Name + Mobile */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: c.text }]}>Father's Name</Text>
            <TextInput value={form.fatherName} onChangeText={v => updateField('fatherName', v)}
              mode="outlined" style={styles.input} textColor={c.text} dense />
          </View>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: c.text }]}>Mobile Number *</Text>
            <TextInput value={form.phone} onChangeText={v => updateField('phone', v)}
              mode="outlined" keyboardType="phone-pad" maxLength={10} style={styles.input} textColor={c.text} dense />
          </View>
        </View>

        {/* Row 3: Age + Height */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: c.text }]}>Age</Text>
            <TextInput value={form.age} onChangeText={v => updateField('age', v)}
              mode="outlined" keyboardType="number-pad" style={styles.input} textColor={c.text} dense />
          </View>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: c.text }]}>Height (cm)</Text>
            <TextInput value={form.height} onChangeText={v => updateField('height', v)}
              mode="outlined" keyboardType="number-pad" style={styles.input} textColor={c.text} dense />
          </View>
        </View>

        {/* Row 4: DOB + Join Date */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: c.text }]}>Date of Birth</Text>
            <DateInput value={form.dob} onChangeText={v => updateField('dob', v)}
              label="Date of Birth" style={styles.input} />
          </View>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: c.text }]}>Join Date *</Text>
            <DateInput value={form.joinDate} onChangeText={v => updateField('joinDate', v)}
              label="Join Date" style={styles.input} />
          </View>
        </View>

        {/* Select Plan */}
        <Text style={[styles.label, { color: c.text }]}>Select Plan *</Text>
        <TouchableOpacity onPress={() => setPlanMenuVisible(true)}>
          <TextInput value={form.plan ? `${form.plan} - ₹${form.planAmount}` : '-- Select a Plan --'}
            mode="outlined" style={styles.input} textColor={c.text} editable={false} pointerEvents="none"
            right={<TextInput.Icon icon="chevron-down" />} dense />
        </TouchableOpacity>
        <Portal>
          <Dialog visible={planMenuVisible} onDismiss={() => setPlanMenuVisible(false)} style={{ backgroundColor: '#fff', borderRadius: 12 }}>
            <Dialog.Title style={{ fontSize: 16 }}>Select Plan</Dialog.Title>
            <Dialog.ScrollArea style={{ maxHeight: 300, paddingHorizontal: 0 }}>
              <ScrollView>
                {plans.map(p => (
                  <TouchableOpacity key={p.id} onPress={() => selectPlan(p)}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20, backgroundColor: form.planId === p.id ? 'rgba(255,107,53,0.1)' : 'transparent' }}>
                    <RadioButton value={p.id} status={form.planId === p.id ? 'checked' : 'unchecked'} color="#FF6B35" />
                    <Text style={{ fontSize: 14, marginLeft: 8, flex: 1 }}>{p.name} - ₹{p.amount || p.price || 0} ({p.duration} days)</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Dialog.ScrollArea>
            <Dialog.Actions>
              <Button onPress={() => setPlanMenuVisible(false)}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Amount Paid + Payment Mode */}
        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: c.text }]}>₹ Amount Paid (₹)</Text>
            {plan && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
                {[plan.amount || plan.price, Math.round((plan.amount || plan.price || 0) / 2), 500, 1000].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map(amt => (
                  <TouchableOpacity key={amt} onPress={() => updateField('paidAmount', String(amt))}
                    style={{ borderWidth: 1.5, borderColor: form.paidAmount === String(amt) ? '#FF6B35' : '#ccc', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 3, marginRight: 6, marginBottom: 4, backgroundColor: form.paidAmount === String(amt) ? '#FF6B35' : 'transparent' }}>
                    <Text style={{ fontSize: 11, color: form.paidAmount === String(amt) ? '#fff' : '#666', fontWeight: '600' }}>₹{amt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TextInput value={form.paidAmount} onChangeText={v => updateField('paidAmount', v)}
              mode="outlined" keyboardType="number-pad" placeholder="Enter amount paid"
              style={styles.input} textColor={c.text} dense />
          </View>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: c.text }]}>💳 Payment Mode</Text>
            <TouchableOpacity onPress={() => setPayModeMenuVisible(true)}>
              <TextInput value={form.paymentMode} mode="outlined" style={styles.input} textColor={c.text} editable={false} pointerEvents="none"
                right={<TextInput.Icon icon="chevron-down" />} dense />
            </TouchableOpacity>
            <Portal>
              <Dialog visible={payModeMenuVisible} onDismiss={() => setPayModeMenuVisible(false)} style={{ backgroundColor: '#fff', borderRadius: 12 }}>
                <Dialog.Title style={{ fontSize: 16 }}>Payment Mode</Dialog.Title>
                <Dialog.Content>
                  {['Online', 'Cash', 'UPI', 'Card'].map(m => (
                    <TouchableOpacity key={m} onPress={() => { updateField('paymentMode', m); setPayModeMenuVisible(false); }}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, backgroundColor: form.paymentMode === m ? 'rgba(255,107,53,0.1)' : 'transparent', borderRadius: 8, paddingHorizontal: 12 }}>
                      <RadioButton value={m} status={form.paymentMode === m ? 'checked' : 'unchecked'} color="#FF6B35" />
                      <MaterialCommunityIcons name={m === 'Online' ? 'bank-transfer' : m === 'Cash' ? 'cash' : m === 'UPI' ? 'cellphone' : 'credit-card'} size={20} color="#666" style={{ marginLeft: 8 }} />
                      <Text style={{ fontSize: 14, marginLeft: 8 }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </Dialog.Content>
                <Dialog.Actions>
                  <Button onPress={() => setPayModeMenuVisible(false)}>Cancel</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </View>
        </View>

        {/* Membership Duration */}
        <Text style={[styles.label, { color: c.text, marginTop: 5 }]}>Membership Duration *</Text>
        <Card style={[styles.durationCard, { backgroundColor: c.surface }]}>
          <Card.Content>
            <TouchableOpacity style={styles.radioRow} onPress={() => updateField('durationMode', 'auto')}>
              <RadioButton value="auto" status={form.durationMode === 'auto' ? 'checked' : 'unchecked'}
                onPress={() => updateField('durationMode', 'auto')} color={c.primary} />
              <Text style={{ color: c.text, flex: 1 }}>
                Auto: {plan ? `${plan.duration} Days` : '-- '} (Join Date + {plan ? `${plan.duration}` : '--'} days)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.radioRow} onPress={() => updateField('durationMode', 'custom')}>
              <RadioButton value="custom" status={form.durationMode === 'custom' ? 'checked' : 'unchecked'}
                onPress={() => updateField('durationMode', 'custom')} color={c.primary} />
              <Text style={{ color: c.text }}>Custom Number of Days</Text>
            </TouchableOpacity>
            {form.durationMode === 'custom' && (
              <TextInput value={form.customDays} onChangeText={v => updateField('customDays', v)}
                mode="outlined" keyboardType="number-pad" placeholder="Enter days"
                style={[styles.input, { marginLeft: 40 }]} textColor={c.text} dense />
            )}
            <TouchableOpacity style={styles.radioRow} onPress={() => updateField('durationMode', 'specific')}>
              <RadioButton value="specific" status={form.durationMode === 'specific' ? 'checked' : 'unchecked'}
                onPress={() => updateField('durationMode', 'specific')} color={c.primary} />
              <Text style={{ color: c.text }}>Choose Specific Date</Text>
            </TouchableOpacity>
            {form.durationMode === 'specific' && (
              <TextInput value={form.customEndDate} onChangeText={v => updateField('customEndDate', v)}
                mode="outlined" placeholder="DD/MM/YYYY"
                style={[styles.input, { marginLeft: 40 }]} textColor={c.text} dense />
            )}
          </Card.Content>
        </Card>

        {/* Expiry Date Display */}
        {expiryDisplay ? (
          <Card style={[styles.expiryCard, { backgroundColor: c.surface }]}>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontSize: 13, color: c.muted }}>Expiry Date (Auto-calculated):</Text>
                <Text style={{ fontSize: 11, color: c.muted }}>Join Date + {getDurationDays()} days</Text>
              </View>
              <Text style={{ fontSize: 17, fontWeight: 'bold', color: c.text }}>{expiryDisplay}</Text>
            </Card.Content>
          </Card>
        ) : null}

        {/* Send Welcome Message */}
        {!isEditing && (
          <TouchableOpacity style={[styles.welcomeBox, { backgroundColor: '#E8F5E9' }]}
            onPress={() => setSendWelcome(!sendWelcome)}>
            <Checkbox status={sendWelcome ? 'checked' : 'unchecked'} color="#4CAF50"
              onPress={() => setSendWelcome(!sendWelcome)} />
            <View style={{ flex: 1, marginLeft: 5 }}>
              <Text style={{ fontWeight: 'bold', color: '#2E7D32' }}>🧑‍🤝‍🧑 New Admission - Send Welcome Message</Text>
              <Text style={{ fontSize: 12, color: '#4CAF50' }}>Check this to send WhatsApp/SMS welcome message after saving</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Save Button */}
        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}
          style={[styles.saveBtn, { backgroundColor: '#1B3A5C' }]}
          labelStyle={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>
          {isEditing ? 'Update Member' : 'Save Member'}
        </Button>
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  formBox: { padding: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfField: { width: '48%' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  input: { marginBottom: 2, backgroundColor: 'transparent' },
  durationCard: { borderRadius: 8, elevation: 1, marginBottom: 10, marginTop: 4 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  expiryCard: { borderRadius: 8, elevation: 1, marginBottom: 10 },
  welcomeBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, marginTop: 10, marginBottom: 10 },
  saveBtn: { marginTop: 10, paddingVertical: 4, borderRadius: 8 },
});

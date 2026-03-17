// Add/Edit expense form screen with category selection, amount input, and smart defaults
// Handles both creating new expenses and editing existing ones

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme';
import { useLanguage } from '../i18n';
import { useAppStore } from '../store';
import { PaymentMethod, RecurringFrequency } from '../types';
import { PAYMENT_METHODS } from '../constants';
import { format, parse } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from '../components/common/Button';

const AddExpenseScreen = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const expenseId = route.params?.expenseId; // Null for new expense, ID for editing

  // Pull state and actions from global store
  const { categories, currentWallet, addExpense, updateExpense, expenses, settings } = useAppStore();

  // Form field state values
  const [amount, setAmount] = useState(''); // Expense amount as string for input
  const [selectedCategory, setSelectedCategory] = useState(''); // Selected category name
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd')); // Selected date
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(settings.defaultPaymentMethod); // Payment type
  const [notes, setNotes] = useState(''); // Optional description
  const [tags, setTags] = useState(''); // Comma-separated tags string
  const [isRecurring, setIsRecurring] = useState(false); // Recurring toggle
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>('monthly'); // Recurrence interval
  const [loading, setLoading] = useState(false); // Submission loading state
  const [showDatePicker, setShowDatePicker] = useState(false); // Date picker visibility

  // Deduplicate categories by name to prevent duplicate chips
  const uniqueCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter(cat => {
      if (seen.has(cat.name)) return false; // Skip duplicate names
      seen.add(cat.name);
      return true;
    });
  }, [categories]);

  // Ref to the scroll view for programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll the focused input into view above the keyboard
  const scrollToField = (event: any) => {
    const { target } = event.nativeEvent;
    if (scrollViewRef.current && target) {
      // Delay to allow keyboard to fully appear before measuring
      setTimeout(() => {
        scrollViewRef.current?.scrollResponderScrollNativeHandleToKeyboard(target, 150, true);
      }, 300);
    }
  };

  // Pre-fill form fields when editing an existing expense
  useEffect(() => {
    if (expenseId) {
      const expense = expenses.find(e => e.id === expenseId);
      if (expense) {
        setAmount(expense.amount.toString());
        setSelectedCategory(expense.category);
        setDate(expense.date);
        setPaymentMethod(expense.paymentMethod);
        setNotes(expense.notes || '');
        setTags(expense.tags.join(', '));
        setIsRecurring(expense.isRecurring);
        if (expense.recurringFrequency) setRecurringFrequency(expense.recurringFrequency);
        // Update header title to indicate edit mode
        navigation.setOptions({ title: t.addExpense.editTitle });
      }
    }
  }, [expenseId]);

  // Validate and submit the expense form
  const handleSave = async () => {
    // Validate required fields before saving
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t.addExpense.invalidAmount, t.addExpense.invalidAmountMsg);
      return;
    }
    if (!selectedCategory) {
      Alert.alert(t.addExpense.noCategory, t.addExpense.noCategoryMsg);
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        amount: parseFloat(amount), // Convert string to number
        category: selectedCategory,
        date,
        paymentMethod,
        notes: notes.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean), // Parse comma-separated tags
        currency: settings.defaultCurrency,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        walletId: currentWallet?.id || '', // Link to active wallet
      };

      if (expenseId) {
        // Update existing expense record
        await updateExpense(expenseId, expenseData);
      } else {
        // Create new expense record
        await addExpense(expenseData);
      }
      navigation.goBack(); // Return to previous screen on success
    } catch (error) {
      Alert.alert(t.common.error, t.addExpense.saveFailed);
    } finally {
      setLoading(false);
    }
  };

  // Available recurring frequency options
  const frequencies: { value: RecurringFrequency; label: string }[] = [
    { value: 'daily', label: t.frequencies.daily },
    { value: 'weekly', label: t.frequencies.weekly },
    { value: 'biweekly', label: t.frequencies.biweekly },
    { value: 'monthly', label: t.frequencies.monthly },
    { value: 'quarterly', label: t.frequencies.quarterly },
    { value: 'yearly', label: t.frequencies.yearly },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Keyboard avoidance for both platforms
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // Offset for header height on iOS
    >
      <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Amount input with large display for easy data entry */}
        <View style={[styles.amountContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.amountLabel}>{t.addExpense.amount}</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="decimal-pad" // Numeric keyboard with decimal
              autoFocus={!expenseId} // Auto-focus for new expenses only
            />
          </View>
        </View>

        {/* Date picker field - tap to open native date picker */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.addExpense.date}</Text>
          <TouchableOpacity
            style={[styles.input, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.border }]}
            onPress={() => setShowDatePicker(true)} // Open date picker on tap
          >
            <Text style={{ color: theme.colors.text, fontSize: 15 }}>{date}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={parse(date, 'yyyy-MM-dd', new Date())} // Parse current date string
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} // Native picker style
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
                if (selectedDate) {
                  setDate(format(selectedDate, 'yyyy-MM-dd')); // Format selected date
                }
              }}
            />
          )}
        </View>

        {/* Category selection grid with scrollable chips */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.addExpense.category}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {uniqueCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === cat.name ? cat.color + '30' : theme.colors.surfaceVariant,
                    borderColor: selectedCategory === cat.name ? cat.color : theme.colors.border,
                    borderWidth: selectedCategory === cat.name ? 2 : 1, // Thicker border when selected
                  },
                ]}
                onPress={() => setSelectedCategory(cat.name)} // Set category on tap
              >
                <MaterialCommunityIcons name={cat.icon as any} size={20} color={cat.color} />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: selectedCategory === cat.name ? cat.color : theme.colors.text },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Payment method selector as horizontal chips */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.addExpense.paymentMethod}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.methodChip,
                  {
                    backgroundColor: paymentMethod === method.value ? theme.colors.primary + '20' : theme.colors.surfaceVariant,
                    borderColor: paymentMethod === method.value ? theme.colors.primary : theme.colors.border,
                    borderWidth: paymentMethod === method.value ? 2 : 1,
                  },
                ]}
                onPress={() => setPaymentMethod(method.value)} // Set payment method on tap
              >
                <MaterialCommunityIcons
                  name={method.icon as any}
                  size={18}
                  color={paymentMethod === method.value ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text
                  style={[
                    styles.methodChipText,
                    { color: paymentMethod === method.value ? theme.colors.primary : theme.colors.text },
                  ]}
                >
                  {(t.paymentMethods as Record<string, string>)[method.value] || method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Notes text area for additional details */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.addExpense.notes}</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t.addExpense.notesPlaceholder}
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top" // Align text to top of multiline input
            onFocus={scrollToField} // Scroll field into view above keyboard
          />
        </View>

        {/* Tags input for searchable labels */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{t.addExpense.tags}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={tags}
            onChangeText={setTags}
            placeholder={t.addExpense.tagsPlaceholder}
            placeholderTextColor={theme.colors.textTertiary}
            onFocus={scrollToField} // Scroll field into view above keyboard
          />
          <Text style={[styles.hint, { color: theme.colors.textTertiary }]}>{t.addExpense.tagsHint}</Text>
        </View>

        {/* Recurring expense toggle and frequency selector */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.recurringToggle, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
            onPress={() => setIsRecurring(!isRecurring)} // Toggle recurring state
          >
            <MaterialCommunityIcons
              name={isRecurring ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={isRecurring ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={[styles.recurringText, { color: theme.colors.text }]}>{t.addExpense.recurringExpense}</Text>
          </TouchableOpacity>

          {/* Show frequency options only when recurring is enabled */}
          {isRecurring && (
            <View style={styles.frequencyRow}>
              {frequencies.map((freq) => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.frequencyChip,
                    {
                      backgroundColor: recurringFrequency === freq.value ? theme.colors.primary : theme.colors.surfaceVariant,
                      borderColor: recurringFrequency === freq.value ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setRecurringFrequency(freq.value)}
                >
                  <Text
                    style={{
                      color: recurringFrequency === freq.value ? '#FFF' : theme.colors.text,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Save button to submit the form */}
        <View style={styles.saveContainer}>
          <Button
            title={expenseId ? t.addExpense.updateExpense : t.addExpense.saveExpense}
            onPress={handleSave}
            loading={loading}
            fullWidth
            size="large"
          />
        </View>

        {/* Bottom spacer - extra space so keyboard doesn't cover last fields */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  amountContainer: {
    padding: 32,
    alignItems: 'center', // Center amount display
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  amountLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { color: '#FFFFFF', fontSize: 36, fontWeight: '300', marginRight: 4 },
  amountInput: {
    color: '#FFFFFF',
    fontSize: 48, // Large font for easy amount entry
    fontWeight: '700',
    minWidth: 100,
    textAlign: 'center',
  },
  section: { paddingHorizontal: 16, marginTop: 20 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 80, // Taller for multiline notes
  },
  hint: { fontSize: 12, marginTop: 4, marginLeft: 4 },
  categoryScroll: { flexDirection: 'row' },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  categoryChipText: { fontSize: 13, fontWeight: '500' },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  methodChipText: { fontSize: 13, fontWeight: '500' },
  recurringToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  recurringText: { fontSize: 15, fontWeight: '500' },
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Wrap to multiple lines if needed
    gap: 8,
    marginTop: 12,
  },
  frequencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  saveContainer: { paddingHorizontal: 16, marginTop: 32 },
});

export default AddExpenseScreen;

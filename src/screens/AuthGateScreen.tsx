import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react-native';
import { ColorPalette } from '../theme';
import { useTheme } from '../context/ThemeContext';

// Shown before anyone is signed in, so there's no account/device preference
// to honor yet — always follows the phone's actual system appearance,
// regardless of whatever theme a previous user of this device last chose.
export const AuthGateScreen: React.FC = () => {
  const { login, signup } = useAuth();
  const { systemColors: colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const validateDob = (): { iso: string } | { error: string } => {
    const day = parseInt(dobDay, 10);
    const month = parseInt(dobMonth, 10);
    const year = parseInt(dobYear, 10);
    if (!day || !month || !year || dobYear.length !== 4) {
      return { error: 'Please enter your full date of birth.' };
    }
    const dob = new Date(Date.UTC(year, month - 1, day));
    const isValidCalendarDate = dob.getUTCFullYear() === year && dob.getUTCMonth() === month - 1 && dob.getUTCDate() === day;
    if (!isValidCalendarDate) {
      return { error: 'That date of birth is not valid.' };
    }
    const today = new Date();
    let age = today.getFullYear() - year;
    const hasHadBirthdayThisYear = today.getMonth() + 1 > month || (today.getMonth() + 1 === month && today.getDate() >= day);
    if (!hasHadBirthdayThisYear) age -= 1;
    if (age < 18) {
      return { error: 'You must be at least 18 years old to create an account.' };
    }
    return { iso: dob.toISOString() };
  };

  const handleAuth = async () => {
    setAuthError('');

    if (isLoginMode) {
      setAuthSubmitting(true);
      const result = await login(email, password);
      setAuthSubmitting(false);
      if (!result.ok) setAuthError(result.error || 'Something went wrong.');
      return;
    }

    const dobResult = validateDob();
    if ('error' in dobResult) {
      setAuthError(dobResult.error);
      return;
    }

    setAuthSubmitting(true);
    const result = await signup(name, email, password, dobResult.iso);
    setAuthSubmitting(false);
    if (!result.ok) setAuthError(result.error || 'Something went wrong.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.authContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.authHeader}>
        <View style={styles.userIconBox}>
          <User size={36} color={colors.primary} />
        </View>
        <Text style={styles.brandTitle}>Wine & Liquor Joint</Text>
        <Text style={styles.authTitle}>
          {isLoginMode ? 'Welcome Back' : 'Create Cellar Account'}
        </Text>
        <Text style={styles.authSub}>
          {isLoginMode
            ? 'Sign in to browse and shop the collection'
            : 'Join Rwanda premier spirits membership club'}
        </Text>
      </View>

      <View style={styles.card}>
        {!isLoginMode && (
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>
        )}

        {!isLoginMode && (
          <View style={styles.field}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.dobRow}>
              <TextInput
                value={dobDay}
                onChangeText={(t) => setDobDay(t.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="DD"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                style={[styles.input, styles.dobInput]}
              />
              <TextInput
                value={dobMonth}
                onChangeText={(t) => setDobMonth(t.replace(/[^0-9]/g, '').slice(0, 2))}
                placeholder="MM"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
                style={[styles.input, styles.dobInput]}
              />
              <TextInput
                value={dobYear}
                onChangeText={(t) => setDobYear(t.replace(/[^0-9]/g, '').slice(0, 4))}
                placeholder="YYYY"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                style={[styles.input, styles.dobInputYear]}
              />
            </View>
            <Text style={styles.helperText}>You must be 18 or older to create an account.</Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@domain.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
          />
        </View>

        {Boolean(authError) && <Text style={styles.errorText}>{authError}</Text>}

        <TouchableOpacity onPress={handleAuth} style={styles.submitBtn} activeOpacity={0.85} disabled={authSubmitting}>
          {authSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>{isLoginMode ? 'Sign In' : 'Create Account'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={styles.switchAuthText}>
            {isLoginMode ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  authContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  userIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: colors.badgeBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  authTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  authSub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 16,
    height: 52,
  },
  dobRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dobInput: {
    flex: 1,
    textAlign: 'center',
  },
  dobInputYear: {
    flex: 1.4,
    textAlign: 'center',
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  switchAuthText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

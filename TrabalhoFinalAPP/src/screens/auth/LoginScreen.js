import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const { theme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Informe o e-mail.';
    else if (!EMAIL_REGEX.test(email.trim())) newErrors.email = 'Informe um e-mail válido.';
    if (!password) newErrors.password = 'Informe a senha.';
    else if (password.length < 6) newErrors.password = 'A senha deve ter no mínimo 6 caracteres.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setAuthError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setAuthError(traduzErro(err.message));
    } finally {
      setLoading(false);
    }
  };

  const s = styles(theme);

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <View style={s.iconCircle}>
            <Ionicons name="checkbox-outline" size={36} color={theme.primary} />
          </View>
          <Text style={s.title}>RotinaApp</Text>

          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={[s.input, errors.email && s.inputError]}
            value={email}
            onChangeText={setEmail}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor={theme.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />
          {errors.email ? <Text style={s.errorText}>{errors.email}</Text> : null}

          <Text style={s.label}>Senha</Text>
          <TextInput
            style={[s.input, errors.password && s.inputError]}
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            placeholderTextColor={theme.placeholder}
            secureTextEntry
            editable={!loading}
          />
          {errors.password ? <Text style={s.errorText}>{errors.password}</Text> : null}

          {authError ? <Text style={s.authError}>{authError}</Text> : null}

          <TouchableOpacity
            style={[s.button, loading && s.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.buttonText}>Entrar</Text>}
          </TouchableOpacity>

          <Text style={s.orText}>ou</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} disabled={loading}>
            <Text style={s.linkText}>Criar uma conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function traduzErro(message) {
  if (!message) return 'Não foi possível entrar. Tente novamente.';
  if (message.toLowerCase().includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.toLowerCase().includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  return message;
}

const styles = (theme) => StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.dark ? '#0A0A0A' : '#1A1A1A' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    width: '100%', maxWidth: 360, backgroundColor: theme.card,
    borderRadius: 20, padding: 28, alignItems: 'center',
    borderWidth: 1, borderColor: theme.cardBorder,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: theme.text, marginBottom: 24 },
  label: { width: '100%', fontSize: 13, color: theme.textMuted, marginBottom: 6, marginTop: 12 },
  input: {
    width: '100%', height: 44, borderRadius: 8,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.surfaceBorder,
    paddingHorizontal: 14, fontSize: 15, color: theme.text,
  },
  inputError: { borderColor: theme.danger },
  errorText: { width: '100%', color: theme.danger, fontSize: 12, marginTop: 4 },
  authError: { width: '100%', color: theme.danger, fontSize: 13, marginTop: 14, textAlign: 'center' },
  button: {
    width: '100%', height: 48, borderRadius: 10, backgroundColor: theme.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 22,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  orText: { color: theme.textMuted, fontSize: 13, marginTop: 18, marginBottom: 6 },
  linkText: { color: theme.primary, fontSize: 14, fontWeight: '600' },
});
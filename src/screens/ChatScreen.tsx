import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Send, MessageCircle } from 'lucide-react-native';
import { useChat } from '../context/ChatContext';
import { ColorPalette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

const POLL_MS = 7000;

export const ChatScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { messages, isLoading, isSending, loadThread, send } = useChat();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadThread();
    const interval = setInterval(loadThread, POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body) return;
    setError('');
    setDraft('');
    const result = await send(body);
    if (!result.ok) setError(result.error || 'Could not send that message.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chat with Us</Text>
        <Text style={styles.subtitle}>Our team usually replies within a few hours.</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && messages.length === 0 ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageCircle size={36} color={colors.primary} style={{ marginBottom: 10 }} />
            <Text style={styles.emptyTitle}>Ask us anything</Text>
            <Text style={styles.emptySubtitle}>
              Questions about an order, delivery, or a bottle in our collection — send a message and our team will get back to you.
            </Text>
          </View>
        ) : (
          messages.map((m) => (
            <View
              key={m.id}
              style={[styles.bubbleRow, m.sender === 'customer' ? styles.bubbleRowRight : styles.bubbleRowLeft]}
            >
              <View
                style={[
                  styles.bubble,
                  m.sender === 'customer' ? styles.bubbleCustomer : m.sender === 'ai' ? styles.bubbleAi : styles.bubbleAdmin
                ]}
              >
                {m.sender === 'ai' && <Text style={styles.aiLabel}>AI ASSISTANT</Text>}
                <Text style={m.sender === 'customer' ? styles.bubbleTextCustomer : styles.bubbleTextAdmin}>
                  {m.body}
                </Text>
                <Text style={m.sender === 'customer' ? styles.timeTextCustomer : styles.timeTextAdmin}>
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message…"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendBtn, (!draft.trim() || isSending) && styles.sendBtnDisabled]}
          activeOpacity={0.85}
          disabled={!draft.trim() || isSending}
        >
          {isSending ? <ActivityIndicator size="small" color="#ffffff" /> : <Send size={18} color="#ffffff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleCustomer: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAdmin: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleAi: {
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    borderBottomLeftRadius: 4,
  },
  aiLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  bubbleTextCustomer: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextAdmin: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  timeTextCustomer: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  timeTextAdmin: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    color: colors.text,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Spacing, Radius, FontSize, Shadow } from '@/src/design';
import { useAuthStore } from '@/src/store/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

const SYSTEM_PROMPT = `You are Tune, the friendly assistant for TunePath — a music learning app. You only answer questions about TunePath features and how to use them. Keep answers short and friendly. Use emojis occasionally.

TunePath features:
- Discover lessons by instrument/genre
- Watch video lessons with karaoke Sargam notation
- Notation syncs to video automatically
- Speed slider: slow down to 0.25x
- Mark lessons complete with ✓ button
- Heart button to save favorites
- Follow creators you like
- Upload your own lessons (Create tab)
- Import YouTube videos as lessons
- AI generates notation automatically
- Change app theme in Profile
- Seasonal themes: Holi, Diwali etc
- Support: tap the chat bubble anytime`;

const INITIAL_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content: "Hi! I'm Tune 🎵\nI know everything about TunePath.\nHow can I help you today?",
};

export function SupportBot() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      const systemWithCtx = `${SYSTEM_PROMPT}\n\nCurrent user: ${user?.displayName ?? 'Guest'}`;
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: systemWithCtx,
          messages: next
            .filter((m) => m.id !== '0')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data?.content?.[0]?.text ?? 'Sorry, I had trouble answering that.';
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Oops! Something went wrong. Try again? 🙏' },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, loading, messages, user]);

  const screenHeight = Dimensions.get('window').height;

  return (
    <>
      {/* Floating button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary, ...Shadow.md }]}
        onPress={() => setVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.textOnPrimary} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrapper}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setVisible(false)} activeOpacity={1} />
          <View style={[styles.sheet, { backgroundColor: theme.modalBg, maxHeight: screenHeight * 0.7 }]}>
            {/* Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Tune 🎵</Text>
                <Text style={[styles.sheetSub, { color: theme.textSecondary }]}>Your TunePath assistant</Text>
              </View>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              style={styles.messages}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
              {messages.map((msg) => (
                <View key={msg.id} style={[styles.bubble, msg.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                  <Text
                    style={[
                      styles.bubbleText,
                      {
                        color: msg.role === 'user' ? theme.textOnPrimary : theme.textPrimary,
                        backgroundColor: msg.role === 'user' ? theme.primary : theme.surface,
                      },
                    ]}
                  >
                    {msg.content}
                  </Text>
                </View>
              ))}
              {loading && (
                <View style={[styles.bubble, styles.bubbleBot]}>
                  <View style={[styles.bubbleLoading, { backgroundColor: theme.surface }]}>
                    <ActivityIndicator size="small" color={theme.textSecondary} />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View style={[styles.inputRow, { borderTopColor: theme.border }]}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary }]}
                placeholder="Ask me anything..."
                placeholderTextColor={theme.textDisabled}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
                multiline={false}
              />
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: theme.primary }]}
                onPress={sendMessage}
                disabled={loading}
              >
                <Ionicons name="arrow-forward" size={18} color={theme.textOnPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    right: Spacing.lg,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sheetTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  sheetSub: { fontSize: FontSize.sm, marginTop: 2 },
  messages: { flex: 1 },
  messagesContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  bubble: { marginVertical: 2 },
  bubbleUser: { alignItems: 'flex-end' },
  bubbleBot: { alignItems: 'flex-start' },
  bubbleText: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    fontSize: FontSize.sm,
    lineHeight: 20,
    maxWidth: '85%',
    overflow: 'hidden',
  },
  bubbleLoading: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 0.5,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    fontSize: FontSize.sm,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

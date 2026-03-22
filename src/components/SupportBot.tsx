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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

const SYSTEM_PROMPT = `You are Tune, the friendly assistant for TunePath — a music learning app focusing on Indian classical music. You help users discover lessons, understand sargam notation, and navigate the app. Keep answers short and friendly. Use music emojis occasionally.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: "Hi! I'm Tune 🎵\nI'm here to help you learn music on TunePath.\nAsk me anything!",
};

export function SupportBot() {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    // Build conversation history (exclude the initial assistant greeting from API calls
    // if it's the only message, to keep context clean)
    const conversationHistory: Message[] = updatedMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantContent =
        data?.content?.[0]?.text ?? "Sorry, I couldn't get a response. Please try again! 🎵";

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        role: 'assistant',
        content: "Oops! Something went wrong. Please try again in a moment 🎵",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [inputText, loading, messages]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: 80,
      right: Spacing.lg,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadow.md,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      height: SCREEN_HEIGHT * 0.7,
      backgroundColor: theme.modalBg,
      borderTopLeftRadius: Radius.xl,
      borderTopRightRadius: Radius.xl,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitleGroup: {
      flex: 1,
    },
    headerTitle: {
      fontSize: FontSize.lg,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    headerSubtitle: {
      fontSize: FontSize.sm,
      color: theme.textSecondary,
      marginTop: 2,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    messagesContainer: {
      flex: 1,
      paddingHorizontal: Spacing.md,
      paddingTop: Spacing.md,
    },
    messageRow: {
      marginBottom: Spacing.sm,
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: theme.primary,
      borderRadius: Radius.lg,
      borderBottomRightRadius: Radius.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      maxWidth: '80%',
    },
    userBubbleText: {
      color: theme.textOnPrimary,
      fontSize: FontSize.md,
      lineHeight: 20,
    },
    botBubble: {
      alignSelf: 'flex-start',
      backgroundColor: theme.surface,
      borderRadius: Radius.lg,
      borderBottomLeftRadius: Radius.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      maxWidth: '80%',
    },
    botBubbleText: {
      color: theme.textPrimary,
      fontSize: FontSize.md,
      lineHeight: 20,
    },
    loadingBubble: {
      alignSelf: 'flex-start',
      backgroundColor: theme.surface,
      borderRadius: Radius.lg,
      borderBottomLeftRadius: Radius.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      marginBottom: Spacing.sm,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: Spacing.sm,
    },
    textInput: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      color: theme.textPrimary,
      fontSize: FontSize.md,
      maxHeight: 100,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });

  return (
    <>
      {Platform.OS !== 'web' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.textOnPrimary} />
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.sheet}>
                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerTitleGroup}>
                    <Text style={styles.headerTitle}>Tune 🎵</Text>
                    <Text style={styles.headerSubtitle}>Your TunePath assistant</Text>
                  </View>
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Ionicons name="close" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Messages */}
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.messagesContainer}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() =>
                    scrollViewRef.current?.scrollToEnd({ animated: true })
                  }
                >
                  {messages.map((msg, index) => (
                    <View key={index} style={styles.messageRow}>
                      {msg.role === 'user' ? (
                        <View style={styles.userBubble}>
                          <Text style={styles.userBubbleText}>{msg.content}</Text>
                        </View>
                      ) : (
                        <View style={styles.botBubble}>
                          <Text style={styles.botBubbleText}>{msg.content}</Text>
                        </View>
                      )}
                    </View>
                  ))}

                  {loading && (
                    <View style={styles.loadingBubble}>
                      <ActivityIndicator size="small" color={theme.primary} />
                    </View>
                  )}
                </ScrollView>

                {/* Input row */}
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ask Tune anything..."
                    placeholderTextColor={theme.textDisabled}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    returnKeyType="send"
                    onSubmitEditing={sendMessage}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!inputText.trim() || loading) && styles.sendButtonDisabled,
                    ]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || loading}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="send" size={16} color={theme.textOnPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default SupportBot;

import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Send, UserCircle2 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { GroupMessage, RootStackParamList } from '../types';

type ChatRoute = RouteProp<RootStackParamList, 'GroupChat'>;

const INITIAL_MESSAGES: GroupMessage[] = [
  { id: 'MSG-1', groupId: 'GROUP-GOOGLE', senderName: 'TnP Coordinator', message: 'The OA reporting instructions will be shared by email. Please monitor your institute inbox.', sentAt: 'Today, 10:30 AM' },
  { id: 'MSG-2', groupId: 'GROUP-GOOGLE', senderName: 'TnP Coordinator', message: 'Keep your student profile and required documents up to date.', sentAt: 'Yesterday, 4:15 PM' },
];

export const GroupChatScreen: React.FC = () => {
  const { params } = useRoute<ChatRoute>();
  const [messages, setMessages] = useState<GroupMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');

  const sendMessage = () => {
    const message = draft.trim();
    if (!message) return;
    setMessages((current) => [...current, {
      id: `MSG-${Date.now()}`,
      groupId: params.groupId,
      senderName: 'You',
      message,
      sentAt: 'Just now',
    }]);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={messages.filter((message) => message.groupId === params.groupId || params.groupId === 'GROUP-GOOGLE')}
        keyExtractor={(message) => message.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={styles.messageCard}>
            <View style={styles.senderRow}><UserCircle2 size={16} color={COLORS.primaryAccent} /><Text style={styles.sender}>{item.senderName}</Text><Text style={styles.time}>{item.sentAt}</Text></View>
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder={`Broadcast to ${params.companyName} group`}
          placeholderTextColor={COLORS.textMuted}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} accessibilityLabel="Send text broadcast">
          <Send size={18} color={COLORS.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  messageList: { padding: SPACING.lg, gap: SPACING.md },
  messageCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  senderRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  sender: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  time: { ...TYPOGRAPHY.caption, marginLeft: 'auto' },
  message: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.sm },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, maxHeight: 100, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.textPrimary },
  sendButton: { width: 42, height: 42, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryAccent, alignItems: 'center', justifyContent: 'center' },
});

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Info, RefreshCw, Send, UserCircle2 } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { placementService } from '../data/placementService';
import { GroupMessage, RootStackParamList } from '../types';

type ChatRoute = RouteProp<RootStackParamList, 'GroupChat'>;

export const GroupChatScreen: React.FC = () => {
  const { params } = useRoute<ChatRoute>();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const listRef = useRef<FlatList<GroupMessage>>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      setMessages(await placementService.getGroupMessages(params.groupId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load messages.');
    } finally {
      setLoading(false);
    }
  }, [params.groupId]);

  useEffect(() => { void loadMessages(); }, [loadMessages]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    try {
      setSending(true);
      setErrorMessage('');
      const created = await placementService.sendGroupMessage(params.groupId, text);
      setMessages((current) => [...current, created]);
      setDraft('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
        <View style={styles.chatHeader}>
          <View style={styles.groupAvatar}><Text style={styles.avatarText}>{params.companyName.slice(0, 1)}</Text></View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{params.companyName} placement group</Text>
            <Text style={styles.subtitle}>Messages are saved to CCPD</Text>
          </View>
          <Info size={20} color={COLORS.textMuted} />
        </View>
        <View style={styles.notice}><Text style={styles.noticeText}>Keep messages focused on this placement drive.</Text></View>
        {errorMessage ? (
          <View style={styles.errorBar}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity onPress={() => void loadMessages()}><RefreshCw size={17} color={COLORS.dangerDark} /></TouchableOpacity>
          </View>
        ) : null}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={!loading ? <Text style={styles.emptyText}>No messages yet. Send the first message.</Text> : null}
          renderItem={({ item }) => {
            const isMine = item.senderId === undefined;
            return (
              <View style={[styles.messageRow, isMine && styles.myMessageRow]}>
                {!isMine && <UserCircle2 size={26} color={COLORS.primaryAccent} />}
                <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.otherBubble]}>
                  {!isMine && <Text style={styles.sender}>{item.senderName}</Text>}
                  <Text style={[styles.message, isMine && styles.myMessage]}>{item.message}</Text>
                  <Text style={[styles.time, isMine && styles.myTime]}>{new Date(item.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</Text>
                </View>
              </View>
            );
          }}
        />
        <View style={styles.composer}>
          <TextInput style={styles.input} value={draft} onChangeText={setDraft} placeholder="Write a message..." placeholderTextColor={COLORS.textMuted} selectionColor={COLORS.primaryAccent} textAlignVertical="top" multiline maxLength={500} blurOnSubmit={false} />
          <TouchableOpacity style={[styles.sendButton, (!draft.trim() || sending || loading) && styles.sendButtonDisabled]} onPress={() => void sendMessage()} disabled={!draft.trim() || sending || loading} accessibilityLabel="Send message">
            <Send size={18} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.surface },
  container: { flex: 1, backgroundColor: COLORS.background },
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  groupAvatar: { width: 42, height: 42, borderRadius: RADIUS.full, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm },
  avatarText: { ...TYPOGRAPHY.h4, color: COLORS.primaryAccent },
  headerText: { flex: 1 },
  title: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  subtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  notice: { backgroundColor: COLORS.primarySoft, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  noticeText: { ...TYPOGRAPHY.caption, color: COLORS.primaryAccent, textAlign: 'center' },
  errorBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.dangerLight, padding: SPACING.sm },
  errorText: { ...TYPOGRAPHY.caption, color: COLORS.dangerDark, flex: 1 },
  messageList: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.md, flexGrow: 1 },
  emptyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.xs },
  myMessageRow: { justifyContent: 'flex-end' },
  messageBubble: { maxWidth: '82%', borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  otherBubble: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  myBubble: { backgroundColor: COLORS.primaryAccent, borderBottomRightRadius: 4 },
  sender: { ...TYPOGRAPHY.caption, color: COLORS.primaryAccent, fontWeight: '700', marginBottom: 3 },
  message: { ...TYPOGRAPHY.body, color: COLORS.textPrimary, lineHeight: 20 },
  myMessage: { color: COLORS.textInverse },
  time: { fontSize: 10, color: COLORS.textMuted, alignSelf: 'flex-end', marginTop: 4 },
  myTime: { color: '#DDEBFF' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, maxHeight: 110, minHeight: 44, backgroundColor: COLORS.surfaceAlt, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderDark, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, color: COLORS.textPrimary, fontSize: 15, lineHeight: 20 },
  sendButton: { width: 44, height: 44, borderRadius: RADIUS.full, backgroundColor: COLORS.primaryAccent, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: COLORS.border },
});

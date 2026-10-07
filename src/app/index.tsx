import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.mark}>
              <ThemedText style={styles.markText}>C</ThemedText>
            </View>
            <ThemedText style={styles.headerLabel}>NITW</ThemedText>
          </View>

          <View style={styles.hero}>
            <ThemedText style={styles.eyebrow}>CENTRE FOR CAREER DEVELOPMENT</ThemedText>
            <ThemedText style={styles.title}>Your future{'\n'}starts here.</ThemedText>
            <ThemedText style={styles.description}>
              Empowering NIT Warangal students with the guidance, skills, and opportunities to
              build meaningful careers.
            </ThemedText>
            <Link href="/explore" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Explore CCPD resources"
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
                <ThemedText style={styles.primaryButtonText}>Explore CCPD</ThemedText>
                <ThemedText style={styles.arrow}>→</ThemedText>
              </Pressable>
            </Link>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <ThemedText style={styles.statValue}>01</ThemedText>
              <ThemedText style={styles.statLabel}>Career hub</ThemedText>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <ThemedText style={styles.statValue}>NITW</ThemedText>
              <ThemedText style={styles.statLabel}>Your community</ThemedText>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.cardAccent} />
            <ThemedText style={styles.cardKicker}>CCPD NITW</ThemedText>
            <ThemedText style={styles.cardTitle}>Connect. Prepare. Succeed.</ThemedText>
            <ThemedText style={styles.cardDescription}>
              Stay informed about placements, training, events, and every opportunity waiting for
              you.
            </ThemedText>
          </View>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101E33',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  mark: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F6B73C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: '#101E33',
    fontSize: 25,
    fontWeight: '800',
  },
  headerLabel: {
    color: '#B9C7D9',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 72,
  },
  eyebrow: {
    color: '#F6B73C',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.three,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 48,
    lineHeight: 53,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  description: {
    color: '#B9C7D9',
    fontSize: 17,
    lineHeight: 26,
    marginTop: Spacing.four,
    maxWidth: 520,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#F6B73C',
    borderRadius: 14,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    marginTop: Spacing.five,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: '#101E33',
    fontSize: 16,
    fontWeight: '800',
  },
  arrow: {
    color: '#101E33',
    fontSize: 22,
    lineHeight: 18,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2C3C53',
    paddingVertical: Spacing.three,
    marginBottom: Spacing.four,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#8294AC',
    fontSize: 12,
    marginTop: Spacing.one,
  },
  divider: {
    width: 1,
    height: 34,
    backgroundColor: '#2C3C53',
    marginHorizontal: Spacing.four,
  },
  featureCard: {
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#172943',
    padding: Spacing.four,
    minHeight: 170,
  },
  cardAccent: {
    position: 'absolute',
    right: -28,
    top: -36,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#25486B',
  },
  cardKicker: {
    color: '#F6B73C',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    marginTop: Spacing.two,
  },
  cardDescription: {
    color: '#B9C7D9',
    fontSize: 14,
    lineHeight: 21,
    marginTop: Spacing.two,
    maxWidth: 480,
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import { CheckCheck, Sparkles, Package } from 'lucide-react-native';
import { ColorPalette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

export const NotificationsScreen: React.FC = () => {
  const { notifications, markAllAsRead, unreadCount } = useNotifications();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>Order updates & exclusive cellar rewards</Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markReadBtn} activeOpacity={0.8}>
            <CheckCheck size={14} color={colors.gold} style={{ marginRight: 4 }} />
            <Text style={styles.markReadText}>Mark read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyBox}>
          <Package size={28} color={colors.textMuted} style={{ marginBottom: 8 }} />
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {notifications.map((item) => (
            <View
              key={item.id}
              style={[styles.card, item.read ? styles.cardRead : styles.cardUnread]}
            >
              <View style={styles.row}>
                <View style={styles.iconBox}>
                  {item.type === 'COUPON_EARNED' ? (
                    <Sparkles size={18} color={colors.gold} />
                  ) : (
                    <Package size={18} color={colors.gold} />
                  )}
                </View>

                <View style={styles.info}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.timeText}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.messageText}>{item.message}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  markReadText: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: 'bold',
  },
  list: {
    gap: 10,
  },
  emptyBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 28,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  cardRead: {
    borderColor: colors.cardBorder,
    opacity: 0.7,
  },
  cardUnread: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 10,
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});

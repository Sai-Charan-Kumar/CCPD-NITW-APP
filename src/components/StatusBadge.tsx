import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { DriveStatus, OverallApplicationStatus, UserRole } from '../types';

interface StatusBadgeProps {
  type: 'driveStatus' | 'eligibility' | 'applicationStatus' | 'category' | 'role';
  value: string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'medium' }) => {
  let backgroundColor = COLORS.surfaceAlt;
  let textColor = COLORS.textSecondary;
  let borderColor = COLORS.border;
  let label = value;

  if (type === 'role') {
    switch (value as UserRole) {
      case 'STUDENT':
        backgroundColor = COLORS.primarySoft;
        textColor = COLORS.primaryAccent;
        borderColor = '#BFDBFE';
        label = 'Student';
        break;
      case 'TNP':
        backgroundColor = COLORS.warningLight;
        textColor = COLORS.warningDark;
        borderColor = COLORS.warningBorder;
        label = 'T&P Officer';
        break;
      case 'CCPD_HEAD':
        backgroundColor = COLORS.purpleLight;
        textColor = COLORS.purple;
        borderColor = COLORS.purpleBorder;
        label = 'CCPD Head';
        break;
    }
  } else if (type === 'eligibility') {
    if (value === 'Eligible') {
      backgroundColor = COLORS.successLight;
      textColor = COLORS.successDark;
      borderColor = COLORS.successBorder;
    } else {
      backgroundColor = COLORS.dangerLight;
      textColor = COLORS.dangerDark;
      borderColor = COLORS.dangerBorder;
    }
  } else if (type === 'driveStatus') {
    switch (value as DriveStatus) {
      case 'deadline_near':
        backgroundColor = '#FEF2F2';
        textColor = '#DC2626';
        borderColor = '#FECACA';
        label = 'Closing Soon';
        break;
      case 'ongoing':
        backgroundColor = COLORS.successLight;
        textColor = COLORS.successDark;
        borderColor = COLORS.successBorder;
        label = 'Open to Apply';
        break;
      case 'upcoming':
        backgroundColor = COLORS.primarySoft;
        textColor = COLORS.primaryAccent;
        borderColor = '#BFDBFE';
        label = 'Upcoming';
        break;
      case 'closed':
        backgroundColor = COLORS.surfaceAlt;
        textColor = COLORS.textMuted;
        borderColor = COLORS.border;
        label = 'Registration Closed';
        break;
    }
  } else if (type === 'applicationStatus') {
    switch (value as OverallApplicationStatus) {
      case 'Offer Extended':
      case 'Offer Accepted':
        backgroundColor = COLORS.successLight;
        textColor = COLORS.successDark;
        borderColor = COLORS.successBorder;
        break;
      case 'Shortlisted for Final':
      case 'Interview In-Progress':
        backgroundColor = COLORS.purpleLight;
        textColor = COLORS.purple;
        borderColor = COLORS.purpleBorder;
        break;
      case 'OA Cleared':
      case 'OA Scheduled':
        backgroundColor = COLORS.primarySoft;
        textColor = COLORS.primaryAccent;
        borderColor = '#BFDBFE';
        break;
      case 'Application Submitted':
        backgroundColor = COLORS.surfaceAlt;
        textColor = COLORS.textSecondary;
        borderColor = COLORS.border;
        break;
      case 'Not Shortlisted':
        backgroundColor = COLORS.dangerLight;
        textColor = COLORS.dangerDark;
        borderColor = COLORS.dangerBorder;
        break;
    }
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          borderColor,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: isSmall ? 10 : 11,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...TYPOGRAPHY.badge,
  },
});

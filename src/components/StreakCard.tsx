import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Card } from './ui/Card';
import { useTheme } from '../context/ThemeContext';
import { theme as AppTheme } from '../theme/theme';

interface StreakCardProps {
    count: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ count }) => {
    const { theme } = useTheme();
    const currentTheme = AppTheme[theme as 'light' | 'dark'];
    const { colors, gradients } = currentTheme;

    return (
        <Card style={styles.container}>
            <View style={styles.content}>
                <LinearGradient
                    colors={gradients.fire}
                    style={styles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={styles.icon}>🔥</Text>
                </LinearGradient>
                <View style={styles.textContainer}>
                    <Text style={[styles.count, { color: colors.text }]}>{count} Day Streak</Text>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>
                        Keep it up! You're on fire!
                    </Text>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        padding: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    icon: {
        fontSize: 28,
    },
    textContainer: {
        flex: 1,
    },
    count: {
        fontSize: 20,
        fontWeight: '800',
    },
    label: {
        fontSize: 14,
    },
});

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

interface DayData {
    date: Date | string;
    active: boolean;
}

interface StreakCalendarProps {
    calendarData: DayData[];
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ calendarData }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Get last 30 days if data is large, or just use what we have
    // For a heatmap, we usually want at least a week or more.

    // Sort by date just in case
    const sortedData = [...calendarData].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group into weeks (7 days each)
    const weeks: DayData[][] = [];
    let currentWeek: DayData[] = [];

    sortedData.forEach((day, index) => {
        currentWeek.push(day);
        if (currentWeek.length === 7 || index === sortedData.length - 1) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    const renderDay = (day: DayData, index: number) => {
        const date = new Date(day.date);
        return (
            <View
                key={index}
                style={[
                    styles.dayBox,
                    {
                        backgroundColor: day.active ? '#6366f1' : (isDark ? '#1e293b' : '#f1f5f9'),
                        borderColor: day.active ? '#4f46e5' : 'transparent',
                        borderWidth: day.active ? 1 : 0
                    }
                ]}
            >
                <Text style={[styles.dayText, { color: day.active ? '#fff' : (isDark ? '#94a3b8' : '#64748b'), fontSize: 10 }]}>
                    {date.getDate()}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.daysHeader}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <Text key={i} style={[styles.headerText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{day}</Text>
                ))}
            </View>
            <View style={styles.grid}>
                {weeks.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.weekRow}>
                        {week.map((day, dayIndex) => renderDay(day, dayIndex))}
                    </View>
                ))}
            </View>
            {calendarData.length === 0 && (
                <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>No activity recorded yet</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        padding: 12,
        borderRadius: 16,
    },
    daysHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    headerText: {
        fontSize: 10,
        fontWeight: '700',
        width: 28,
        textAlign: 'center',
    },
    grid: {
        gap: 6,
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },
    dayBox: {
        width: (width - 100) / 7, // Adjust based on padding
        aspectRatio: 1,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayText: {
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 8,
        fontSize: 12,
        fontStyle: 'italic',
    }
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './ui/Card';
import { Question } from '../types';
import { useTheme } from '../context/ThemeContext';
import { theme as AppTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

interface QuestionCardProps {
    question: Question;
    onPress?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onPress }) => {
    const { theme } = useTheme();
    const currentTheme = AppTheme[theme as 'light' | 'dark'];
    const { colors } = currentTheme;
    const { user } = useAuth(); // Get user context

    const isSolved = user?.solvedQuestionIds?.includes(question._id);

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Easy': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Hard': return '#ef4444';
            default: return colors.textSecondary;
        }
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Card style={styles.container}>
                <View style={styles.topRow}>
                    <View style={[styles.badge, { backgroundColor: getDifficultyColor(question.difficulty) + '15' }]}>
                        <Text style={[styles.badgeText, { color: getDifficultyColor(question.difficulty) }]}>
                            {question.difficulty}
                        </Text>
                    </View>
                    <Text style={[styles.date, { color: colors.textSecondary }]}>
                        {new Date(question.createdAt).toLocaleDateString()}
                    </Text>
                    {isSolved && (
                        <View style={styles.isSolvedButton}>
                            <Text style={[styles.solveText, { color: colors.success }]}>Solved</Text>
                        </View>
                    )}
                </View>

                <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                    {question.title}
                </Text>

                <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                    {question.description}
                </Text>

                <View style={styles.startRow}>
                    <View style={styles.authorContainer}>
                        <View style={[styles.authorAvatar, { backgroundColor: colors.primary }]}>
                            <Text style={styles.avatarText}>
                                {question.author?.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <Text style={[styles.authorName, { color: colors.textSecondary }]}>
                            {question.author?.name || 'Unknown'}
                        </Text>
                    </View>

                    <View style={styles.solveButton}>
                        <Text style={[styles.solveText, { color: colors.primary }]}>
                            {isSolved ? 'View Result →' : 'Solve →'}
                        </Text>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        padding: 20,
        borderRadius: 24,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 22,
    },
    date: {
        fontSize: 12,
        fontWeight: '500',
    },
    startRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    authorName: {
        fontSize: 13,
        fontWeight: '500',
    },
    solveButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    isSolvedButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#1eb91025',
        borderRadius: 50,
    },
    solveText: {
        fontWeight: '700',
        fontSize: 14,
    },
});

import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { theme as AppTheme } from '../theme/theme';
import { Question } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useSolveQuestion } from '../hooks/useUser';
import { useAlert } from '../context/AlertContext';

const { width, height } = Dimensions.get('window');

interface QuestionDetailModalProps {
    visible: boolean;
    onClose: () => void;
    question: Question | null;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({ visible, onClose, question }) => {
    const { theme } = useTheme();
    const currentTheme = AppTheme[theme as 'light' | 'dark'];
    const { colors } = currentTheme;
    const isDark = theme === 'dark';
    const { updateUser, user } = useAuth();
    const { showAlert } = useAlert();
    const solveMutation = useSolveQuestion();

    const isSolved = user?.solvedQuestionIds?.includes(question?._id || "");

    if (!question) return null;

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'Easy': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Hard': return '#ef4444';
            default: return colors.textSecondary;
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.dismissArea}
                    onPress={onClose}
                    activeOpacity={1}
                />
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    <View style={styles.dragHandle} />

                    <View style={styles.header}>
                        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(question.difficulty) + '15' }]}>
                            <Text style={[styles.difficultyText, { color: getDifficultyColor(question.difficulty) }]}>
                                {question.difficulty}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
                            <Text style={{ color: colors.textSecondary, fontWeight: '800' }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.title, { color: colors.text }]}>{question.title}</Text>

                        <View style={styles.metaRow}>
                            <View style={styles.authorBadge}>
                                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.avatarText}>{question.author?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                                </View>
                                <Text style={[styles.authorName, { color: colors.textSecondary }]}>
                                    Posted by {question.author?.name || 'Unknown'}
                                </Text>
                            </View>
                            <Text style={[styles.date, { color: colors.textSecondary }]}>
                                {new Date(question.createdAt).toLocaleDateString()}
                            </Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]} />

                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Problem Description</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            {question.description}
                        </Text>

                        {question.tags && question.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {question.tags.map((tag, i) => (
                                    <View key={i} style={[styles.tag, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                                        <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: isDark ? '#334155' : '#e2e8f0' }]}>
                        <Button
                            title={isSolved ? "Solved ✅" : "I've Solved This!"}
                            onPress={() => {
                                if (isSolved) return;
                                solveMutation.mutate(question._id, {
                                    onSuccess: (updatedUser) => {
                                        updateUser(updatedUser);
                                        showAlert({ title: "Great Job! 🎉", message: "Question marked as solved!", type: "success" });
                                        onClose();
                                    },
                                    onError: (err: any) => {
                                        showAlert({ title: "Error", message: err.response?.data?.message || "Failed to mark as solved", type: "error" });
                                    }
                                });
                            }}
                            variant={isSolved ? "outline" : "primary"}
                            loading={solveMutation.isPending}
                            style={styles.solveBtn}
                            disabled={isSolved}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    dismissArea: {
        flex: 1,
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingTop: 8,
        height: height * 0.75,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#cbd5e1',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    difficultyBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
    },
    difficultyText: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollArea: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
        lineHeight: 32,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    authorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    authorName: {
        fontSize: 13,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
        marginBottom: 24,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
    },
    solveBtn: {
        height: 56,
        borderRadius: 16,
    }
});

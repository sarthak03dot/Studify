import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useTheme } from '../context/ThemeContext';
import { theme as AppTheme } from '../theme/theme';
import apiClient from '../utils/api';
import { useAlert } from '../context/AlertContext';

interface AddQuestionModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ visible, onClose, onSuccess }) => {
    const { theme } = useTheme();
    const currentTheme = AppTheme[theme as 'light' | 'dark'];
    const { colors } = currentTheme;
    const { showAlert } = useAlert();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            showAlert({ title: "Error", message: "Please fill in all fields", type: "error" });
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/questions', {
                title,
                description,
                difficulty,
                tags: [] // Can add tags input later
            });
            setTitle('');
            setDescription('');
            setDifficulty('Medium');
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            showAlert({ title: "Error", message: "Failed to post question", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const DifficultyButton = ({ level }: { level: 'Easy' | 'Medium' | 'Hard' }) => (
        <TouchableOpacity
            style={[
                styles.diffButton,
                {
                    borderColor: difficulty === level ? colors.primary : colors.border,
                    backgroundColor: difficulty === level ? colors.primary + '20' : 'transparent'
                }
            ]}
            onPress={() => setDifficulty(level)}
        >
            <Text style={[
                styles.diffText,
                { color: difficulty === level ? colors.primary : colors.textSecondary }
            ]}>
                {level}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>New Question</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.form}>
                        <Input
                            label="Question Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g., Two Sum"
                        />

                        <View style={styles.diffContainer}>
                            <Text style={[styles.label, { color: colors.text }]}>Difficulty</Text>
                            <View style={styles.diffWrapper}>
                                <DifficultyButton level="Easy" />
                                <DifficultyButton level="Medium" />
                                <DifficultyButton level="Hard" />
                            </View>
                        </View>

                        <Input
                            label="Description (Markdown)"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe the problem..."
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.outlineButton]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { padding: 0, overflow: 'hidden' }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={['#f59e0b', '#ef4444']}
                                style={styles.gradientButton}
                            >
                                {loading ? (
                                    <Text style={[styles.buttonText, { color: '#fff' }]}>Posting...</Text>
                                ) : (
                                    <Text style={[styles.buttonText, { color: '#fff' }]}>Post Question</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: '80%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        fontSize: 24,
        fontWeight: '400',
    },
    form: {
        flex: 1,
    },
    diffContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginLeft: 4,
    },
    diffWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    diffButton: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    diffText: {
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        marginTop: 16,
        paddingBottom: 20,
        gap: 12
    },
    button: {
        flex: 1,
        borderRadius: 12,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    gradientButton: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
    }
});

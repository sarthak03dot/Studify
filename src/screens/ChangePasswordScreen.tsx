import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react-native';

import Navbar from '../components/Navbar';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { useChangePassword } from '../hooks/useUser';
import { theme as appTheme } from '../theme/theme';

const { width } = Dimensions.get('window');

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { showAlert } = useAlert();
    const changePasswordMutation = useChangePassword();
    const isDark = theme === 'dark';
    const colors = appTheme[isDark ? 'dark' : 'light'].colors;

    const { control, handleSubmit, formState: { errors } } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        }
    });

    const onSubmit = async (data: PasswordFormData) => {
        try {
            await changePasswordMutation.mutateAsync({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            showAlert({ title: "Success", message: "Password updated successfully!", type: 'success' });
            navigation.goBack();
        } catch (error: any) {
            showAlert({ title: "Error", message: error.message || "Failed to update password", type: 'error' });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Navbar title="Security" showBack />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Card style={styles.card}>
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff' }]}>
                                <Lock size={32} color={colors.primary} />
                            </View>
                        </View>

                        <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Ensure your account is using a long, random password to stay secure.
                        </Text>

                        <Controller
                            control={control}
                            name="currentPassword"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Current Password"
                                    placeholder="••••••••"
                                    secureTextEntry
                                    value={value}
                                    onChangeText={onChange}
                                    error={errors.currentPassword?.message}
                                    containerStyle={styles.input}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="newPassword"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="New Password"
                                    placeholder="••••••••"
                                    secureTextEntry
                                    value={value}
                                    onChangeText={onChange}
                                    error={errors.newPassword?.message}
                                    containerStyle={styles.input}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="confirmPassword"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label="Confirm New Password"
                                    placeholder="••••••••"
                                    secureTextEntry
                                    value={value}
                                    onChangeText={onChange}
                                    error={errors.confirmPassword?.message}
                                    containerStyle={styles.input}
                                />
                            )}
                        />

                        <Button
                            title="Update Password"
                            onPress={handleSubmit(onSubmit)}
                            loading={changePasswordMutation.isPending}
                            style={styles.button}
                            variant="primary"
                        />
                    </Card>

                    <View style={styles.tipContainer}>
                        <ShieldCheck size={20} color={isDark ? '#4ade80' : '#166534'} />
                        <Text style={[styles.tipText, { color: isDark ? '#86efac' : '#166534' }]}>
                            Tip: A strong password includes numbers, symbols, and mixed-case letters.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    card: {
        padding: 24,
        borderRadius: 32,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
        height: 56,
        borderRadius: 16,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        padding: 16,
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderRadius: 16,
        gap: 12,
    },
    tipText: {
        fontSize: 13,
        flex: 1,
        fontWeight: '500',
    }
});

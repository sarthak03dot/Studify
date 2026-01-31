/* eslint-disable react/self-closing-comp */
import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Image
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { useForm, Controller } from "react-hook-form";
import { z, ZodError } from "zod";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useAlert } from "../context/AlertContext";
import { theme as AppTheme } from "../theme/theme";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

const { width, height } = Dimensions.get('window');

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen({ navigation }: any) {
    const { login } = useAuth();
    const { showAlert } = useAlert();
    const { theme } = useTheme();
    const currentTheme = AppTheme[theme as 'light' | 'dark'];
    const { colors } = currentTheme;
    const [loading, setLoading] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim, slideAnim]);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            loginSchema.parse(data);
            setLoading(true);
            await login(data.email, data.password);
            navigation.replace("Dashboard");
        } catch (error: any) {
            let errorMessage = "An error occurred";

            if (error instanceof ZodError) {
                errorMessage = error.issues.map(issue => issue.message).join('\n');
            } else if (error.message) {
                errorMessage = error.message;
            }

            await showAlert({
                title: "Login Failed",
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={theme === 'dark' ? ['#450a0a', '#111827'] : ['#f59e0b', '#ef4444', '#be123c']}
            style={styles.backgroundImage}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <Animated.View style={{
                        width: '90%',
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }}>
                        <View style={[styles.glassCard, { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)' }]}>
                            <View style={[styles.iconContainer, { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                                <Text style={{ fontSize: 40 }}>🔥</Text>
                            </View>

                            <Text style={[styles.title, { color: theme === 'dark' ? '#fff' : '#1e293b' }]}>Welcome Back</Text>
                            <Text style={[styles.subtitle, { color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }]}>
                                Sign in to continue your learning journey
                            </Text>

                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={styles.inputWrapper}>
                                        <Input
                                            placeholder="Email Address"
                                            autoCapitalize="none"
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            error={errors.email?.message}
                                            icon={<Text style={{ fontSize: 20 }}>✉️</Text>}
                                            glass
                                        />
                                    </View>
                                )}
                            />

                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View style={[styles.inputWrapper, { marginBottom: 24 }]}>
                                        <Input
                                            placeholder="Password"
                                            secureTextEntry
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            error={errors.password?.message}
                                            icon={<Text style={{ fontSize: 20 }}>🔒</Text>}
                                            glass
                                        />
                                    </View>
                                )}
                            />

                            <Button
                                title="Login"
                                onPress={handleSubmit(onSubmit)}
                                loading={loading}
                                variant="primary"
                            />

                            <View style={styles.footer}>
                                <Text style={[styles.footerText, { color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }]}>
                                    Don't have an account?{" "}
                                </Text>
                                <Button
                                    title="Sign Up"
                                    variant="ghost"
                                    onPress={() => navigation.navigate("Register")}
                                    style={{ paddingVertical: 0, paddingHorizontal: 0, height: 'auto' }}
                                    textStyle={{ color: theme === 'dark' ? '#fca5a5' : '#ef4444', fontSize: 14, fontWeight: '700' }}
                                />
                            </View>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: width,
        height: height,
    },
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: '100%',
    },
    glassCard: {
        padding: 32,
        borderRadius: 32,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 24,
        marginTop: -70,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    logoImage: {
        width: 64,
        height: 64,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 32,
        textAlign: 'center',
        opacity: 0.9
    },
    inputWrapper: {
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '500'
    },
});


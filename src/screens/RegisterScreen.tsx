import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ImageBackground,
    Dimensions,
    Image
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z, ZodError } from "zod";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useAlert } from "../context/AlertContext";


const { width, height } = Dimensions.get('window');

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen({ navigation }: any) {
    const { register: authRegister } = useAuth();
    const { showAlert } = useAlert();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [loading, setLoading] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                delay: 200,
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim, slideAnim]);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            registerSchema.parse(data);
            setLoading(true);
            await authRegister(data.name, data.email, data.password);
            navigation.replace("Dashboard");
        } catch (error: any) {
            let errorMessage = "An error occurred";

            if (error instanceof ZodError) {
                errorMessage = error.issues.map(issue => issue.message).join('\n');
            } else if (error.message) {
                errorMessage = error.message;
            }

            await showAlert({
                title: "Registration Failed",
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        backgroundColor: isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    };

    const textStyle = {
        color: isDark ? '#fff' : '#1f2937',
    };

    const subTextStyle = {
        color: isDark ? '#aaa' : '#6b7280',
    };

    const inputStyle = {
        backgroundColor: isDark ? '#2d2d2d' : '#fff',
        borderColor: isDark ? '#444' : '#e5e7eb',
        color: isDark ? '#fff' : '#1f2937',
    };

    const inputIconColor = isDark ? '#aaa' : '#000';

    return (
        <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
            style={styles.backgroundImage}
            blurRadius={3}
        >
            <View style={styles.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.container}
                >
                    <Animated.View style={[styles.formContainer, containerStyle, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={[styles.iconContainer, { backgroundColor: isDark ? '#444' : '#f0f0f0', borderColor: isDark ? '#2d2d2d' : '#fff' }]}>
                            <Text style={styles.icon}>
                                <Image
                                    source={require('../assets/images/logo.png')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </Text>
                        </View>

                        <Text style={[styles.title, textStyle]}>Join Us</Text>
                        <Text style={[styles.subtitle, subTextStyle]}>Create an account to start sharing notes</Text>

                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={[styles.inputContainer, inputStyle]}>
                                    <Text style={[styles.inputIcon, { color: inputIconColor }]}>👤</Text>
                                    <TextInput
                                        placeholder="Full Name"
                                        placeholderTextColor={isDark ? "#888" : "#999"}
                                        style={[styles.input, { color: isDark ? '#fff' : '#1f2937' }]}
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                </View>
                            )}
                        />
                        {errors.name && (
                            <Text style={styles.errorText}>{errors.name.message}</Text>
                        )}

                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={[styles.inputContainer, inputStyle]}>
                                    <Text style={[styles.inputIcon, { color: inputIconColor }]}>✉️</Text>
                                    <TextInput
                                        placeholder="Email Address"
                                        placeholderTextColor={isDark ? "#888" : "#999"}
                                        style={[styles.input, { color: isDark ? '#fff' : '#1f2937' }]}
                                        autoCapitalize="none"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                </View>
                            )}
                        />
                        {errors.email && (
                            <Text style={styles.errorText}>{errors.email.message}</Text>
                        )}

                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={[styles.inputContainer, inputStyle]}>
                                    <Text style={[styles.inputIcon, { color: inputIconColor }]}>🔒</Text>
                                    <TextInput
                                        placeholder="Password"
                                        placeholderTextColor={isDark ? "#888" : "#999"}
                                        style={[styles.input, { color: isDark ? '#fff' : '#1f2937' }]}
                                        secureTextEntry
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                    />
                                </View>
                            )}
                        />
                        {errors.password && (
                            <Text style={styles.errorText}>{errors.password.message}</Text>
                        )}

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.link}>Log In</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </ImageBackground>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: '100%',
    },
    formContainer: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: '#f0f0f0',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: -64,
        borderWidth: 4,
        borderColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    icon: {
        fontSize: 40,
    },
    logoImage: {
        width: 64,
        height: 64,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1f2937",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 32,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 8,
        height: 56,
        width: '100%',
    },
    inputIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
    },
    errorText: {
        color: "#ef4444",
        fontSize: 12,
        alignSelf: 'flex-start',
        marginLeft: 4,
        marginBottom: 12,
    },
    button: {
        backgroundColor: "#4f46e5",
        width: '100%',
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 16,
        marginBottom: 24,
        shadowColor: "#4f46e5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        color: "#6b7280",
        fontSize: 14,
    },
    link: {
        color: "#4f46e5",
        fontSize: 14,
        fontWeight: "700",
    },
});

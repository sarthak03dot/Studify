import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Image
} from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { uploadResource, updateResource } from "../services/resource.service";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useAlert } from "../context/AlertContext";
import Navbar from "../components/Navbar";

const uploadSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    type: z.enum(['note', 'syllabus', 'paper']),
    branch: z.string().min(1, "Branch is required"),
    subject: z.string().min(1, "Subject is required"),
    year: z.number().min(1).max(4),
    fileUrl: z.string().url("Invalid URL"),
});

type UploadFormData = z.infer<typeof uploadSchema>;

const typeOptions = [
    { label: 'Note', value: 'note', icon: '📝' },
    { label: 'Syllabus', value: 'syllabus', icon: '📚' },
    { label: 'Question Paper', value: 'paper', icon: '📄' }
];

const yearOptions = [1, 2, 3, 4];

export default function UploadResourceScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { resource } = (route.params as any) || {};
    const isEditing = !!resource;

    const { theme } = useTheme();
    const { showAlert } = useAlert();
    const isDark = theme === 'dark';

    // Animation values
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(50)).current;

    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<UploadFormData>({
        defaultValues: {
            title: resource?.title || '',
            description: resource?.description || '',
            type: resource?.type || 'note',
            branch: resource?.branch || '',
            subject: resource?.subject || '',
            year: resource?.year || 1,
            fileUrl: resource?.fileUrl || ''
        }
    });

    useEffect(() => {
        if (resource) {
            reset({
                title: resource.title,
                description: resource.description,
                type: resource.type,
                branch: resource.branch,
                subject: resource.subject,
                year: resource.year,
                fileUrl: resource.fileUrl
            });
        }
    }, [resource, reset]);

    const selectedType = watch('type');
    const selectedYear = watch('year');

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, [fadeAnim, slideAnim]);

    const onSubmit = async (data: UploadFormData) => {
        try {
            // Manual validation check since we aren't using a resolver
            const validationResult = uploadSchema.safeParse(data);

            if (!validationResult.success) {
                await showAlert({
                    title: "Validation Error",
                    message: validationResult.error.issues.map(i => i.message).join('\n'),
                    type: 'warning'
                });
                return;
            }

            setLoading(true);

            if (isEditing) {
                await updateResource(resource._id, data);
                await showAlert({ title: "Success", message: "Resource updated successfully!", type: 'success' });
            } else {
                await uploadResource(data);
                await showAlert({ title: "Success", message: "Resource uploaded successfully!", type: 'success' });
            }
            navigation.goBack();
        } catch (error: any) {
            console.error(error);
            await showAlert({
                title: "Error",
                message: error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'upload'} resource`,
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient
                colors={theme === 'dark' ? ['#7f1d1d', '#1e1e1e'] : ['#f59e0b', '#ef4444']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <KeyboardAvoidingView
                style={[styles.container]}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <Navbar title={isEditing ? "Edit Resource" : "Upload Resource"} />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        <View style={[styles.glassCard, { borderColor: 'rgba(255,255,255,0.2)' }]}>
                            <Controller
                                control={control}
                                name="title"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="Title"
                                        placeholder="e.g. Data Structures Unit 1"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.title?.message}
                                        glass
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="description"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="Description"
                                        placeholder="Brief description of the content..."
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.description?.message}
                                        multiline
                                        numberOfLines={3}
                                        glass
                                        style={{ height: 80, textAlignVertical: 'top' }}
                                    />
                                )}
                            />

                            <Text style={[styles.label, { color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }]}>Resource Type</Text>
                            <View style={styles.typeContainer}>
                                {typeOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.typeButton,
                                            selectedType === option.value && styles.typeButtonActive,
                                            {
                                                backgroundColor: selectedType === option.value
                                                    ? (theme === 'dark' ? '#ef4444' : '#f59e0b')
                                                    : 'rgba(255,255,255,0.2)',
                                                borderColor: selectedType === option.value
                                                    ? 'transparent'
                                                    : 'rgba(255,255,255,0.3)'
                                            }
                                        ]}
                                        onPress={() => setValue('type', option.value as any)}
                                    >
                                        <Text style={styles.typeIcon}>{option.icon}</Text>
                                        <Text style={[
                                            styles.typeText,
                                            selectedType === option.value ? { color: '#fff' } : { color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }
                                        ]}>{option.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.label, { color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }]}>Year</Text>
                            <View style={styles.yearContainer}>
                                {yearOptions.map((year) => (
                                    <TouchableOpacity
                                        key={year}
                                        style={[
                                            styles.yearButton,
                                            {
                                                backgroundColor: selectedYear === year
                                                    ? (theme === 'dark' ? '#ef4444' : '#f59e0b')
                                                    : 'rgba(255,255,255,0.2)',
                                                borderColor: selectedYear === year
                                                    ? 'transparent'
                                                    : 'rgba(255,255,255,0.3)'
                                            }
                                        ]}
                                        onPress={() => setValue('year', year)}
                                    >
                                        <Text style={[
                                            styles.yearText,
                                            { color: selectedYear === year ? '#fff' : (theme === 'dark' ? '#cbd5e1' : '#4b5563') }
                                        ]}>{year} Year</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Controller
                                control={control}
                                name="branch"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="Branch"
                                        placeholder="e.g. CSE, ECE"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.branch?.message}
                                        glass
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="subject"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="Subject"
                                        placeholder="e.g. Mathematics II"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.subject?.message}
                                        glass
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="fileUrl"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="File URL (Drive/Link)"
                                        placeholder="https://..."
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.fileUrl?.message}
                                        autoCapitalize="none"
                                        glass
                                    />
                                )}
                            />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.submitButton, loading && styles.buttonDisabled]}
                                    onPress={handleSubmit(onSubmit)}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={['#f59e0b', '#ef4444']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.gradientButton}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <Text style={styles.submitButtonText}>{isEditing ? "Update Resource" : "Upload Resource"}</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={[styles.cancelButtonText, { color: theme === 'dark' ? '#cbd5e1' : '#4b5563' }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
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
    glassCard: {
        borderRadius: 24,
        padding: 24,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.85)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeButtonActive: {
        transform: [{ scale: 1.05 }],
    },
    typeIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    typeText: {
        fontWeight: '600',
        fontSize: 12,
    },
    yearContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    yearButton: {
        flex: 1,
        minWidth: '20%',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    yearText: {
        fontWeight: '600',
        fontSize: 13,
    },
    buttonContainer: {
        marginTop: 32,
        gap: 12,
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradientButton: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    cancelButton: {
        padding: 16,
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    cancelButtonText: {
        fontWeight: '600',
    },
});

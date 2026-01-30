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
    Animated
} from "react-native";
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
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F3F4F6' }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Navbar title={isEditing ? "Edit Resource" : "Upload Resource"} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    <View style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }]}>
                        <Text style={styles.label}>Title</Text>
                        <Controller
                            control={control}
                            name="title"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, { color: isDark ? '#FFF' : '#333', borderColor: isDark ? '#333' : '#E5E7EB' }]}
                                    placeholder="e.g. Data Structures Unit 1"
                                    placeholderTextColor={isDark ? '#666' : '#9CA3AF'}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        {errors.title && <Text style={styles.errorText}>{errors.title.message}</Text>}

                        <Text style={styles.label}>Description</Text>
                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, styles.textArea, { color: isDark ? '#FFF' : '#333', borderColor: isDark ? '#333' : '#E5E7EB' }]}
                                    placeholder="Brief description of the content..."
                                    placeholderTextColor={isDark ? '#666' : '#9CA3AF'}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    multiline
                                    numberOfLines={4}
                                />
                            )}
                        />
                        {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

                        <Text style={styles.label}>Resource Type</Text>
                        <View style={styles.typeContainer}>
                            {typeOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.typeButton,
                                        selectedType === option.value && styles.typeButtonActive,
                                        { borderColor: isDark ? '#333' : '#E5E7EB' }
                                    ]}
                                    onPress={() => setValue('type', option.value as any)}
                                >
                                    <Text style={styles.typeIcon}>{option.icon}</Text>
                                    <Text style={[
                                        styles.typeText,
                                        selectedType === option.value && styles.typeTextActive,
                                        { color: selectedType === option.value ? '#FFF' : (isDark ? '#AAA' : '#4B5563') }
                                    ]}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Year</Text>
                        <View style={styles.yearContainer}>
                            {yearOptions.map((year) => (
                                <TouchableOpacity
                                    key={year}
                                    style={[
                                        styles.yearButton,
                                        selectedYear === year && styles.yearButtonActive,
                                        { borderColor: isDark ? '#333' : '#E5E7EB', backgroundColor: selectedYear === year ? '#6C63FF' : 'transparent' }
                                    ]}
                                    onPress={() => setValue('year', year)}
                                >
                                    <Text style={[
                                        styles.yearText,
                                        selectedYear === year && { color: '#FFF' },
                                        { color: selectedYear === year ? '#FFF' : (isDark ? '#AAA' : '#4B5563') }
                                    ]}>{year} Year</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Branch</Text>
                        <Controller
                            control={control}
                            name="branch"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, { color: isDark ? '#FFF' : '#333', borderColor: isDark ? '#333' : '#E5E7EB' }]}
                                    placeholder="e.g. CSE, ECE, ME"
                                    placeholderTextColor={isDark ? '#666' : '#9CA3AF'}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        {errors.branch && <Text style={styles.errorText}>{errors.branch.message}</Text>}

                        <Text style={styles.label}>Subject</Text>
                        <Controller
                            control={control}
                            name="subject"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, { color: isDark ? '#FFF' : '#333', borderColor: isDark ? '#333' : '#E5E7EB' }]}
                                    placeholder="e.g. Mathematics II"
                                    placeholderTextColor={isDark ? '#666' : '#9CA3AF'}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                        {errors.subject && <Text style={styles.errorText}>{errors.subject.message}</Text>}

                        <Text style={styles.label}>File URL (Drive/Link)</Text>
                        <Controller
                            control={control}
                            name="fileUrl"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    style={[styles.input, { color: isDark ? '#FFF' : '#333', borderColor: isDark ? '#333' : '#E5E7EB' }]}
                                    placeholder="https://..."
                                    placeholderTextColor={isDark ? '#666' : '#9CA3AF'}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                />
                            )}
                        />
                        {errors.fileUrl && <Text style={styles.errorText}>{errors.fileUrl.message}</Text>}

                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.buttonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>{isEditing ? "Update Resource" : "Upload Resource"}</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={[styles.cancelButtonText, { color: isDark ? '#AAA' : '#6B7280' }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
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
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    card: {
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 8,
        marginTop: 16,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeButtonActive: {
        backgroundColor: '#6C63FF',
        borderColor: '#6C63FF',
    },
    typeIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    typeText: {
        fontWeight: '600',
        fontSize: 12,
    },
    typeTextActive: {
        color: '#FFF',
    },
    yearContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    yearButton: {
        flex: 1, // Distribute space evenly
        minWidth: '20%', // Ensure buttons don't get too small
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    yearButtonActive: {
        backgroundColor: '#6C63FF',
        borderColor: '#6C63FF',
    },
    yearText: {
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#6C63FF',
        marginTop: 32,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#6C63FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    cancelButton: {
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        fontWeight: '600',
    },
});

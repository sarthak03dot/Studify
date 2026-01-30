import React, { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    FlatList,
    Linking,
    Animated
} from "react-native";
import Navbar from '../components/Navbar';
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useAlert } from "../context/AlertContext";
import apiClient from "../utils/api";
import { getResources } from "../services/resource.service";
import { Resource } from "../types/resource";

export default function ProfileScreen({ navigation }: any) {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { showAlert } = useAlert();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(user?.name || "");

    // My Uploads State
    const [myUploads, setMyUploads] = useState<Resource[]>([]);
    const [loadingUploads, setLoadingUploads] = useState(false);

    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Animation for uploads
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fetchMyUploads = useCallback(async () => {
        if (!user) return;
        try {
            setLoadingUploads(true);
            const data = await getResources({ uploadedBy: user.id });
            setMyUploads(data);
        } catch (error) {
            console.error("Failed to fetch my uploads", error);
        } finally {
            setLoadingUploads(false);
        }
    }, [user]);

    useFocusEffect(
        useCallback(() => {
            if (user) {
                // Only update name if it hasn't been edited locally to avoid overwriting typed input? 
                // Actually name state is initialized from user, let's keep it simple.
                // setName(user.name); 
                fetchMyUploads();
            }
        }, [user, fetchMyUploads])
    );

    useEffect(() => {
        if (!loadingUploads && myUploads.length > 0) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                // @ts-ignore
                useNativeDriver: true // Native driver might not support transform on non-layout props for layout animation but works for simple transforms
            }).start();
        }
    }, [loadingUploads, myUploads, fadeAnim]);

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            await apiClient.put("/auth/profile", { name, theme });
            await showAlert({ title: "Success", message: "Profile updated successfully", type: 'success' });
            setIsEditing(false);
        } catch (error: any) {
            await showAlert({ title: "Error", message: error.message || "Failed to update profile", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            await showAlert({ title: "Error", message: "Please fill in all password fields", type: 'error' });
            return;
        }

        if (newPassword.length < 6) {
            await showAlert({ title: "Error", message: "New password must be at least 6 characters", type: 'error' });
            return;
        }

        try {
            setLoading(true);
            await apiClient.post("/auth/change-password", {
                currentPassword,
                newPassword,
            });
            await showAlert({ title: "Success", message: "Password changed successfully", type: 'success' });
            setCurrentPassword("");
            setNewPassword("");
            setShowPasswordForm(false);
        } catch (error: any) {
            await showAlert({ title: "Error", message: error.message || "Failed to change password", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const isDark = theme === "dark";

    const containerStyle = {
        backgroundColor: isDark ? '#121212' : '#f3f4f6',
    };

    const cardStyle = {
        backgroundColor: isDark ? '#1e1e1e' : '#fff',
        shadowColor: isDark ? '#000' : '#000',
    };

    const textStyle = {
        color: isDark ? '#fff' : '#1f2937',
    };

    const subTextStyle = {
        color: isDark ? '#aaa' : '#6b7280',
    };

    const inputStyle = {
        backgroundColor: isDark ? '#2d2d2d' : '#f9fafb',
        borderColor: isDark ? '#444' : '#e5e7eb',
        color: isDark ? '#fff' : '#1f2937',
    };

    const renderUploadItem = ({ item, index }: { item: Resource, index: number }) => (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{
                    translateX: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20 * (index + 1), 0]
                    })
                }]
            }}
        >
            <View style={[styles.uploadCard, cardStyle]}>
                <TouchableOpacity
                    onPress={() => Linking.openURL(item.fileUrl).catch(console.error)}
                    style={{ flex: 1 }}
                >
                    <View style={[styles.uploadIcon, { backgroundColor: isDark ? '#2d2d2d' : '#e0e7ff' }]}>
                        <Text style={{ fontSize: 20 }}>
                            {item.type === 'note' ? '📝' : item.type === 'syllabus' ? '📚' : '📄'}
                        </Text>
                    </View>
                    <View style={styles.uploadInfo}>
                        <Text style={[styles.uploadTitle, textStyle]} numberOfLines={1}>{item.title}</Text>
                        <Text style={[styles.uploadSubtitle, subTextStyle]}>{item.subject}</Text>
                    </View>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <Text style={styles.uploadDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    <TouchableOpacity
                        style={{ padding: 4, backgroundColor: isDark ? '#333' : '#eee', borderRadius: 4 }}
                        onPress={() => navigation.navigate('UploadResource', { resource: item })}
                    >
                        <Text style={{ fontSize: 12, color: isDark ? '#fff' : '#333' }}>✏️ Edit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: '#f3f4f6' }]}>
            <Navbar title="Profile" />
            <ScrollView
                style={[styles.container, containerStyle]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View style={[styles.header, cardStyle]}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.title, textStyle]}>{user?.name}</Text>
                    <Text style={[styles.email, subTextStyle]}>{user?.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, textStyle]}>My Uploads</Text>
                    {loadingUploads ? (
                        <ActivityIndicator color="#4f46e5" />
                    ) : myUploads.length > 0 ? (
                        <FlatList
                            data={myUploads}
                            renderItem={({ item, index }) => renderUploadItem({ item, index })}
                            keyExtractor={item => item._id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.uploadsList}
                        />
                    ) : (
                        <Text style={[styles.emptyText, subTextStyle]}>You haven't uploaded anything yet.</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, textStyle]}>Settings</Text>

                    <View style={[styles.card, cardStyle]}>
                        <Text style={[styles.label, subTextStyle]}>Display Name</Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.input, inputStyle]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={isDark ? "#888" : "#999"}
                            />
                        ) : (
                            <View style={styles.valueRow}>
                                <Text style={[styles.valueText, textStyle]}>{name}</Text>
                                <TouchableOpacity onPress={() => setIsEditing(true)}>
                                    <Text style={styles.editText}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {isEditing && (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton, { backgroundColor: isDark ? '#2d2d2d' : '#fff', borderColor: isDark ? '#444' : '#d1d5db' }]}
                                onPress={() => setIsEditing(false)}
                                disabled={loading}
                            >
                                <Text style={[styles.buttonText, styles.cancelButtonText, { color: isDark ? '#fff' : '#374151' }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.saveButton, loading && { opacity: 0.7 }]}
                                onPress={handleUpdateProfile}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={[styles.card, cardStyle]}>
                        <Text style={[styles.label, subTextStyle]}>Theme Preference</Text>
                        <View style={[styles.themeContainer, { backgroundColor: isDark ? '#2d2d2d' : '#f3f4f6' }]}>
                            <TouchableOpacity style={[styles.themeOption, theme === 'light' && styles.themeOptionActive, theme === 'light' && { backgroundColor: isDark ? '#444' : '#fff' }]} onPress={() => setTheme('light')}>
                                <Text style={[styles.themeText, theme === 'light' && styles.themeTextActive, { color: theme === 'light' ? (isDark ? '#fff' : '#1f2937') : '#6b7280' }]}>Light</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.themeOption, theme === 'dark' && styles.themeOptionActive, theme === 'dark' && { backgroundColor: isDark ? '#444' : '#fff' }]} onPress={() => setTheme('dark')}>
                                <Text style={[styles.themeText, theme === 'dark' && styles.themeTextActive, { color: theme === 'dark' ? (isDark ? '#fff' : '#1f2937') : '#6b7280' }]}>Dark</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.accordionHeader, cardStyle]}
                        onPress={() => setShowPasswordForm(!showPasswordForm)}
                    >
                        <Text style={[styles.accordionTitle, textStyle]}>Change Password</Text>
                        <Text style={{ color: isDark ? '#fff' : '#000' }}>{showPasswordForm ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {showPasswordForm && (
                        <View style={[styles.passwordForm, cardStyle]}>
                            <TextInput
                                style={[styles.input, inputStyle]}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                                placeholder="Current Password"
                                placeholderTextColor={isDark ? "#888" : "#999"}
                            />
                            <TextInput
                                style={[styles.input, inputStyle]}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                placeholder="New Password"
                                placeholderTextColor={isDark ? "#888" : "#999"}
                            />
                            <TouchableOpacity
                                style={[styles.button, styles.changePasswordButton, loading && { opacity: 0.7 }]}
                                onPress={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <Text style={styles.buttonText}>Update Password</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={() => {
                    logout();
                    navigation.navigate("Dashboard");
                }}>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f4f6",
    },
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#4f46e5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: "#6b7280",
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 12,
        marginLeft: 4,
    },
    uploadsList: {
        paddingRight: 20,
    },
    uploadCard: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginRight: 12,
        width: 200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    uploadIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#e0e7ff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    uploadInfo: {
        marginBottom: 8,
    },
    uploadTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    uploadSubtitle: {
        fontSize: 12,
        color: '#6b7280',
    },
    uploadDate: {
        fontSize: 10,
        color: '#9ca3af',
        textAlign: 'right',
    },
    emptyText: {
        fontStyle: 'italic',
        color: '#9ca3af',
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    valueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 16,
        color: '#1f2937',
    },
    editText: {
        color: '#4f46e5',
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9fafb',
        marginBottom: 12,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#16a34a',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    cancelButtonText: {
        color: '#374151',
    },
    themeContainer: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        padding: 4,
        borderRadius: 8,
    },
    themeOption: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    themeOptionActive: {
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    themeText: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    themeTextActive: {
        color: '#1f2937',
        fontWeight: '600',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
    },
    passwordForm: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    changePasswordButton: {
        backgroundColor: '#f59e0b',
        marginTop: 8,
    },
    logoutButton: {
        marginHorizontal: 20,
        backgroundColor: '#fee2e2',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#ef4444',
        fontWeight: '600',
        fontSize: 16,
    },
});

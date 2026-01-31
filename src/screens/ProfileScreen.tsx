import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Linking,
    Dimensions
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from "react-native-linear-gradient";
import Animated, {
    FadeInDown,
    FadeInRight,
    useAnimatedStyle,
    withSpring,
    useSharedValue
} from "react-native-reanimated";
import {
    Settings,
    Flame,
    CheckCircle2,
    UploadCloud,
    LogOut,
    ChevronRight,
    Moon,
    Sun,
    Lock,
    Edit3,
    BookOpen,
    Info,
    BarChart2
} from "lucide-react-native";

import Navbar from '../components/Navbar';
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useAlert } from "../context/AlertContext";
import { useSocket } from "../context/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile, useUpdateProfile } from "../hooks/useUser";
import { useResources } from "../hooks/useResources";
import { theme as appTheme } from "../theme/theme";
import { Card } from "../components/ui/Card";
import { StreakCalendar } from "../components/StreakCalendar";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }: any) {
    const { logout, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { showAlert } = useAlert();
    const { lastUpdate } = useSocket();
    const queryClient = useQueryClient();
    const isDark = theme === "dark";
    const colors = appTheme[isDark ? 'dark' : 'light'].colors;

    // TanStack Query Hooks
    const { data: user, isLoading: loadingProfile, refetch: refetchProfile } = useProfile();
    const { data: uploads, isLoading: loadingUploads, refetch: refetchUploads } = useResources({ uploadedBy: user?.id });
    const updateProfileMutation = useUpdateProfile();

    const streakCount = typeof user?.streak === 'object' ? user?.streak?.count : (user?.streak ?? 0);

    useFocusEffect(
        useCallback(() => {
            refetchProfile();
            refetchUploads();
        }, [refetchProfile, refetchUploads])
    );

    useEffect(() => {
        if (lastUpdate && lastUpdate.type === 'streak_update') {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    }, [lastUpdate, queryClient]);


    if (loadingProfile && !user) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator color={colors.primary} size="large" />
            </View>
        );
    }

    const renderStat = (icon: any, value: any, label: string, index: number) => (
        <Animated.View
            entering={FadeInDown.delay(200 + index * 100)}
            style={styles.statItem}
        >
            <View style={[styles.statIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }]}>
                {icon}
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </Animated.View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Navbar title="Profile" transparent />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <LinearGradient
                        colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#6366f1', '#a855f7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.headerGradient}
                    />

                    <View style={styles.profileInfo}>
                        <Animated.View
                            entering={FadeInDown.duration(800)}
                            style={styles.avatarContainer}
                        >
                            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(200)} style={{ alignItems: 'center', width: '100%' }}>
                            <Text style={styles.userName}>{user?.name}</Text>
                            <Text style={styles.userEmail}>{user?.email}</Text>

                            {user?.college && (
                                <View style={styles.badgeRow}>
                                    <BookOpen size={14} color="rgba(255,255,255,0.8)" />
                                    <Text style={styles.badgeText}>{user.college}</Text>
                                </View>
                            )}

                            {user?.bio && (
                                <View style={styles.bioContainer}>
                                    <Text style={styles.bioText} numberOfLines={2}>{user.bio}</Text>
                                </View>
                            )}
                        </Animated.View>

                        <View style={styles.statsRow}>
                            {renderStat(<Flame size={20} color="#fff" />, streakCount, "Current", 0)}
                            {renderStat(<Flame size={20} color="#ef4444" />, typeof user?.streak === 'object' ? user.streak.highestStreak : 0, "Highest", 1)}
                            {renderStat(<CheckCircle2 size={20} color="#fff" />, user?.dsaSolved ?? 0, "Solved", 2)}
                            {renderStat(<UploadCloud size={20} color="#fff" />, user?.resourcesUploaded ?? 0, "Uploads", 3)}
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    {/* Activity Section */}
                    <Animated.View entering={FadeInDown.delay(500)}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Learning Activity</Text>
                        <Card style={styles.activityCard}>
                            <View style={styles.activityHeader}>
                                <View>
                                    <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Current Streak</Text>
                                    <Text style={[styles.cardValue, { color: colors.text }]}>
                                        {streakCount} <Text style={{ fontSize: 16, fontWeight: 'normal' }}>Days</Text>
                                    </Text>
                                </View>
                                <Flame size={32} color={appTheme.light.colors.error} />
                            </View>
                            <StreakCalendar calendarData={user?.streakCalendar || []} />
                        </Card>
                    </Animated.View>

                    {/* My Uploads */}
                    <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Uploads</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('MyResources')}>
                                <Text style={{ color: colors.primary, fontWeight: '600' }}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        {loadingUploads ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.uploadsList}>
                                {uploads && uploads.length > 0 ? (
                                    uploads.map((item: any, index: number) => (
                                        <Animated.View
                                            key={item._id}
                                            entering={FadeInRight.delay(100 * index)}
                                        >
                                            <TouchableOpacity
                                                onPress={() => Linking.openURL(item.fileUrl)}
                                                style={[styles.uploadCard, { backgroundColor: colors.surface }]}
                                            >
                                                <View style={[styles.uploadIconWrap, { backgroundColor: colors.background }]}>
                                                    <Text style={{ fontSize: 20 }}>{item.type === 'note' ? '📝' : '📚'}</Text>
                                                </View>
                                                <Text style={[styles.uploadTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                                                <Text style={[styles.uploadSubject, { color: colors.textSecondary }]}>{item.subject}</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))
                                ) : (
                                    <Text style={{ color: colors.textSecondary, marginLeft: 4 }}>No uploads yet</Text>
                                )}
                            </ScrollView>
                        )}
                    </Animated.View>

                    {/* Global Statistics Section */}
                    <Animated.View entering={FadeInDown.delay(650)} style={styles.section}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('GlobalStats')}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#8b5cf6', '#6366f1']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.statsButton}
                            >
                                <View style={styles.statsButtonLeft}>
                                    <BarChart2 size={24} color="#fff" />
                                    <View style={{ marginLeft: 16 }}>
                                        <Text style={styles.statsButtonTitle}>Global Statistics</Text>
                                        <Text style={styles.statsButtonSubtitle}>See how the community is doing</Text>
                                    </View>
                                </View>
                                <ChevronRight size={20} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Settings Group */}
                    <Animated.View entering={FadeInDown.delay(700)} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
                        <Card style={styles.settingsCard}>
                            <TouchableOpacity
                                style={styles.settingsItem}
                                onPress={() => navigation.navigate('EditProfile')}
                            >
                                <View style={styles.settingsItemLeft}>
                                    <View style={[styles.settingsIcon, { backgroundColor: '#e0e7ff' }]}>
                                        <Edit3 size={18} color="#4f46e5" />
                                    </View>
                                    <Text style={[styles.settingsText, { color: colors.text }]}>Edit Profile</Text>
                                </View>
                                <ChevronRight size={20} color={colors.textSecondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.settingsItem}
                                onPress={() => setTheme(isDark ? 'light' : 'dark')}
                            >
                                <View style={styles.settingsItemLeft}>
                                    <View style={[styles.settingsIcon, { backgroundColor: isDark ? '#334155' : '#fef3c7' }]}>
                                        {isDark ? <Moon size={18} color="#94a3b8" /> : <Sun size={18} color="#d97706" />}
                                    </View>
                                    <Text style={[styles.settingsText, { color: colors.text }]}>Dark Mode</Text>
                                </View>
                                <View style={[styles.toggle, { backgroundColor: isDark ? colors.primary : '#e2e8f0' }]}>
                                    <View style={[styles.toggleDot, { marginLeft: isDark ? 16 : 2 }]} />
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.settingsItem}
                                onPress={() => navigation.navigate('ChangePassword')}
                            >
                                <View style={styles.settingsItemLeft}>
                                    <View style={[styles.settingsIcon, { backgroundColor: '#fef2f2' }]}>
                                        <Lock size={18} color="#ef4444" />
                                    </View>
                                    <Text style={[styles.settingsText, { color: colors.text }]}>Change Password</Text>
                                </View>
                                <ChevronRight size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </Card>
                    </Animated.View>

                    <TouchableOpacity
                        style={[styles.logoutButton, { backgroundColor: isDark ? '#1e1b4b' : '#fee2e2' }]}
                        onPress={logout}
                    >
                        <LogOut size={20} color="#ef4444" />
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 80,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        overflow: 'hidden',
    },
    headerGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    profileInfo: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.4)',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 42,
        fontWeight: '800',
        color: '#fff',
    },
    userName: {
        fontSize: 26,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 8,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
    },
    badgeText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    bioContainer: {
        width: '80%',
        alignItems: 'center',
        marginBottom: 4,
    },
    bioText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    editContainer: {
        width: '80%',
        alignItems: 'center',
        marginBottom: 20,
    },
    editInput: {
        marginBottom: 12,
        height: 50,
    },
    editActions: {
        flexDirection: 'row',
        gap: 12,
    },
    saveBtn: {
        height: 40,
        paddingHorizontal: 20,
    },
    cancelBtn: {
        height: 40,
        paddingHorizontal: 20,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase',
        fontWeight: '600',
        marginTop: 2,
    },
    content: {
        padding: 24,
    },
    section: {
        marginTop: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 16,
    },
    activityCard: {
        padding: 20,
        borderRadius: 24,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 32,
        fontWeight: '800',
    },
    uploadsList: {
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    uploadCard: {
        width: 160,
        padding: 16,
        borderRadius: 24,
        marginRight: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    uploadIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    uploadTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    uploadSubject: {
        fontSize: 12,
        fontWeight: '500',
    },
    settingsCard: {
        padding: 8,
        borderRadius: 24,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingsText: {
        fontSize: 15,
        fontWeight: '600',
    },
    toggle: {
        width: 36,
        height: 20,
        borderRadius: 10,
        padding: 2,
    },
    toggleDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        padding: 16,
        borderRadius: 16,
        gap: 10,
    },
    logoutText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '700',
    },
    statsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 24,
    },
    statsButtonLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsButtonTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
    statsButtonSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
});

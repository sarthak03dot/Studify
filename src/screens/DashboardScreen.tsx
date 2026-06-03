/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, StatusBar, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LinearGradient from 'react-native-linear-gradient';
import Navbar from "../components/Navbar";
import { AppStackParamList } from "../navigation/AppStack";
import { useTheme } from "../context/ThemeContext";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/api";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlert } from "../context/AlertContext";
import { useProfile } from "../hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";

import { StreakCard } from "../components/StreakCard";
import { QuestionCard } from "../components/QuestionCard";
import { AddQuestionModal } from "../components/AddQuestionModal";
import { QuestionDetailModal } from "../components/QuestionDetailModal";
import { Question } from "../types";

type DashboardNavigationProp = NativeStackNavigationProp<AppStackParamList, "Dashboard">;

export default function DashboardScreen() {
    const navigation = useNavigation<DashboardNavigationProp>();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { showAlert, showConfirm } = useAlert();
    const isDark = theme === 'dark';
    const { lastUpdate } = useSocket();
    const queryClient = useQueryClient();
    const { data: profileUser } = useProfile();
    const displayUser = profileUser || user;

    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [latestUpdate, setLatestUpdate] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    // Stagger values for cards
    const cardAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0)
    ]).current;

    useEffect(() => {
        // Main content entry
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();

        // Staggered cards
        Animated.stagger(150, cardAnims.map(anim =>
            Animated.spring(anim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            })
        )).start();
    }, [fadeAnim, slideAnim, cardAnims]);

    useEffect(() => {
        fetchLatestUpdate();
    }, []);

    const fetchLatestUpdate = async () => {
        try {
            const res = await apiClient.get('/updates');
            const data = res as any;
            if (data && data.length > 0) {
                setLatestUpdate(data[0]);
                await AsyncStorage.setItem('latest_update', JSON.stringify(data[0]));
            }
        } catch (error) {
            const cached = await AsyncStorage.getItem('latest_update');
            if (cached) setLatestUpdate(JSON.parse(cached));
            console.log("Error fetching updates, used cache if available", error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const res = await apiClient.get('/questions');
            const data = res as any;
            setQuestions(data);
            await AsyncStorage.setItem('dashboard_questions', JSON.stringify(data));
        } catch (error) {
            const cached = await AsyncStorage.getItem('dashboard_questions');
            if (cached) setQuestions(JSON.parse(cached));
            console.log("Error fetching questions, used cache if available", error);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (lastUpdate) {
            if (lastUpdate.type === 'question') {
                fetchQuestions();
            } else if (lastUpdate.type === 'streak_update') {
                queryClient.invalidateQueries({ queryKey: ['profile'] });
            }
        }
    }, [lastUpdate, queryClient]);

    useEffect(() => {
        if (lastUpdate) {
            if (lastUpdate.type === 'question') {
                setLatestUpdate({
                    title: 'New Question!',
                    message: lastUpdate.data.title,
                    type: 'new_content'
                });
            } else if (lastUpdate.type === 'streak_update') {
                setLatestUpdate({
                    title: 'Streak Updated! 🔥',
                    message: `You are now on a ${lastUpdate.data.count} day streak!`,
                    type: 'info'
                });
            } else {
                setLatestUpdate(lastUpdate);
            }
        } else {
            fetchLatestUpdate();
        }
    }, [lastUpdate]);

    const categories = [
        { id: 'note', title: 'Start Learning', subtitle: 'Browse Notes', icon: '📝', color: '#6366f1' },
        { id: 'syllabus', title: 'Check Syllabus', subtitle: 'Stay Updated', icon: '📚', color: '#ec4899' },
        { id: 'paper', title: 'Practice Papers', subtitle: 'Exam Prep', icon: '📄', color: '#10b981' },
    ];

    const years = [1, 2, 3, 4];

    const navigateToCategory = async (type: string) => {
        if (!selectedYear) {
            await showAlert({
                title: "Select Year",
                message: "Please select your year first.",
                type: 'warning'
            });
            return;
        }
        navigation.navigate('ResourceList', { type, year: selectedYear });
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f3f4f6' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Navbar />

            {/* Gradient Background Header */}
            {/* Gradient Background Header */}
            <LinearGradient
                colors={isDark ? ['#7f1d1d', '#1e1e1e'] : ['#f59e0b', '#ef4444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerBackground}
            />

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={false} // Would need to wire up a real loading state, but for now just call fetch functions
                        onRefresh={() => {
                            fetchLatestUpdate();
                            fetchQuestions();
                        }} 
                        colors={['#6366f1']} 
                    />
                }
            >
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={[styles.greeting, { color: isDark ? '#ef4444' : '#fff', textShadowColor: 'rgba(0,0,0,0.2)', textShadowRadius: 4 }]}>
                        {displayUser && displayUser.name ? `Hello, ${displayUser.name.split(' ')[0]}!` : 'Hello, Guest!'}
                    </Text>
                    <Text style={[styles.subtitle, { color: isDark ? '#d1d5db' : 'rgba(255,255,255,0.9)' }]}>
                        {displayUser ? 'Ready to level up your skills today?' : 'Sign in to unlock your full potential.'}
                    </Text>
                </Animated.View>

                {displayUser && displayUser.streak && (
                    <StreakCard count={typeof displayUser.streak === 'object' ? displayUser.streak.count : displayUser.streak} />
                )}

                {/* Updates Ticker */}
                {latestUpdate && (
                    <Animated.View style={[styles.updateCard, { opacity: fadeAnim }]}>
                        <LinearGradient
                            colors={['rgba(251, 191, 36, 0.1)', 'rgba(251, 146, 60, 0.1)']}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <View style={styles.updateIconContainer}>
                            <Text style={styles.updateIcon}>🔔</Text>
                        </View>
                        <View style={styles.updateContent}>
                            <Text style={styles.updateTitle} numberOfLines={1}>{latestUpdate.title}</Text>
                            <Text style={styles.updateMessage} numberOfLines={1}>{latestUpdate.message}</Text>
                        </View>
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                        </View>
                    </Animated.View>
                )}

                {/* Year Selection */}
                <View style={styles.yearContainer}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#1e293b' }]}>Select Year</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScroll}>
                        {years.map((year) => (
                            <TouchableOpacity
                                key={year}
                                onPress={() => setSelectedYear(year)}
                                activeOpacity={0.8}
                            >
                                {selectedYear === year ? (
                                    <LinearGradient
                                        colors={['#6366f1', '#8b5cf6']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={[styles.yearButton, styles.yearButtonActive]}
                                    >
                                        <Text style={[styles.yearText, styles.yearTextActive]}>
                                            {year === 1 ? '1st' : year === 2 ? '2nd' : year === 3 ? '3rd' : '4th'} Year
                                        </Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.yearButton, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                                        <Text style={[styles.yearText, { color: isDark ? '#fff' : '#1e293b' }]}>
                                            {year === 1 ? '1st' : year === 2 ? '2nd' : year === 3 ? '3rd' : '4th'} Year
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.categoriesContainer}>
                    {categories.map((category, index) => (
                        <Animated.View
                            key={category.id}
                            style={{
                                opacity: cardAnims[index],
                                transform: [
                                    {
                                        translateY: cardAnims[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [50, 0]
                                        })
                                    }
                                ]
                            }}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.categoryCard,
                                    { backgroundColor: isDark ? '#1e293b' : '#fff' }
                                ]}
                                onPress={() => navigateToCategory(category.id)}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: category.color + '15' }]}>
                                    <Text style={styles.icon}>{category.icon}</Text>
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={[styles.categoryTitle, { color: isDark ? '#FFF' : '#1e293b' }]}>{category.title}</Text>
                                    <Text style={[styles.categorySubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>{category.subtitle}</Text>
                                </View>
                                <View style={[styles.arrowContainer, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
                                    <Text style={[styles.arrow, { color: isDark ? '#cbd5e1' : '#94a3b8' }]}>→</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <LinearGradient
                        colors={['#6366f1', '#8b5cf6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.actionSection}
                    >
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>
                                {displayUser ? 'Share Your Knowledge' : 'Join the Community'}
                            </Text>
                            <Text style={styles.actionDesc}>
                                {displayUser ? 'Upload notes to help others succeed.' : 'Sign in to upload notes and track progress.'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={async () => {
                                if (displayUser) {
                                    navigation.navigate('UploadResource', {});
                                } else {
                                    const confirmed = await showConfirm({
                                        title: "Sign In Required",
                                        message: "You need to be signed in to upload resources.",
                                        confirmText: "Sign In",
                                        cancelText: "Cancel"
                                    });
                                    if (confirmed) {
                                        navigation.navigate("Login");
                                    }
                                }
                            }}
                        >
                            <Text style={styles.uploadButtonText}>
                                {displayUser ? 'Upload' : 'Get Started'}
                            </Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* DSA Questions Section */}
                <View style={[styles.section, { marginTop: 32 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#1e293b', marginBottom: 0 }]}>
                            Daily DSA Challenge
                        </Text>
                    </View>

                    {/* Floating Action Button for Adding Question */}
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={async () => {
                            if (!displayUser) {
                                await showAlert({ title: "Sign In Required", message: "Sign in to post questions.", type: "warning" });
                                navigation.navigate("Login");
                                return;
                            }
                            setShowAddQuestion(true);
                        }}
                    >
                        <LinearGradient
                            colors={['#f59e0b', '#ef4444']}
                            style={styles.fabGradient}
                        >
                            <Text style={styles.fabIcon}>+</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {questions.map((q) => (
                        <QuestionCard
                            key={q._id}
                            question={q}
                            onPress={() => {
                                setSelectedQuestion(q);
                                setShowDetailModal(true);
                            }}
                        />
                    ))}
                    {questions.length === 0 && (
                        <Text style={{ color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center', marginTop: 16 }}>
                            No questions yet. Be the first to post!
                        </Text>
                    )}
                </View>

            </ScrollView>

            <AddQuestionModal
                visible={showAddQuestion}
                onClose={() => setShowAddQuestion(false)}
                onSuccess={fetchQuestions}
            />

            <QuestionDetailModal
                visible={showDetailModal}
                question={selectedQuestion}
                onClose={() => setShowDetailModal(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 300,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 24,
        marginTop: 8,
    },
    greeting: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
    },
    updateCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(251, 146, 60, 0.2)',
    },
    updateIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(251, 146, 60, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    updateIcon: {
        fontSize: 20,
    },
    updateContent: {
        flex: 1,
    },
    updateTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 2,
    },
    updateMessage: {
        fontSize: 12,
        color: '#B45309',
    },
    newBadge: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    newBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
    },
    yearContainer: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    yearScroll: {
        paddingRight: 24,
    },
    yearButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 50, // Pill shape
        marginRight: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    yearButtonActive: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 50,
        marginRight: 12,
        shadowColor: "#6366f1",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 0,
    },
    yearText: {
        fontWeight: '600',
        fontSize: 15,
    },
    yearTextActive: {
        fontWeight: '700',
        color: '#fff',
    },
    categoriesContainer: {
        marginBottom: 32,
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 28,
    },
    cardContent: {
        flex: 1,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    categorySubtitle: {
        fontSize: 14,
    },
    arrowContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    actionSection: {
        padding: 24,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    actionContent: {
        flex: 1,
        marginRight: 16,
    },
    actionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
    },
    actionDesc: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
    },
    uploadButton: {
        backgroundColor: '#FFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    uploadButtonText: {
        color: '#6366f1',
        fontSize: 16,
        fontWeight: '700',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 100,
        borderRadius: 30,
        elevation: 8,
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
        marginTop: -2
    },
});

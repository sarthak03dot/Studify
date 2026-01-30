/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Navbar from "../components/Navbar";
import { AppStackParamList } from "../navigation/AppStack";
import { useTheme } from "../context/ThemeContext";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/api";
import { useAlert } from "../context/AlertContext";

type DashboardNavigationProp = NativeStackNavigationProp<AppStackParamList, "Dashboard">;

export default function DashboardScreen() {
    const navigation = useNavigation<DashboardNavigationProp>();
    const { theme } = useTheme();
    const { user } = useAuth();
    const { showAlert, showConfirm } = useAlert();
    const isDark = theme === 'dark';
    const { lastUpdate } = useSocket();

    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [latestUpdate, setLatestUpdate] = useState<any>(null);

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
        if (lastUpdate) {
            setLatestUpdate(lastUpdate);
        } else {
            fetchLatestUpdate();
        }
    }, [lastUpdate]);

    const fetchLatestUpdate = async () => {
        try {
            const res = await apiClient.get('/updates');
            if (res.data && res.data.length > 0) {
                setLatestUpdate(res.data[0]);
            }
        } catch (error) {
            console.log("Error fetching updates", error);
        }
    }

    const categories = [
        { id: 'note', title: 'Start Learning', subtitle: 'Browse Notes', icon: '📝', color: '#6C63FF' },
        { id: 'syllabus', title: 'Check Syllabus', subtitle: 'Stay Updated', icon: '📚', color: '#FF6584' },
        { id: 'paper', title: 'Practice Papers', subtitle: 'Exam Prep', icon: '📄', color: '#4ECDC4' },
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
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F8F9FA' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <Navbar />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={[styles.greeting, { color: isDark ? '#FFF' : '#333' }]}>
                        {user ? `Hello, ${user.name.split(' ')[0]}! 👋` : 'Hello, Guest! 👋'}
                    </Text>
                    <Text style={[styles.subtitle, { color: isDark ? '#AAA' : '#666' }]}>
                        {user ? 'Your learning journey continues here.' : 'Sign in to access personalized features.'}
                    </Text>
                </Animated.View>

                {/* Updates Ticker */}
                {latestUpdate && (
                    <Animated.View style={[styles.updateCard, { opacity: fadeAnim }]}>
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
                    <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#333' }]}>Select Year</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScroll}>
                        {years.map((year) => (
                            <TouchableOpacity
                                key={year}
                                style={[
                                    styles.yearButton,
                                    selectedYear === year && styles.yearButtonActive,
                                    { backgroundColor: selectedYear === year ? '#6C63FF' : (isDark ? '#1E1E1E' : '#FFF') }
                                ]}
                                onPress={() => setSelectedYear(year)}
                            >
                                <Text style={[
                                    styles.yearText,
                                    selectedYear === year && styles.yearTextActive,
                                    { color: selectedYear === year ? '#FFF' : (isDark ? '#FFF' : '#333') }
                                ]}>
                                    {year === 1 ? '1st' : year === 2 ? '2nd' : year === 3 ? '3rd' : '4th'} Year
                                </Text>
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
                                    { backgroundColor: isDark ? '#1E1E1E' : '#FFF' }
                                ]}
                                onPress={() => navigateToCategory(category.id)}
                                activeOpacity={0.9}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                                    <Text style={styles.icon}>{category.icon}</Text>
                                </View>
                                <View style={styles.cardContent}>
                                    <Text style={[styles.categoryTitle, { color: isDark ? '#FFF' : '#333' }]}>{category.title}</Text>
                                    <Text style={[styles.categorySubtitle, { color: isDark ? '#888' : '#666' }]}>{category.subtitle}</Text>
                                </View>
                                <View style={[styles.arrowContainer, { backgroundColor: isDark ? '#333' : '#F3F4F6' }]}>
                                    <Text style={[styles.arrow, { color: isDark ? '#FFF' : '#333' }]}>→</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={[styles.actionSection, { backgroundColor: '#6C63FF' }]}>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>
                                {user ? 'Share Your Knowledge' : 'Join the Community'}
                            </Text>
                            <Text style={styles.actionDesc}>
                                {user ? 'Upload notes to help others succeed.' : 'Sign in to upload notes and track progress.'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={async () => {
                                if (user) {
                                    navigation.navigate('UploadResource');
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
                                {user ? 'Upload' : 'Get Started'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 24,
    },
    greeting: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '500',
    },
    updateCard: {
        backgroundColor: '#FEF3C7',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: "#F59E0B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    updateIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
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
        backgroundColor: '#EF4444',
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
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    yearScroll: {
        paddingRight: 24,
    },
    yearButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginRight: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    yearButtonActive: {
        shadowColor: "#6C63FF",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    yearText: {
        fontWeight: '600',
        fontSize: 16,
    },
    yearTextActive: {
        fontWeight: '700',
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
        elevation: 3,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
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
        shadowColor: "#6C63FF",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
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
    },
    uploadButtonText: {
        color: '#6C63FF',
        fontSize: 16,
        fontWeight: '700',
    },
});

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Linking
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../navigation/AppStack";
import {
    BarChart2,
    Globe,
    Github,
    Code,
    Terminal,
    Star,
    GitBranch,
    Trophy,
    Award,
    TrendingUp,
    ChevronRight,
    ExternalLink
} from "lucide-react-native";
import LinearGradient from "react-native-linear-gradient";
import Navbar from "../components/Navbar";
import { Card } from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { theme as appTheme } from "../theme/theme";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

export default function GlobalStatsScreen() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
    const isDark = theme === "dark";
    const colors = appTheme[isDark ? 'dark' : 'light'].colors;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [githubData, setGithubData] = useState<any>(null);
    const [leetcodeData, setLeetcodeData] = useState<any>(null);
    const [codeforcesData, setCodeforcesData] = useState<any>(null);

    const fetchGitHub = async (username: string) => {
        try {
            const res = await fetch(`https://api.github.com/users/${username}`);
            const data = await res.json();
            if (data.id) setGithubData(data);
        } catch (e) { console.error("GitHub fetch failed", e); }
    };

    const fetchLeetCode = async (username: string) => {
        try {
            const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
            const data = await res.json();
            if (data.status === "success") setLeetcodeData(data);
        } catch (e) { console.error("LeetCode fetch failed", e); }
    };

    const fetchCodeforces = async (username: string) => {
        try {
            const res = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
            const data = await res.json();
            if (data.status === "OK") setCodeforcesData(data.result[0]);
        } catch (e) { console.error("Codeforces fetch failed", e); }
    };

    const fetchAllStats = async () => {
        setLoading(true);
        const promises = [];
        if (user?.socialHandles?.github) promises.push(fetchGitHub(user.socialHandles.github));
        if (user?.socialHandles?.leetcode) promises.push(fetchLeetCode(user.socialHandles.leetcode));
        if (user?.socialHandles?.codeforces) promises.push(fetchCodeforces(user.socialHandles.codeforces));

        await Promise.all(promises);
        setLoading(false);
    };

    useEffect(() => {
        fetchAllStats();
    }, [user?.socialHandles]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAllStats();
        setRefreshing(false);
    };

    const renderEmptyState = () => (
        <Card style={styles.emptyCard}>
            <Terminal size={48} color={colors.primary} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Handles Set</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Add your usernames for GitHub, LeetCode, or Codeforces in your profile to see real-time statistics here.
            </Text>
            <TouchableOpacity
                style={[styles.editBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('EditProfile')}
            >
                <Text style={styles.editBtnText}>Set Handles Now</Text>
            </TouchableOpacity>
        </Card>
    );

    const renderGitHub = () => {
        if (!githubData) return null;
        return (
            <Animated.View entering={FadeInDown.delay(100)}>
                <Card style={[styles.statCard, { borderLeftColor: '#24292e', borderLeftWidth: 4 }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.platformIcon, { backgroundColor: '#f3f4f6' }]}>
                                <Github size={20} color="#24292e" />
                            </View>
                            <Text style={[styles.platformName, { color: colors.text }]}>GitHub</Text>
                        </View>
                        <TouchableOpacity onPress={() => Linking.openURL(`https://github.com/${user?.socialHandles?.github}`)}>
                            <ExternalLink size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainStats}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: colors.text }]}>{githubData.public_repos}</Text>
                            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Repos</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: colors.text }]}>{githubData.followers}</Text>
                            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Followers</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: colors.text }]}>{githubData.following}</Text>
                            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Following</Text>
                        </View>

                    </View>

                    <View style={styles.cardFooter}>
                        <GitBranch size={14} color={colors.textSecondary} />
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Member since {new Date(githubData.created_at).getFullYear()}
                        </Text>
                    </View>
                </Card>
            </Animated.View>
        );
    };

    const renderLeetCode = () => {
        if (!leetcodeData) return null;
        return (
            <Animated.View entering={FadeInDown.delay(200)}>
                <Card style={[styles.statCard, { borderLeftColor: '#ffa116', borderLeftWidth: 4 }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.platformIcon, { backgroundColor: '#fff7ed' }]}>
                                <Terminal size={20} color="#ffa116" />
                            </View>
                            <Text style={[styles.platformName, { color: colors.text }]}>LeetCode</Text>
                        </View>
                        <TouchableOpacity onPress={() => Linking.openURL(`https://leetcode.com/${user?.socialHandles?.leetcode}`)}>
                            <ExternalLink size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainStats}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: '#ffa116' }]}>{leetcodeData.totalSolved}</Text>
                            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Solved</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: colors.text }]}>{leetcodeData.ranking}</Text>
                            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Global Rank</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: colors.text }]}>{leetcodeData.acceptanceRate}%</Text>
                            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Acceptance</Text>
                        </View>
                    </View>

                    <View style={styles.lcComplexityPills}>
                        <View style={[styles.pill, { backgroundColor: '#eefcf4' }]}>
                            <Text style={[styles.pillText, { color: '#10b981' }]}>Easy: {leetcodeData.easySolved}</Text>
                        </View>
                        <View style={[styles.pill, { backgroundColor: '#fffbeb' }]}>
                            <Text style={[styles.pillText, { color: '#f59e0b' }]}>Med: {leetcodeData.mediumSolved}</Text>
                        </View>
                        <View style={[styles.pill, { backgroundColor: '#fef2f2' }]}>
                            <Text style={[styles.pillText, { color: '#ef4444' }]}>Hard: {leetcodeData.hardSolved}</Text>
                        </View>
                    </View>
                </Card>
            </Animated.View>
        );
    };

    const renderCodeforces = () => {
        if (!codeforcesData) return null;
        return (
            <Animated.View entering={FadeInDown.delay(300)}>
                <Card style={[styles.statCard, { borderLeftColor: '#3182ce', borderLeftWidth: 4 }]}>
                    <View style={styles.cardHeader}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.platformIcon, { backgroundColor: '#ebf8ff' }]}>
                                <Code size={20} color="#3182ce" />
                            </View>
                            <Text style={[styles.platformName, { color: colors.text }]}>Codeforces</Text>
                        </View>
                        <TouchableOpacity onPress={() => Linking.openURL(`https://codeforces.com/profile/${user?.socialHandles?.codeforces}`)}>
                            <ExternalLink size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mainStats}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: '#3182ce' }]}>{codeforcesData.rating || 'N/A'}</Text>
                            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Rating</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: colors.text }]}>{codeforcesData.maxRating || 'N/A'}</Text>
                            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Max Rating</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: colors.text }]}>{codeforcesData.rank || 'Unrated'}</Text>
                            <Text style={[styles.statLbl, { color: colors.textSecondary }]}>Rank</Text>
                        </View>
                    </View>

                    <View style={styles.cfRankPill}>
                        <Text style={styles.cfRankLabel}>Target: {codeforcesData.maxRank || 'Newbie'}</Text>
                    </View>
                </Card>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Navbar title="Ecosystem Stats" showBack />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Personal Dashboard</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Your real-time progress across platforms
                    </Text>
                </View>

                {loading && !refreshing ? (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Fetching stats...</Text>
                    </View>
                ) : (
                    <>
                        {!user?.socialHandles?.github && !user?.socialHandles?.leetcode && !user?.socialHandles?.codeforces ? (
                            renderEmptyState()
                        ) : (
                            <>
                                {renderGitHub()}
                                {renderLeetCode()}
                                {renderCodeforces()}
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20 },
    header: { marginBottom: 24 },
    title: { fontSize: 24, fontWeight: '800' },
    subtitle: { fontSize: 14, marginTop: 4 },
    loader: { height: 300, justifyContent: 'center', alignItems: 'center' },

    emptyCard: {
        padding: 32,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 20, marginBottom: 24 },
    editBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    editBtnText: { color: '#fff', fontWeight: '700' },

    statCard: {
        marginBottom: 16,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    platformIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    platformName: {
        fontSize: 16,
        fontWeight: '700',
    },
    mainStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statVal: {
        fontSize: 20,
        fontWeight: '800',
    },
    statLbl: {
        fontSize: 12,
        marginTop: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 12,
    },
    footerText: {
        fontSize: 12,
    },
    lcComplexityPills: {
        flexDirection: 'row',
        gap: 8,
    },
    pill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pillText: {
        fontSize: 11,
        fontWeight: '700',
    },
    cfRankPill: {
        backgroundColor: '#f1f5f9',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    cfRankLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
    }
});

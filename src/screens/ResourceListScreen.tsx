import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, TextInput, Modal, RefreshControl } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { getResources } from '../services/resource.service';
import { Resource } from '../types/resource';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import { useSocket } from '../context/SocketContext';
import ResourceCard from '../components/ResourceCard';
import { FlatList } from 'react-native';

const ResourceListScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { lastResource } = useSocket();
    const { type = 'all', branch, subject, year } = (route.params || {}) as { type?: string, branch?: string, subject?: string, year?: number };

    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const [selectedYear, setSelectedYear] = useState<number | null>(year || null);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(branch || null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(subject || null);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            fetchResources();
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true
            }).start();
        }, [])
    );

    useEffect(() => {
        if (lastResource) {
            fetchResources();
        }
    }, [lastResource]);

    const fetchResources = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            const initialFilters = type === 'all' ? {} : { type, branch, subject, year };
            const data = await getResources(initialFilters);
            setResources(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchResources(true);
    }, [type, branch, subject, year]);

    const filteredResources = useMemo(() => {
        let result = [...resources];
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.title.toLowerCase().includes(lowerQuery) ||
                r.subject.toLowerCase().includes(lowerQuery)
            );
        }
        if (selectedYear) {
            result = result.filter(r => r.year === selectedYear);
        }
        if (selectedBranch) {
            result = result.filter(r => r.branch === selectedBranch);
        }
        if (selectedSubject) {
            result = result.filter(r => r.subject === selectedSubject);
        }
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return result;
    }, [resources, searchQuery, selectedYear, selectedBranch, selectedSubject]);

    const renderItem = useCallback(({ item, index }: { item: Resource, index: number }) => {
        return <ResourceCard item={item} index={index} theme={theme} fadeAnim={fadeAnim} />;
    }, [theme, fadeAnim]);

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#F3F4F6' }]}>
            <LinearGradient
                colors={theme === 'dark' ? ['#7f1d1d', '#1e1e1e'] : ['#f59e0b', '#ef4444']}
                style={styles.headerGradient}
            >
                <Navbar title="Resources" />

                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)' }]}>
                        <Text style={[styles.searchIcon, { color: '#fff' }]}>🔍</Text>
                        <TextInput
                            style={[styles.searchInput, { color: '#fff' }]}
                            placeholder="Search resources..."
                            placeholderTextColor="rgba(255,255,255,0.7)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.filterButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Text style={styles.filterIcon}>🌪️</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {loading && !refreshing ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={filteredResources}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366f1']} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>📂</Text>
                                <Text style={[styles.emptyText, { color: theme === 'dark' ? '#AAA' : '#666' }]}>
                                    No resources match your search.
                                </Text>
                            </View>
                        }
                    />
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFF' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme === 'dark' ? '#FFF' : '#333' }]}>Filter Resources</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Text style={[styles.closeButton, { color: theme === 'dark' ? '#AAA' : '#666' }]}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.filterLabel, { color: theme === 'dark' ? '#FFF' : '#333' }]}>Year</Text>
                        <View style={styles.filterOptions}>
                            {[1, 2, 3, 4].map((y) => (
                                <TouchableOpacity
                                    key={y}
                                    style={[
                                        styles.filterOption,
                                        selectedYear === y && styles.filterOptionActive,
                                        { backgroundColor: selectedYear === y ? '#6C63FF' : (theme === 'dark' ? '#2C2C2C' : '#F3F4F6') }
                                    ]}
                                    onPress={() => setSelectedYear(selectedYear === y ? null : y)}
                                >
                                    <Text style={[
                                        styles.filterOptionText,
                                        selectedYear === y && styles.filterOptionTextActive,
                                        { color: selectedYear === y ? '#FFF' : (theme === 'dark' ? '#FFF' : '#333') }
                                    ]}>{y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'} Year</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={() => {
                                    setSelectedYear(null);
                                    setSelectedBranch(null);
                                    setSelectedSubject(null);
                                    setSearchQuery('');
                                    setFilterModalVisible(false);
                                }}
                            >
                                <Text style={styles.resetButtonText}>Reset All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.applyButton}
                                onPress={() => setFilterModalVisible(false)}
                            >
                                <Text style={styles.applyButtonText}>Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerGradient: {
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 8,
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        height: 50,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    searchIcon: { fontSize: 18, marginRight: 12 },
    searchInput: { flex: 1, fontSize: 16, height: '100%' },
    filterButton: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    filterIcon: { fontSize: 24 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 20, paddingTop: 20, paddingBottom: 100 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.5 },
    emptyText: { fontSize: 16, textAlign: 'center', opacity: 0.7 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700' },
    closeButton: { fontSize: 24, fontWeight: '600' },
    filterLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
    filterOptions: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
    filterOption: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10, marginBottom: 10 },
    filterOptionActive: {},
    filterOptionText: { fontSize: 14, fontWeight: '500' },
    filterOptionTextActive: { fontWeight: '700' },
    modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto' },
    resetButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
    resetButtonText: { color: '#666', fontWeight: '600' },
    applyButton: { backgroundColor: '#6C63FF', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 },
    applyButtonText: { color: '#FFF', fontWeight: '700' },
});

export default ResourceListScreen;

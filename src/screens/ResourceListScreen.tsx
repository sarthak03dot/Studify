import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, Animated, TextInput, Modal } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getResources } from '../services/resource.service';
import { Resource } from '../types/resource';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

const ResourceListScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { theme } = useTheme();
    // Default to 'all' if no params provided (e.g. from tab bar)
    const { type = 'all', branch, subject, year } = (route.params || {}) as { type?: string, branch?: string, subject?: string, year?: number };

    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const [selectedYear, setSelectedYear] = useState<number | null>(year || null);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(branch || null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(subject || null);

    // Animation for loading indicator
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

    const fetchResources = async () => {
        try {
            setLoading(true);
            // If type is 'all', we might want to fetch everything without specific filters initially, 
            // or pass the current selected filters if we were doing server-side filtering.
            // For now, let's fetch based on initial params (or all) and do client-side filtering as requested for immediate feedback.
            // If the user navigated with specific params (e.g. from Dashboard), we respect those initially.
            // If type is 'all', we pass empty object to get everything.

            const initialFilters = type === 'all' ? {} : { type, branch, subject, year };
            const data = await getResources(initialFilters);
            setResources(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openResource = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    // Derived state for filtered resources
    const filteredResources = useMemo(() => {
        let result = [...resources];

        // 1. Search Query (Title or Subject)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.title.toLowerCase().includes(lowerQuery) ||
                r.subject.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Filters
        if (selectedYear) {
            result = result.filter(r => r.year === selectedYear);
        }
        if (selectedBranch) {
            result = result.filter(r => r.branch === selectedBranch);
        }
        if (selectedSubject) {
            result = result.filter(r => r.subject === selectedSubject);
        }

        // 3. Sort by Date (Latest to Oldest)
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return result;
    }, [resources, searchQuery, selectedYear, selectedBranch, selectedSubject]);

    const renderItem = ({ item, index }: { item: Resource, index: number }) => {
        // Animation for scale on press
        const scaleAnim = new Animated.Value(1);

        const onPressIn = () => {
            Animated.spring(scaleAnim, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        };

        const onPressOut = () => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        };

        return (
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [
                        {
                            translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [50 * Math.min(index + 1, 5), 0]
                            })
                        },
                        { scale: scaleAnim }
                    ]
                }}
            >
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF', shadowColor: theme === 'dark' ? '#000' : '#ccc' }]}
                    onPress={() => openResource(item.fileUrl)}
                    activeOpacity={1}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                >
                    <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: theme === 'dark' ? '#FFF' : '#333' }]}>{item.title}</Text>
                            <Text style={[styles.subject, { color: theme === 'dark' ? '#AAA' : '#666' }]}>
                                {item.subject} • {item.year === 1 ? '1st' : item.year === 2 ? '2nd' : item.year === 3 ? '3rd' : '4th'} Year
                            </Text>
                        </View>
                        <View style={[styles.typeBadge, { backgroundColor: '#E0E7FF' }]}>
                            <Text style={[styles.typeText, { color: '#4F46E5' }]}>{item.type.toUpperCase()}</Text>
                        </View>
                    </View>

                    <Text style={[styles.description, { color: theme === 'dark' ? '#BBB' : '#555' }]} numberOfLines={2}>
                        {item.description}
                    </Text>

                    <View style={styles.footer}>
                        <View style={styles.userInfo}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{item.uploadedBy?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                            </View>
                            <Text style={[styles.author, { color: theme === 'dark' ? '#888' : '#666' }]}>
                                {item.uploadedBy?.name || 'Unknown'}
                            </Text>
                        </View>
                        <Text style={[styles.date, { color: theme === 'dark' ? '#888' : '#999' }]}>
                            {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#F3F4F6' }]}>
            <Navbar title="Resources" />

            <View style={[styles.searchContainer, { backgroundColor: theme === 'dark' ? '#121212' : '#F3F4F6' }]}>
                <View style={[styles.searchBar, { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFF' }]}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={[styles.searchInput, { color: theme === 'dark' ? '#FFF' : '#333' }]}
                        placeholder="Search resources..."
                        placeholderTextColor={theme === 'dark' ? '#666' : '#999'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={[styles.filterButton, { backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFF' }]}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Text style={styles.filterIcon}>🌪️</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                </View>
            ) : (
                <FlatList
                    data={filteredResources}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyIcon}>📂</Text>
                            <Text style={[styles.emptyText, { color: theme === 'dark' ? '#AAA' : '#666' }]}>
                                No resources match your search.
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Filter Modal */}
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
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 8,
        paddingTop: 8,
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    filterIcon: {
        fontSize: 22,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subject: {
        fontSize: 14,
        fontWeight: '500',
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 12,
    },
    typeText: {
        fontSize: 10,
        fontWeight: '800',
    },
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    author: {
        fontSize: 12,
        fontWeight: '500',
    },
    date: {
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.7,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        fontSize: 24,
        fontWeight: '600',
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    filterOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    filterOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
    },
    filterOptionActive: {
        // Handled dynamically
    },
    filterOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    filterOptionTextActive: {
        fontWeight: '700',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    resetButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    resetButtonText: {
        color: '#666',
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: '#6C63FF',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    applyButtonText: {
        color: '#FFF',
        fontWeight: '700',
    },
});

export default ResourceListScreen;

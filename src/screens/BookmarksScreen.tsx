import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useBookmarks } from '../context/BookmarkContext';
import Navbar from '../components/Navbar';
import ResourceCard from '../components/ResourceCard';
import { Animated } from 'react-native';

const BookmarksScreen = () => {
    const { theme } = useTheme();
    const { bookmarkedResources } = useBookmarks();
    const navigation = useNavigation();

    const fadeAnim = new Animated.Value(1);

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <ResourceCard item={item} index={index} theme={theme} fadeAnim={fadeAnim} />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#121212' : '#F3F4F6' }]}>
            <LinearGradient
                colors={theme === 'dark' ? ['#7f1d1d', '#1e1e1e'] : ['#f59e0b', '#ef4444']}
                style={styles.headerGradient}
            >
                <Navbar title="Saved Resources" showBack />
            </LinearGradient>

            <FlatList
                data={bookmarkedResources}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🔖</Text>
                        <Text style={[styles.emptyText, { color: theme === 'dark' ? '#AAA' : '#666' }]}>
                            You have no saved resources yet.
                        </Text>
                    </View>
                }
            />
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
    },
    listContent: { padding: 20, paddingTop: 20, paddingBottom: 100 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
    emptyText: { fontSize: 16, textAlign: 'center', opacity: 0.7 },
});

export default BookmarksScreen;

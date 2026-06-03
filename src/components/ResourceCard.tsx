import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Linking } from 'react-native';
import { Resource } from '../types/resource';
import { useBookmarks } from '../context/BookmarkContext';
import { Bookmark } from 'lucide-react-native';

interface ResourceCardProps {
    item: Resource;
    index: number;
    theme: string;
    fadeAnim: Animated.Value;
}

const ResourceCard = ({ item, index, theme, fadeAnim }: ResourceCardProps) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const { toggleBookmark, isBookmarked } = useBookmarks();

    const openResource = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

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
                style={[
                    styles.card,
                    {
                        backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                        borderColor: theme === 'dark' ? '#333' : 'rgba(0,0,0,0.05)',
                    }
                ]}
                onPress={() => openResource(item.fileUrl)}
                activeOpacity={0.9}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: theme === 'dark' ? '#FFF' : '#1f2937' }]}>{item.title}</Text>
                        <Text style={[styles.subject, { color: theme === 'dark' ? '#AAA' : '#6b7280' }]}>
                            {item.subject} • {item.year === 1 ? '1st' : item.year === 2 ? '2nd' : item.year === 3 ? '3rd' : '4th'} Year
                        </Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <TouchableOpacity 
                            onPress={() => toggleBookmark(item)} 
                            style={{marginRight: 8}}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Bookmark size={20} color={isBookmarked(item._id) ? '#ef4444' : (theme === 'dark' ? '#fff' : '#64748b')} fill={isBookmarked(item._id) ? '#ef4444' : 'transparent'} />
                        </TouchableOpacity>
                        <View style={[styles.typeBadge, {
                            backgroundColor: item.type === 'note' ? '#dbeafe' : item.type === 'syllabus' ? '#fce7f3' : '#ffedd5'
                        }]}>
                            <Text style={[styles.typeText, {
                                color: item.type === 'note' ? '#1d4ed8' : item.type === 'syllabus' ? '#be185d' : '#c2410c'
                            }]}>{item.type.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.description, { color: theme === 'dark' ? '#BBB' : '#4b5563' }]} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={[styles.footer, { borderTopColor: theme === 'dark' ? '#333' : '#f3f4f6' }]}>
                    <View style={styles.userInfo}>
                        <View style={[styles.avatar, { backgroundColor: theme === 'dark' ? '#333' : '#e5e7eb' }]}>
                            <Text style={[styles.avatarText, { color: theme === 'dark' ? '#fff' : '#374151' }]}>
                                {item.uploadedBy?.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <Text style={[styles.author, { color: theme === 'dark' ? '#888' : '#6b7280' }]}>
                            {item.uploadedBy?.name || 'Unknown'}
                        </Text>
                    </View>
                    <Text style={[styles.date, { color: theme === 'dark' ? '#666' : '#9ca3af' }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
        lineHeight: 24,
    },
    subject: {
        fontSize: 13,
        fontWeight: '600',
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 12,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    author: {
        fontSize: 13,
        fontWeight: '500',
    },
    date: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default React.memo(ResourceCard);

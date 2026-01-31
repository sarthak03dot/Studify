import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Trash2, Edit, ExternalLink, FileText, Book } from 'lucide-react-native';

import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';
import { useResources } from '../hooks/useResources';
import { deleteResource } from '../services/resource.service';
import { theme as appTheme } from '../theme/theme';
import { Card } from '../components/ui/Card';

export default function MyResourcesScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { theme } = useTheme();
    const { showAlert, showConfirm } = useAlert();
    const isDark = theme === 'dark';
    const colors = appTheme[isDark ? 'dark' : 'light'].colors;

    const { data: resources, isLoading, refetch } = useResources({ uploadedBy: user?.id });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm({
            title: "Delete Resource",
            message: "Are you sure you want to delete this resource? This action cannot be undone.",
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (confirmed) {
            try {
                await deleteResource(id);
                showAlert({ title: "Success", message: "Resource deleted!", type: 'success' });
                refetch();
            } catch (error: any) {
                showAlert({ title: "Error", message: error.message || "Failed to delete resource", type: 'error' });
            }
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <Card style={styles.resourceCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: item.type === 'note' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(236, 72, 153, 0.1)' }]}>
                    {item.type === 'note' ? <FileText size={20} color="#6366f1" /> : <Book size={20} color="#ec4899" />}
                </View>
                <View style={styles.headerInfo}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.subject, { color: colors.textSecondary }]}>{item.subject} • Year {item.year}</Text>
                </View>
            </View>

            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description || "No description provided."}
            </Text>

            <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]} />

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => Linking.openURL(item.fileUrl)}
                >
                    <ExternalLink size={18} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>View</Text>
                </TouchableOpacity>

                <View style={styles.rightActions}>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => navigation.navigate('UploadResource', { resource: item })}
                    >
                        <Edit size={18} color="#10b981" />
                        <Text style={[styles.actionText, { color: "#10b981" }]}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDelete(item._id)}
                    >
                        <Trash2 size={18} color="#ef4444" />
                        <Text style={[styles.actionText, { color: "#ef4444" }]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Navbar title="My Uploads" showBack />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={resources}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyView}>
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>You haven't uploaded any resources yet.</Text>
                            <TouchableOpacity
                                style={[styles.uploadLink, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate('UploadResource')}
                            >
                                <Text style={styles.uploadLinkText}>Upload Now</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    resourceCard: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    subject: {
        fontSize: 12,
        marginTop: 2,
    },
    description: {
        fontSize: 13,
        marginBottom: 16,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rightActions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    emptyView: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
    },
    uploadLink: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    uploadLinkText: {
        color: '#fff',
        fontWeight: '700',
    }
});


import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function SettingsScreen() {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const isDark = theme === 'dark';

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f3f4f6' }]}>
            <Navbar title="Settings" />
            <ScrollView contentContainerStyle={styles.content}>

                <View style={[styles.section, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#aaa' : '#6b7280' }]}>Preferences</Text>

                    <View style={styles.row}>
                        <View style={styles.rowInfo}>
                            <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#1f2937' }]}>Dark Mode</Text>
                            <Text style={[styles.rowSubtitle, { color: isDark ? '#888' : '#9ca3af' }]}>
                                {isDark ? 'On' : 'Off'}
                            </Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: '#4f46e5' }}
                            thumbColor={'#fff'}
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#e5e7eb' }]} />

                    <TouchableOpacity style={styles.row}>
                        <View style={styles.rowInfo}>
                            <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#1f2937' }]}>Notifications</Text>
                            <Text style={[styles.rowSubtitle, { color: isDark ? '#888' : '#9ca3af' }]}>
                                Manage push notifications
                            </Text>
                        </View>
                        <Text style={[styles.arrow, { color: isDark ? '#666' : '#ccc' }]}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.section, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#aaa' : '#6b7280' }]}>Legal</Text>

                    <View style={styles.infoBlock}>
                        <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#1f2937' }]}>Terms and Conditions</Text>
                        <Text style={[styles.infoText, { color: isDark ? '#ccc' : '#4b5563' }]}>
                            By using this application, you agree to comply with and be bound by the following terms and conditions.
                            Users are responsible for ensuring that any content uploaded (such as notes and resources) respects copyright laws.
                            We reserve the right to remove any content that violates these terms.
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#e5e7eb' }]} />

                    <View style={styles.infoBlock}>
                        <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#1f2937' }]}>Privacy Policy</Text>
                        <Text style={[styles.infoText, { color: isDark ? '#ccc' : '#4b5563' }]}>
                            We respect your privacy. Your personal information, such as your email and profile details, is stored securely
                            and is not shared with third parties without your consent.
                        </Text>
                    </View>
                </View>

                <View style={[styles.section, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#aaa' : '#6b7280' }]}>Application Details</Text>

                    <View style={styles.row}>
                        <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#1f2937' }]}>Version</Text>
                        <Text style={[styles.rowValue, { color: isDark ? '#888' : '#6b7280' }]}>1.0.0</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#e5e7eb' }]} />

                    <View style={styles.row}>
                        <Text style={[styles.rowTitle, { color: isDark ? '#fff' : '#1f2937' }]}>Build</Text>
                        <Text style={[styles.rowValue, { color: isDark ? '#888' : '#6b7280' }]}>2024.01.30</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 100, // Space for bottom bar
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
        borderRadius: 12,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: '600',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    rowInfo: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    rowSubtitle: {
        fontSize: 12,
    },
    rowValue: {
        fontSize: 16,
    },
    arrow: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    infoBlock: {
        marginVertical: 8,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
    }
});

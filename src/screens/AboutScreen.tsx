
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

export default function AboutScreen() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f3f4f6' }]}>
            <Navbar title="About" />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.headerContainer}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={[styles.appName, { color: isDark ? '#fff' : '#1f2937' }]}>Studify</Text>
                    <Text style={[styles.version, { color: isDark ? '#888' : '#6b7280' }]}>Version 1.0.0</Text>
                </View>

                <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.title, { color: isDark ? '#fff' : '#1f2937' }]}>About Us</Text>
                    <Text style={[styles.text, { color: isDark ? '#ccc' : '#4b5563' }]}>
                        Studify is a community-driven platform designed to help students share notes,
                        access resources, and succeed in their academic journey.
                        Our mission is to make education accessible and collaborative for everyone.
                    </Text>

                    <Text style={[styles.text, { color: isDark ? '#ccc' : '#4b5563', marginTop: 12 }]}>
                        Built with ❤️ by the Studify Team.
                    </Text>
                </View>

                <View style={[styles.card, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                    <Text style={[styles.title, { color: isDark ? '#fff' : '#1f2937' }]}>Contact & Support</Text>
                    <Text style={[styles.text, { color: isDark ? '#ccc' : '#4b5563' }]}>
                        Have questions or feedback? Reach out to us at:
                    </Text>
                    <Text style={[styles.link, { color: '#4f46e5' }]}>support@studify.app</Text>
                </View>

                <Text style={[styles.footer, { color: isDark ? '#666' : '#9ca3af' }]}>
                    © 2024 Studify Inc. All rights reserved.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        alignItems: 'center',
        paddingBottom: 100,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    logoImage: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    version: {
        fontSize: 16,
    },
    card: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
    },
    link: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 8,
    },
    footer: {
        fontSize: 12,
        marginTop: 20,
    }
});

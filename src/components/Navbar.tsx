import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TouchableWithoutFeedback,
    Modal,
    Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavbarProps {
    title?: string;
}

export default function Navbar({ title = "Studify" }: NavbarProps) {
    const { user, logout } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigation = useNavigation();
    const [open, setOpen] = useState(false);
    const insets = useSafeAreaInsets();

    const handleLogout = () => {
        setOpen(false);
        logout();
        // @ts-ignore
        navigation.navigate("Login");
    };

    const containerStyle = {
        backgroundColor: isDark ? '#1e1e1e' : '#fff',
        shadowColor: isDark ? '#000' : '#000',
        paddingTop: Math.max(insets.top, 20),
    };

    const textStyle = {
        color: isDark ? '#fff' : '#1f2937',
    };

    const dropdownStyle = {
        backgroundColor: isDark ? '#2d2d2d' : '#fff',
    };

    const menuItemTextStyle = {
        color: isDark ? '#ccc' : '#374151',
    };

    const dividerStyle = {
        backgroundColor: isDark ? '#444' : '#f3f4f6',
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.content}>
                <View style={styles.brandContainer}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={[styles.logo, textStyle]}>{title}</Text>
                </View>

                {user ? (
                    <TouchableOpacity
                        style={[styles.avatarContainer, { backgroundColor: isDark ? '#2d2d2d' : '#fff' }]}
                        onPress={() => setOpen(true)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(user?.name || "U").charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.loginButton, { borderColor: '#4f46e5', borderWidth: 1 }]}
                        // @ts-ignore
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={{ color: '#4f46e5', fontWeight: 'bold' }}>Sign In</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Modal
                transparent={true}
                visible={open}
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <TouchableWithoutFeedback onPress={() => setOpen(false)}>
                    <View style={[styles.modalOverlay, { paddingTop: insets.top + 60 }]}>
                        <TouchableWithoutFeedback>
                            <View style={[styles.dropdown, dropdownStyle]}>
                                <View style={styles.userInfo}>
                                    <View style={[styles.avatar, styles.largeAvatar]}>
                                        <Text style={[styles.avatarText, styles.largeAvatarText]}>
                                            {(user?.name || "U").charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.userName, textStyle]} numberOfLines={1}>{user?.name}</Text>
                                        <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
                                    </View>
                                </View>

                                <View style={[styles.divider, dividerStyle]} />

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        setOpen(false);
                                        // @ts-ignore
                                        navigation.navigate("Profile");
                                    }}
                                >
                                    <Text style={styles.menuIcon}>👤</Text>
                                    <Text style={[styles.menuText, menuItemTextStyle]}>My Profile</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={handleLogout}
                                >
                                    <Text style={styles.menuIcon}>🚪</Text>
                                    <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        paddingBottom: 16,
        paddingHorizontal: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 100,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoImage: {
        width: 64,
        height: 64,
        marginRight: 2,
    },
    logoIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    logo: {
        color: "#1f2937",
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: -0.5,
    },
    avatarContainer: {
        padding: 4,
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#4f46e5",
        alignItems: "center",
        justifyContent: "center",
    },
    loginButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    avatarText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingRight: 24,
    },
    dropdown: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        width: 250,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    largeAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    largeAvatarText: {
        fontSize: 20,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
    },
    userEmail: {
        fontSize: 12,
        color: '#6b7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    menuIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
    },
    logoutText: {
        color: '#ef4444',
    },
});

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { Edit3, User as UserIcon, Mail, BookOpen, AlignLeft, Github, Code, Terminal } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { useUpdateProfile } from "../hooks/useUser";
import { useAlert } from "../context/AlertContext";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import Navbar from "../components/Navbar";

export default function EditProfileScreen() {
    const navigation = useNavigation();
    const { user, updateUser } = useAuth();
    const { showAlert } = useAlert();
    const updateProfileMutation = useUpdateProfile();

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [college, setCollege] = useState(user?.college || "");
    const [github, setGithub] = useState(user?.socialHandles?.github || "");
    const [leetcode, setLeetcode] = useState(user?.socialHandles?.leetcode || "");
    const [codeforces, setCodeforces] = useState(user?.socialHandles?.codeforces || "");

    const handleSave = async () => {
        if (!name.trim()) {
            showAlert({ title: "Error", message: "Name cannot be empty", type: "error" });
            return;
        }

        try {
            const updatedUser = await updateProfileMutation.mutateAsync({
                name, bio, college,
                socialHandles: { github, leetcode, codeforces }
            });
            updateUser(updatedUser);
            showAlert({ title: "Success", message: "Profile updated successfully!", type: "success" });
            navigation.goBack();
        } catch (error: any) {
            showAlert({
                title: "Error",
                message: error.response?.data?.message || "Failed to update profile",
                type: "error"
            });
        }
    };

    return (
        <View style={styles.container}>
            <Navbar title="Edit Profile" showBack />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={['#6366f1', '#8b5cf6']}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                        </LinearGradient>
                        <TouchableOpacity style={styles.editAvatarBtn}>
                            <Edit3 size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.headerTitle}>Public Profile</Text>
                    <Text style={styles.headerSubtitle}>Manage your account information</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        icon={<UserIcon size={20} color="#94a3b8" />}
                    />

                    <Input
                        label="Email Address"
                        value={email}
                        editable={false}
                        placeholder="Your email"
                        icon={<Mail size={20} color="#94a3b8" />}
                    />
                    <Text style={[styles.infoText, { marginBottom: 20 }]}>Email cannot be changed currently.</Text>

                    <Input
                        label="College/University"
                        value={college}
                        onChangeText={setCollege}
                        placeholder="e.g. IIT Delhi"
                        icon={<BookOpen size={20} color="#94a3b8" />}
                    />

                    <Input
                        label="Bio"
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Tell us about yourself..."
                        multiline
                        numberOfLines={4}
                        icon={<AlignLeft size={20} color="#94a3b8" />}
                    />

                    <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 16 }]}>External Platforms</Text>

                    <Input
                        label="GitHub Username"
                        value={github}
                        onChangeText={setGithub}
                        placeholder="e.g. sarthak-py"
                        icon={<Github size={20} color="#94a3b8" />}
                    />

                    <Input
                        label="LeetCode Username"
                        value={leetcode}
                        onChangeText={setLeetcode}
                        placeholder="e.g. sarthak_007"
                        icon={<Terminal size={20} color="#94a3b8" />}
                    />

                    <Input
                        label="Codeforces Handle"
                        value={codeforces}
                        onChangeText={setCodeforces}
                        placeholder="e.g. tourist"
                        icon={<Code size={20} color="#94a3b8" />}
                    />
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Save Changes"
                        onPress={handleSave}
                        loading={updateProfileMutation.isPending}
                        variant="primary"
                        style={styles.saveBtn}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 40,
        fontWeight: "800",
        color: "#fff",
    },
    editAvatarBtn: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#4f46e5",
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 3,
        borderColor: "#fff",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1e293b",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748b",
    },
    form: {
        marginBottom: 32,
    },
    infoText: {
        fontSize: 12,
        color: "#94a3b8",
        marginTop: -12,
        marginLeft: 4,
        fontStyle: "italic",
    },
    footer: {
        marginTop: 16,
    },
    saveBtn: {
        height: 56,
        borderRadius: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1e293b",
    }
});

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <TouchableOpacity onPress={toggleTheme} style={styles.button}>
            <Text style={styles.text}>
                {theme === "light" ? "🌙" : "☀️"}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 8,
    },
    text: {
        fontSize: 20,
    },
});

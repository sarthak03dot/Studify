import React, { ReactNode } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ViewStyle,
    TextInputProps,
    TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { theme as AppTheme } from '../../theme/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: ReactNode;
    containerStyle?: ViewStyle;
    glass?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    containerStyle,
    style,
    glass,
    ...props
}) => {
    const { theme } = useTheme();
    const currentTheme = AppTheme[theme as 'light' | 'dark'] || AppTheme.light;
    const colors = currentTheme.colors;

    const inputBackgroundColor = glass
        ? (theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)')
        : colors.background;

    const inputBorderColor = glass
        ? (error ? colors.error : 'rgba(255,255,255,0.3)')
        : (error ? colors.error : colors.border);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: glass ? (theme === 'dark' ? '#cbd5e1' : '#4b5563') : colors.textSecondary }]}>
                    {label}
                </Text>
            )}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: inputBackgroundColor,
                        borderColor: inputBorderColor,
                        shadowColor: colors.text,
                    },
                ]}
            >
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        { color: glass ? (theme === 'dark' ? '#fff' : '#1e293b') : colors.text },
                        style,
                    ]}
                    placeholderTextColor={glass ? (theme === 'dark' ? '#94a3b8' : '#64748b') : colors.textSecondary}
                    {...props}
                />
            </View>
            {error && (
                <Text style={[styles.error, { color: colors.error }]}>
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        height: 56,
        paddingHorizontal: 16,
        overflow: 'hidden',
    },
    iconContainer: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    error: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

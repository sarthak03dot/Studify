import React from 'react';
import { View, StyleSheet, ViewStyle, ViewProps, StyleProp } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { theme as AppTheme } from '../../theme/theme';

interface CardProps extends ViewProps {
    style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({ children, style, ...props }) => {
    const { theme } = useTheme();
    const currentTheme = AppTheme[theme as 'light' | 'dark'] || AppTheme.light;
    const colors = currentTheme.colors;
    const shadows = currentTheme.shadows;

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.surface,
                    ...shadows.soft
                },
                style,
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 24,
    },
});

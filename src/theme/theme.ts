export const theme = {
    light: {
        name: 'light',
        colors: {
            primary: '#6366f1', // Indigo 500
            secondary: '#a855f7', // Purple 500
            tertiary: '#ec4899', // Pink 500
            background: '#f3f4f6', // Cool Gray 100
            backgroundSecondary: '#ffffff',
            surface: '#ffffff',
            text: '#111827', // Gray 900
            textSecondary: '#6b7280', // Gray 500
            border: '#e5e7eb', // Gray 200
            error: '#ef4444',
            success: '#10b981',
            overlay: 'rgba(255, 255, 255, 0.85)',
        },
        gradients: {
            primary: ['#6366f1', '#8b5cf6'], // Indigo -> Violet
            secondary: ['#ec4899', '#8b5cf6'], // Pink -> Violet
            surface: ['#ffffff', '#f8fafc'],
            fire: ['#f59e0b', '#ef4444'], // Amber -> Red
        },
        shadows: {
            soft: {
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
            },
            medium: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 20,
                elevation: 8,
            },
            glow: {
                shadowColor: "#6366f1",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 10,
            }
        },
        spacing: {
            xs: 4,
            s: 8,
            m: 16,
            l: 24,
            xl: 32,
        },
        borderRadius: {
            s: 8,
            m: 16,
            l: 24,
            xl: 32,
        }
    },
    dark: {
        name: 'dark',
        colors: {
            primary: '#818cf8', // Indigo 400
            secondary: '#c084fc', // Purple 400
            tertiary: '#f472b6', // Pink 400
            background: '#0f172a', // Slate 900
            backgroundSecondary: '#1e293b', // Slate 800
            surface: '#1e293b',
            text: '#f8fafc', // Slate 50
            textSecondary: '#94a3b8', // Slate 400
            border: '#334155', // Slate 700
            error: '#f87171',
            success: '#34d399',
            overlay: 'rgba(15, 23, 42, 0.85)',
        },
        gradients: {
            primary: ['#4f46e5', '#7c3aed'], // Indigo -> Violet (Darker)
            secondary: ['#db2777', '#7c3aed'],
            surface: ['#1e293b', '#0f172a'],
            fire: ['#d97706', '#dc2626'],
        },
        shadows: {
            soft: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
            },
            medium: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.5,
                shadowRadius: 24,
                elevation: 10,
            },
            glow: {
                shadowColor: "#818cf8",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: 8,
            }
        },
        spacing: {
            xs: 4,
            s: 8,
            m: 16,
            l: 24,
            xl: 32,
        },
        borderRadius: {
            s: 8,
            m: 16,
            l: 24,
            xl: 32,
        }
    }
};

export type ThemeType = typeof theme.light;

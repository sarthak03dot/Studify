import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const ThemeSync = () => {
    const { user } = useAuth();
    const { setTheme } = useTheme();

    useEffect(() => {
        if (user && user.theme) {
            setTheme(user.theme as 'light' | 'dark');
        }
    }, [user]);

    return null;
};

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from 'axios';
import { AppState, AppStateStatus } from "react-native";
import { User, AuthResponse } from "../types/auth";
import apiClient from "../utils/api";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// using apiClient for requests
// const API_URL = "https://studify-backend-15ig.onrender.com/api/auth";

const INACTIVITY_LIMIT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const appState = useRef(AppState.currentState);

    const logout = useCallback(async () => {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("last_active_timestamp");
        setUser(null);
    }, []);

    const checkInactivity = useCallback(async () => {
        try {
            const lastActive = await AsyncStorage.getItem("last_active_timestamp");
            if (lastActive) {
                const lastActiveTime = parseInt(lastActive, 10);
                const now = Date.now();
                if (now - lastActiveTime > INACTIVITY_LIMIT_MS) {
                    console.log("User inactive for too long, logging out...");
                    await logout();
                }
            }
        } catch (error) {
            console.error("Error checking inactivity", error);
        }
    }, [logout]);

    const handleAppStateChange = useCallback(async (nextAppState: AppStateStatus) => {
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === "active"
        ) {
            // App has come to the foreground
            await checkInactivity();
        } else if (nextAppState.match(/inactive|background/)) {
            // App is going to the background
            await AsyncStorage.setItem("last_active_timestamp", Date.now().toString());
        }

        appState.current = nextAppState;
    }, [checkInactivity]);

    const checkLoginStatus = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                // Determine if we should validate via API or just trust token
                // Trusting token for speed, but ideally we check validity
                // Let's try to fetch profile to validate
                apiClient.defaults.headers.common.Authorization = `Bearer ${token}`; // Ensure header is set if using shared instance
                const res = await apiClient.get('/auth/profile');
                setUser(res as any);
            }
        } catch (error) {
            console.log("Token invalid or expired", error);
            await AsyncStorage.removeItem("token");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await apiClient.post<AuthResponse>('/auth/login', {
            email,
            password,
        });

        const data = res as any;
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("last_active_timestamp", Date.now().toString());
        setUser(data.user);
    }, []);

    const register = useCallback(async (name: string, email: string, password: string) => {
        const res = await apiClient.post<AuthResponse>('/auth/register', {
            name,
            email,
            password,
        });

        const data = res as any;
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("last_active_timestamp", Date.now().toString());
        setUser(data.user);
    }, []);

    const updateUser = useCallback((userData: User) => {
        setUser(userData);
    }, []);

    useEffect(() => {
        checkLoginStatus();

        const subscription = AppState.addEventListener("change", handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, [checkLoginStatus, handleAppStateChange]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

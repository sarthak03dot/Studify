import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import DashboardScreen from "../screens/DashboardScreen";
// import ProfileScreen from "../screens/ProfileScreen";
import ResourceListScreen from "../screens/ResourceListScreen";
import UploadResourceScreen from "../screens/UploadResourceScreen";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { useAuth } from "../context/AuthContext";

import TabNavigator from "./TabNavigator";

export type AppStackParamList = {
    TabNavigator: undefined;
    Dashboard: undefined;
    Profile: undefined; // Accessible via tabs, but keeping for type safety if direct nav needed
    ResourceList: { type?: string; branch?: string; subject?: string; year?: number };
    UploadResource: undefined;
    Login: undefined;
    Register: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                animation: 'slide_from_right',
                animationDuration: 400,
                headerShown: false // Default to false, override where needed
            }}
        >
            {user ? (
                <>
                    <Stack.Screen
                        name="TabNavigator"
                        component={TabNavigator}
                    />
                    <Stack.Screen
                        name="ResourceList"
                        component={ResourceListScreen}
                        options={{
                            headerShown: false,
                            title: 'Resources'
                        }}
                    />
                    <Stack.Screen
                        name="UploadResource"
                        component={UploadResourceScreen}
                        options={{
                            headerShown: false,
                            title: 'Upload Resource',
                            animation: 'slide_from_bottom', // Modal-like feel for upload
                            presentation: 'modal' // Optional: native modal presentation
                        }}
                    />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                </>
            )}
        </Stack.Navigator>
    );
}

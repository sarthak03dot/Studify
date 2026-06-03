import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import DashboardScreen from "../screens/DashboardScreen";
// import ProfileScreen from "../screens/ProfileScreen";
import ResourceListScreen from "../screens/ResourceListScreen";
import UploadResourceScreen from "../screens/UploadResourceScreen";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import MyResourcesScreen from "../screens/MyResourcesScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import GlobalStatsScreen from "../screens/GlobalStatsScreen";
import BookmarksScreen from "../screens/BookmarksScreen";
import { useAuth } from "../context/AuthContext";

import TabNavigator from "./TabNavigator";

export type AppStackParamList = {
    TabNavigator: undefined;
    Dashboard: undefined;
    Profile: undefined; // Accessible via tabs, but keeping for type safety if direct nav needed
    ResourceList: { type?: string; branch?: string; subject?: string; year?: number };
    UploadResource: { resource?: any };
    Login: undefined;
    Register: undefined;
    ChangePassword: undefined;
    MyResources: undefined;
    EditProfile: undefined;
    GlobalStats: undefined;
    Bookmarks: undefined;
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
                    <Stack.Screen
                        name="ChangePassword"
                        component={ChangePasswordScreen}
                    />
                    <Stack.Screen
                        name="MyResources"
                        component={MyResourcesScreen}
                    />
                    <Stack.Screen
                        name="EditProfile"
                        component={EditProfileScreen}
                    />
                    <Stack.Screen
                        name="GlobalStats"
                        component={GlobalStatsScreen}
                    />
                    <Stack.Screen
                        name="Bookmarks"
                        component={BookmarksScreen}
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

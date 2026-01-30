
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ResourceListScreen from '../screens/ResourceListScreen';
import UploadResourceScreen from '../screens/UploadResourceScreen'; // We might use this for the FAB action
import CurvedBottomBar from '../components/CurvedBottomBar';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

// Placeholder screens
const FavoritesScreen = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' }}>
        <Text>Favorites (Coming Soon)</Text>
    </View>
);

// We won't actually navigate to this, but we need it in the navigator to render the button
const UploadPlaceholder = () => null;

export default function TabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CurvedBottomBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
            }}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen
                name="Resources"
                component={ResourceListScreen}
                initialParams={{ type: 'all' }}
            />
            <Tab.Screen
                name="UploadPlaceholder"
                component={UploadPlaceholder}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('UploadResource');
                    },
                })}
            />
            <Tab.Screen name="About" component={AboutScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

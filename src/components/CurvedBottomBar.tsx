
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, ResourcesIcon, AboutIcon, ProfileIcon, PlusIcon } from './TabIcons';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 80;

export default function CurvedBottomBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    // Path for the curved shape
    // This creates a convex curve (bulging up) in the center for the FAB
    const tabRadius = 48; // Radius of the cutout
    const center = width / 2;

    // Custom path for a "bulge out" curve or a "dip" depending on design.
    // The reference image appears to have a "dip" then a "bulge" for the button? 
    // Usually these designs have a "notch" or a "floating" look.
    // Let's go with a classic "notch" style where the curve dips DOWN to accommodate a floating button,
    // OR a curve that goes UP.
    // Re-reading user request "add below somthing like this" - image shows a red bar with a cutout or curve.
    // Let's implement a smooth curve.

    const d = `
    M0,0
    L${center - tabRadius * 2},0
    C${center - tabRadius},0 ${center - tabRadius},${tabRadius} ${center},${tabRadius}
    C${center + tabRadius},${tabRadius} ${center + tabRadius},0 ${center + tabRadius * 2},0
    L${width},0
    L${width},${TAB_BAR_HEIGHT + insets.bottom}
    L0,${TAB_BAR_HEIGHT + insets.bottom}
    Z
  `;

    return (
        <View style={styles.container}>
            <View style={[styles.svgContainer, { height: TAB_BAR_HEIGHT + insets.bottom }]}>
                <Svg width={width} height={TAB_BAR_HEIGHT + insets.bottom} style={styles.svg}>
                    <Path
                        d={d}
                        fill="#4f46e5" // Red  cccdc color from reference
                    />
                </Svg>
            </View>

            <View style={[styles.contentContainer, { paddingBottom: insets.bottom }]}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                  

                    const renderIcon = () => {
                        const size = 26;
                        const color = '#fff'; 
                        switch (route.name) {
                            case 'Dashboard':
                                return <HomeIcon color={color} size={size} focused={isFocused} />;
                            case 'Resources':
                                return <ResourcesIcon color={color} size={size} focused={isFocused} />;
                            case 'About':
                                return <AboutIcon color={color} size={size} focused={isFocused} />;
                            case 'Profile':
                                return <ProfileIcon color={color} size={size} focused={isFocused} />;
                            default:
                                return <Text style={{ fontSize: 24, color }}>•</Text>;
                        }
                    };

                    if (route.name === 'UploadPlaceholder') {
                        return (
                            <View key={route.key} style={styles.tabButton}>
                                <TouchableOpacity
                                    style={styles.fab}
                                    onPress={onPress}
                                >
                                    <PlusIcon color="#fff" size={32} />
                                </TouchableOpacity>
                            </View>
                        );
                    }

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={(options as any).tabBarTestID}
                            onPress={onPress}
                            style={[styles.tabButton, { opacity: isFocused ? 1 : 0.6 }]}
                        >
                            {renderIcon()}
                            {isFocused && <View style={styles.activeDot} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    svgContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: width,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    svg: {
    },
    contentContainer: {
        flexDirection: 'row',
        height: TAB_BAR_HEIGHT,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4f46e5', // Same Red
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -40, // Move up
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        borderWidth: 4,
        borderColor: '#f2f2f2', // Light border to separate from bg if needed, or transparent
    },
    fabIcon: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#fff',
        marginTop: 4,
    }
});

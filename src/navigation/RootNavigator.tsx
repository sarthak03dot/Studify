import React from "react";
import { NavigationContainer } from "@react-navigation/native";

import AppStack from "./AppStack";
// import { useAuth } from "../context/AuthContext";

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <AppStack />
        </NavigationContainer>
    );
}

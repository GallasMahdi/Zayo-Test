import React from "react";
import { TouchableOpacity, StatusBar, View, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "../screens/LoginScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import InfoScreen from "../screens/InfoScreen";
import AddItem from "../screens/AddItem";
import ListItems from "../screens/ListItems";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
              gestureEnabled: false,
              headerLeft: null,
            }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{
              headerShown: false,

            }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              gestureEnabled: false,
              headerLeft: null,
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate("InfoScreen");
                  }}
                  style={{ marginRight: 15 }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={34}
                    color="#7F7F7F"
                    style={{ padding: 3 }}
                  />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="InfoScreen"
            component={InfoScreen}
            options={({ route, navigation }) => ({
                title: route.params?.isViewOnly ? "View Item" : "Add Item",
                headerShown: true,
                headerTitle: 'About',
                headerTitleAlign: 'center',
                headerLeft: () => (
                    <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                  </TouchableOpacity>
                ),
              })}
            />
          <Stack.Screen
            name="addItem"
            component={AddItem}
            options={{
              headerTitle: "About",
            }}
          />
          <Stack.Screen
            name="ListItems"
            component={ListItems}
            options={{ title: "Liste des objets" }}
          />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
};

export default AppNavigator;

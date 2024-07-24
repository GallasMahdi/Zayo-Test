import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config";

const InfoScreen = ({ navigation }) => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUserName = async () => {
      const storedUserName = await AsyncStorage.getItem("username");
      if (storedUserName) {
        const name = storedUserName.split("@")[0]; // Extract the name before the "@"
        setUserName(name);
        // Pass the userName to the navigation params
        navigation.setParams({ userName: name });
      }
    };

    fetchUserName();
  }, [navigation]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/zayo.png")} style={styles.zayo} />

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Version de l'application</Text>
        <Text style={styles.infoText}>1.0.3</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Identification de l'utilisateur</Text>
        <Text style={styles.infoText}>{userName}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Serveur URL</Text>
        <Text style={styles.infoText}>{BASE_URL}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
      <Image source={require("../assets/coppelis.png")} style={styles.logo} />
    </View>
  );
};

export default InfoScreen;

const styles = StyleSheet.create({
  zayo: {
    width: 150,
    height: 50,
    resizeMode: "contain",
    marginBottom: 20,
    padding: 40,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: "contain",
    marginBottom: 30,
    margin: 40,
    marginVertical: 49,
  },
  infoBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderColor: "white",
    borderWidth: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#01385E",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    width: "90%",
    borderColor: "white",
    borderWidth: 2,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

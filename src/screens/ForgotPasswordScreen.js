import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import * as Animatable from 'react-native-animatable';
import { BASE_URL } from "../config";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address.");
      if (formRef.current) {
        formRef.current.shake(800);
      }
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      await axios.post(`${BASE_URL}/api/forgotPassword`, {
        username: email,
      });
      alert("Password","Password reset link has been sent to your email.");
      setEmail("");
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to send password reset link. Please try again.");
      if (formRef.current) {
        formRef.current.shake(800);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image source={require("../assets/zayo.png")} style={styles.logo} />
        {isMounted ? (
          <Animatable.View ref={formRef} style={styles.formContainer}>
            <TextInput
              style={styles.disabledInput}
              value={BASE_URL}
              editable={false}
              placeholder="Base URL"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.signInTextContainer}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
            {errorMessage ? (
              <Animatable.Text
                animation="fadeIn"
                style={styles.errorMessage}
              >
                {errorMessage}
              </Animatable.Text>
            ) : null}
            <TouchableOpacity
              style={styles.button}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={styles.spinner}
                />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </Animatable.View>
        ) : (
          <View style={styles.formContainer}>
            <TextInput
              style={styles.disabledInput}
              value={BASE_URL}
              editable={false}
              placeholder="Base URL"
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.signInTextContainer}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
            {errorMessage ? (
              <Text style={styles.errorMessage}>
                {errorMessage}
              </Text>
            ) : null}
            <TouchableOpacity
              style={styles.button}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={styles.spinner}
                />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        <Image
          source={require("../assets/coppelis.png")}
          style={styles.coppelis}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: 5,
    padding: 50,
    resizeMode: "contain",
    marginVertical: 50,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: "#01385E",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  spinner: {
    marginRight: 10,
  },
  coppelis: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    marginVertical: 20,
  },
  disabledInput: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#d3d3d3",
    color: "#7f7f7f",
  },
  errorMessage: {
    color: 'red',
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  signInTextContainer: {
    marginBottom: 16, // Adjust this value to set the space between the email input and "Sign In" button
    alignItems: 'left',
    margin:5
    
  },
  signInText: {
    color: '#01385E',
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;

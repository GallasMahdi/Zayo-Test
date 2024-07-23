import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { BASE_URL } from '../config';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required Email'),
  password: Yup.string().min(4, 'Too Short!').required('Required Password'),
});


const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        navigation.navigate('Home');
      }
    };

    checkToken();
  }, [navigation]);

  const handleLogin = async (values) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await axios.post(`${BASE_URL}/api/login`, {
        username: values.email,
        password: values.password,
      });

      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('username', values.email);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      setErrorMessage('Login failed. Please check your credentials and try again.');
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
        <Image source={require('../assets/zayo.png')} style={styles.logo} />
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            isMounted ? (
              <Animatable.View ref={formRef} style={styles.formContainer}>
                <TextInput
                  style={styles.disabledInput}
                  value={BASE_URL}
                  editable={false}
                  placeholder="Base URL"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                />
                {errors.email && touched.email && <Text style={styles.error}>{errors.email}</Text>}
                
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                  />
                  <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && <Text style={styles.error}>{errors.password}</Text>}
                
                {errorMessage ? (
                  <Animatable.Text
                    animation="fadeIn"
                    style={styles.errorMessage}
                  >
                    {errorMessage}
                  </Animatable.Text>
                ) : null}

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </Animatable.View>
            ) : (
              <View style={styles.formContainer}>
                {/* Render the same content as above, but without animation */}
              </View>
            )
          )}
        </Formik>
        <Image source={require('../assets/coppelis.png')} style={styles.coppelis} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
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
  disabledInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#d3d3d3',
    color: '#7f7f7f',
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
  error: {
    color: 'red',
    marginBottom: 12,
    fontSize: 14,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  forgotPassword: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: -25,
    margin:12
  },
  forgotPasswordText: {
    color: '#01385E',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#01385E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
  errorMessage: {
    color: 'red',
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoginScreen;
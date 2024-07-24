import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions ,useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';

const HomeScreen = ({ }) => {
  const [username, setUsername] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        const name = storedUsername.split('@')[0];
        setUsername(name);
        navigation.setOptions({
          headerLeft: () => (
            <Text style={{ marginLeft: 10, fontWeight: 'bold', color: 'black' }}>{name}</Text>
          ),
        });
      }
    };

    fetchUsername();

    // Reset the navigation stack to prevent going back to the login screen
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
    navigation.dispatch(resetAction);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('addItem')}>
      <Feather name="plus-square" size={120} color="#01385E" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate('ListItems')}>
        <Icon name="list" size={120} color="#01385E" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingT:13
  },
  iconText: {
    fontSize: 20,
    color: '#01385E',
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

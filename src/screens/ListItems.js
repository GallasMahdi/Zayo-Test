import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const ListItems = ({ navigation, route }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadItems();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (route.params?.newItem) {
      addOrUpdateItem(route.params.newItem);
    } else if (route.params?.updatedItem) {
      addOrUpdateItem(route.params.updatedItem);
    }
  }, [route.params?.newItem, route.params?.updatedItem]);

  const addOrUpdateItem = async (item) => {
    try {
      const key = `item_${item.objectCode}`;
      const existingItem = items.find(i => i.objectCode === item.objectCode);
      if (existingItem) {
        setItems(prevItems => prevItems.map(i => (i.objectCode === item.objectCode ? item : i)));
      } else {
        // Generate unique ID
        const generateId = () => {
          const randomNum = Math.floor(Math.random() * 1000); // Generate a number between 0 and 999
          return `S_${randomNum.toString().padStart(3, '0')}`; // Pad with leading zeros
        };
        
        item.id = generateId();
        setItems(prevItems => [item, ...prevItems]);
      }
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error adding or updating item:', error);
    }
  };

  const loadItems = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const itemKeys = keys.filter(key => key.startsWith('item_'));
      const result = await AsyncStorage.multiGet(itemKeys);
      const loadedItems = result.map(([key, value]) => JSON.parse(value));
      const uniqueItems = Array.from(new Set(loadedItems.map(item => item.objectCode)))
        .map(objectCode => {
          return loadedItems.find(item => item.objectCode === objectCode);
        });
      setItems(uniqueItems.sort((a, b) => new Date(b.beginDate) - new Date(a.beginDate)));
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const handleItemPress = async (item) => {
    navigation.navigate('addItem', { item, isViewOnly: true });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)}>
      <View style={styles.itemContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{item.objectCode}: {item.objectType}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.column}>
            <View style={styles.row}>
              <Icon name="user" size={20} color="#003366" />
              <Text style={styles.text}>{item.creator}</Text>
            </View>
            <View style={styles.row}>
              <Icon name="key" size={20} color="#003366" />
              <Text style={styles.text}>{item.id}</Text>
            </View>
            <View style={styles.row}>
              <Icon name="calendar" size={20} color="#003366" />
              <Text style={styles.text}>{formatDate(item.beginDate)}</Text>
            </View>
          </View>
          <View style={styles.column}>
            {item.sortirDate && (
              <View style={styles.row}>
                <Icon name="calendar-check-o" size={20} color="#003366" />
                <Text style={styles.text}>{formatDate(item.sortirDate)}</Text>
              </View>
            )}
            <View style={styles.row}>
              <Icon name="lightbulb-o" size={20} color="#003366" />
              <Text style={styles.text}>{item.objectCode}</Text>
            </View>
            <View style={styles.row}>
              <Icon name="info-circle" size={20} color="#003366" />
              <Text style={styles.text}>{item.objectType}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.objectCode}_${item.beginDate}`}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 17,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 9,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    backgroundColor: '#01385E',
    padding: 15,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
    padding: 15,
  },
  column: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  text: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default ListItems;

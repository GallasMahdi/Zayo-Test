import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { BASE_URL } from "../src/config";

const BACKGROUND_SYNC_TASK = 'background-sync';
const SYNC_QUEUE_KEY = 'sync_queue';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log("Background sync started");
    const result = await synchronizeData();
    console.log("Background sync completed with result:", result);
    return result;
  } catch (error) {
    console.error("Background sync failed:", error);
    return BackgroundFetch.Result.Failed;
  }
});

const fetchToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }
    console.log(token,"aa")
    return token;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw error;
  }
};

const addToSyncQueue = async (itemCode) => {
  try {
    let queue = JSON.parse(await AsyncStorage.getItem(SYNC_QUEUE_KEY)) || [];
    if (!queue.includes(itemCode)) {
      queue.push(itemCode);
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
      console.log(`Added item ${itemCode} to sync queue`);
    }
  } catch (error) {
    console.error("Error adding item to sync queue:", error);
  }
};

const removeFromSyncQueue = async (itemCode) => {
  try {
    let queue = JSON.parse(await AsyncStorage.getItem(SYNC_QUEUE_KEY)) || [];
    queue = queue.filter(code => code !== itemCode);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    console.log(`Removed item ${itemCode} from sync queue`);
  } catch (error) {
    console.error("Error removing item from sync queue:", error);
  }
};

const synchronizeData = async () => {
    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        console.log("No internet connection. Skipping sync.");
        return BackgroundFetch.Result.NoData;
      }
  
      const queue = JSON.parse(await AsyncStorage.getItem(SYNC_QUEUE_KEY)) || [];
      const token = await fetchToken();
  
      for (const itemCode of queue) {
        try {
          const key = `item_${itemCode}`;
          const itemData = JSON.parse(await AsyncStorage.getItem(key));
  
          if (itemData && !itemData.synced) {
            const response = await fetch(`${BASE_URL}/api/pointing`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(itemData),
            });
  
            if (response.ok) {
              itemData.synced = true;
              await AsyncStorage.setItem(key, JSON.stringify(itemData));
              await removeFromSyncQueue(itemCode);
              console.log(`Synchronized item: ${itemCode}`);
            } else {
              console.log(`Failed to synchronize item: ${itemCode}, status: ${response.status}`);
            }
          }
        } catch (error) {
          console.error(`Error synchronizing item ${itemCode}:`, error);
        }
      }
  
      return BackgroundFetch.Result.NewData;
    } catch (error) {
      console.error("Error during synchronization:", error);
      return BackgroundFetch.Result.Failed;
    }
  };
  

export const saveItemForSync = async (itemData) => {
  try {
    const key = `item_${itemData.objectCode}`;
    await AsyncStorage.setItem(key, JSON.stringify({ ...itemData, synced: false }));
    await addToSyncQueue(itemData.objectCode);
    console.log(`Saved item ${itemData.objectCode} for sync`);
  } catch (error) {
    console.error("Error saving item for sync:", error);
  }
};

export const registerBackgroundSync = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 1 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("Background sync registered");
  } catch (err) {
    console.error("Background sync registration failed:", err);
  }
};
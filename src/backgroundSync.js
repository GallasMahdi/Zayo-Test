import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../src/config";

const BACKGROUND_SYNC_TASK = 'background-sync';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    await synchronizeData();
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.error("Background sync failed:", error);
    return BackgroundFetch.Result.Failed;
  }
});

const fetchToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  return token;
};

const handleError = (error, itemCode) => {
  console.error(`Error with item ${itemCode}:`, error);
};

const synchronizeData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const itemKeys = keys.filter(key => key.startsWith('item_'));

    // Batching items to avoid large number of requests at once
    const batchSize = 10;
    for (let i = 0; i < itemKeys.length; i += batchSize) {
      const batchKeys = itemKeys.slice(i, i + batchSize);

      await Promise.all(batchKeys.map(async (key) => {
        try {
          const itemData = JSON.parse(await AsyncStorage.getItem(key));
          
          if (!itemData.synced) {
            const token = await fetchToken();
            
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
              console.log(`Synchronized item: ${itemData.objectCode}`);
            } else {
              console.log(`Failed to synchronize item: ${itemData.objectCode}`);
            }
          }
        } catch (error) {
          handleError(error, itemData.objectCode);
        }
      }));
    }
  } catch (error) {
    console.error("Error during synchronization:", error);
  }
};

export const registerBackgroundSync = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("Background sync registered");
  } catch (err) {
    console.error("Background sync registration failed:", err);
  }
};

import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { registerBackgroundSync } from './src/backgroundSync'; // Adjust the path as needed

const App = () => {
  useEffect(() => {
    const setup = async () => {
      try {
        await registerBackgroundSync();
        console.log("Background sync successfully registered");
      } catch (error) {
        console.error("Failed to register background sync:", error);
      }
    };

    setup();
  }, []);

  return <AppNavigator />;
};

export default App;

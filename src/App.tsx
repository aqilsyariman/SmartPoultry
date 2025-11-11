import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types'; // import the types

// Screens
import HomeScreen from './screens/HomeScreen';
import Monitor from './screens/PoultryMonitor';
import Testing from './screens/Testing';

//import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator<RootStackParamList>(); // Use types here

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Monitor" component={Monitor} />
        <Stack.Screen name="Testing" component={Testing} />
        {/* <Stack.Screen name="Profile" component={ProfileScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

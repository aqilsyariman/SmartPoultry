import React from 'react';
import { View, Text, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack'; // Import StackNavigationProp
import { RootStackParamList } from '../types'; // Import the types file

// Define the type for the navigation prop
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp; // Type the navigation prop
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View>
      <Text>Home Screen</Text>
      <Button
        title="Poultry Monitor"
        onPress={() => navigation.navigate('Monitor', { itemId: 42 })}
      />
      <Button
        title="Testing"
        onPress={() => navigation.navigate('Testing')}
      />
    </View>
  );
};

export default HomeScreen;

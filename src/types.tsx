// types.ts

export type RootStackParamList = {
    Home: undefined; // Home screen has no params
    Monitor: { itemId: number }; // Details screen takes an 'itemId' as a parameter
    Testing: undefined; // Profile screen has no params
    Profile: undefined; // Profile screen has no params
    
  };
  
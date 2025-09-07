

import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from './store/store';



export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="(menu)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="(modals)" 
          options={{ presentation: 'modal', headerShown: false }} 
        />
      </Stack>
    </Provider>
  );
}
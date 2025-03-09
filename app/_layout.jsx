import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { supabase } from '../src/services/supabase';

export default function RootLayout() {
  const [isServer, setIsServer] = useState(true);
  
  useEffect(() => {
    // If this effect runs, we're in a client environment
    setIsServer(false);
  }, []);
  
  // On the server, don't render anything that might use AsyncStorage
  if (isServer) {
    return (
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    );
  }
  
  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// Render error boundaries for production
export function ErrorBoundary(props) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>An error occurred: {props.error?.message}</Text>
    </View>
  );
}
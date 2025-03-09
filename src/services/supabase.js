import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

// Get credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://yahnqzjsckujelocidak.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaG5xempzY2t1amVsb2NpZGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNTc3ODUsImV4cCI6MjA1NjgzMzc4NX0.DZaGoTBUNP6V780sAFdAwcwOX-P7jgqUphw1YTyL5_A';

// Custom storage implementation that works in React Native
const ExpoAsyncStorageAdapter = {
  getItem: async (key) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  },
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  }
};

// Handle server-side rendering (where window is undefined)
const isServer = typeof window === 'undefined';

// Create Supabase client with appropriate storage
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: isServer ? undefined : ExpoAsyncStorageAdapter,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: !isServer,
  },
});
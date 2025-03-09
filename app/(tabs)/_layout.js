import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="doughs"
        options={{
          title: 'Doughs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hide detail screens from tab bar */}
      <Tabs.Screen 
        name="recipes/create" 
        options={{ 
          tabBarButton: () => null  // This removes the tab button
        }} 
      />
      
      <Tabs.Screen 
        name="recipes/[id]" 
        options={{ 
          tabBarButton: () => null 
        }} 
      />
      
      <Tabs.Screen 
        name="doughs/create" 
        options={{ 
          tabBarButton: () => null 
        }} 
      />
      
      <Tabs.Screen 
        name="doughs/[id]" 
        options={{ 
          tabBarButton: () => null 
        }} 
      />
    </Tabs>
  );
}
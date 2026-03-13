import * as React from 'react';
import { useEffect } from 'react';
import { Stack, useRouter } from "expo-router";
import * as Linking from 'expo-linking';
export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      if (url.includes('expo-development-client') || url.startsWith('exp://')) {
        return;
      }

      console.log('🔗 Deep link received:', url);

      const { hostname, path, queryParams } = Linking.parse(url);

      if (hostname === 'survey' || path === '/survey') {
        const surveyId = queryParams?.id;
        if (surveyId) {
          router.push(`/(tabs)/explore?surveyId=${surveyId}` as any);
        }
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    console.log('✅ Deep link event listener registered');

    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }}/>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
      <Stack.Screen 
        name="auth" 
        options={{ 
          headerShown: false,
          presentation: 'card',
          animation: 'none'
        }}
      />
      <Stack.Screen name="create-survey" options={{ headerShown: false }}/>
    </Stack>
  );
}

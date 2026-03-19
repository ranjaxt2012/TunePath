import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';

export default function TutorLayout() {
  const user = useAuthStore((s) => s.user);
  const isTutor = user?.roles?.includes('tutor') ?? false;

  if (!isTutor) {
    return <Redirect href="/tutor/apply" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

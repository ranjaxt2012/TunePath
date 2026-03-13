import { useUser } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import { apiPost } from '@/src/services/apiClient';

export function useUserSync() {
  const { user: clerkUser, isLoaded } = useUser();
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (!isLoaded || !clerkUser) return;

    const user = clerkUser;

    async function syncUser() {
      try {
        const tunePathUser = await apiPost<{
          id: string;
          clerkUserId: string;
          email: string;
          displayName: string;
          avatarUrl: string | null;
          roles: string[];
        }>('/api/auth/sync', {
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? '',
          displayName: user.fullName ?? user.firstName ?? 'Learner',
          avatarUrl: user.imageUrl ?? null,
        });
        setUser({
          ...tunePathUser,
          roles: tunePathUser.roles as import('@/src/utils/roles').UserRole[],
          activeMode: 'learner',
        });
      } catch (err) {
        console.error('User sync failed', err);
      }
    }

    syncUser();
  }, [isLoaded, clerkUser, setUser]);
}

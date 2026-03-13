/**
 * Redirect to canonical route. Implementation lives at app/select/level.tsx
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function SelectLevelRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/select/level' as any);
  }, [router]);
  return null;
}

/**
 * Redirect to canonical route. Implementation lives at app/select/instrument.tsx
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function SelectInstrumentRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/select/instrument' as any);
  }, [router]);
  return null;
}

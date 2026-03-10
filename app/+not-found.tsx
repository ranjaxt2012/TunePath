import { Link, Stack } from 'expo-router';
import { commonStyles } from '../src/styles/commonStyles';

import { Text, View } from '@/components/Themed';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={commonStyles.notFoundContainer}>
        <Text style={commonStyles.notFoundTitle}>This screen doesn't exist.</Text>

        <Link href="/" style={commonStyles.notFoundLink}>
          <Text style={commonStyles.notFoundLinkText}>Go to Learn</Text>
        </Link>
      </View>
    </>
  );
}


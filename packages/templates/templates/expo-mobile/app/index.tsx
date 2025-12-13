import { Link } from 'expo-router';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui';
// @agent:inject:imports

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-3xl font-bold text-foreground mb-4">
        {/* @agent:inject:title */}
        Welcome
      </Text>
      <Text className="text-muted-foreground text-center mb-8">
        {/* @agent:inject:description */}
        Your app is ready to be customized
      </Text>

      <View className="gap-4 w-full max-w-xs">
        <Link href="/(tabs)" asChild>
          <Button>
            <Text className="text-primary-foreground font-semibold">Get Started</Text>
          </Button>
        </Link>
      </View>

      {/* @agent:inject:components */}
    </View>
  );
}

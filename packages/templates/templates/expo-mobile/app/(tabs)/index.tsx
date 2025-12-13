import { Link } from 'expo-router';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Card } from '@/components/ui';
import { useStore } from '@/lib/store';
// @agent:inject:imports

export default function TabHomeScreen() {
  const isLoading = useStore((state) => state.isLoading);

  // @agent:inject:data

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <Text className="text-2xl font-bold text-foreground">
          {/* @agent:inject:title */}
          Dashboard
        </Text>

        {isLoading ? (
          <Text className="text-muted-foreground">Loading...</Text>
        ) : (
          <View className="gap-4">
            {/* Example card - agent will replace */}
            <Link href="/1" asChild>
              <Pressable>
                <Card className="p-4">
                  <Text className="text-lg font-semibold text-card-foreground">
                    Example Item
                  </Text>
                  <Text className="text-muted-foreground">
                    Tap to view details
                  </Text>
                </Card>
              </Pressable>
            </Link>

            {/* @agent:inject:list-items */}
          </View>
        )}

        {/* @agent:inject:components */}
      </View>
    </ScrollView>
  );
}

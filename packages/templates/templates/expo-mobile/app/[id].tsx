import { useLocalSearchParams } from 'expo-router';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui';
// @agent:inject:imports

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // @agent:inject:data-fetching

  return (
    <View className="flex-1 bg-background p-4">
      <Card className="p-6">
        <Text className="text-xl font-bold text-card-foreground mb-2">
          Item Details
        </Text>
        <Text className="text-muted-foreground">
          Viewing item: {id}
        </Text>

        {/* @agent:inject:detail-content */}
      </Card>

      {/* @agent:inject:components */}
    </View>
  );
}

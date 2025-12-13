import { View, Text, ScrollView } from 'react-native';
import { Card, Button } from '@/components/ui';
// @agent:inject:imports

export default function SettingsScreen() {
  // @agent:inject:state

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <Text className="text-2xl font-bold text-foreground mb-2">
          Settings
        </Text>

        <Card className="p-4">
          <Text className="text-lg font-semibold text-card-foreground mb-4">
            App Settings
          </Text>

          {/* @agent:inject:settings-options */}

          <View className="gap-3">
            <View className="flex-row justify-between items-center py-2 border-b border-border">
              <Text className="text-foreground">Version</Text>
              <Text className="text-muted-foreground">1.0.0</Text>
            </View>
          </View>
        </Card>

        {/* @agent:inject:components */}
      </View>
    </ScrollView>
  );
}

import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function TabIcon({ focused, icon, iconFilled, label }: { focused: boolean; icon: IoniconName; iconFilled: IoniconName; label: string }) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={focused ? iconFilled : icon}
        size={24}
        color={focused ? Colors.primary : Colors.textLight}
      />
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="home-outline" iconFilled="home" label="Inicio" />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="search-outline" iconFilled="search" label="Explorar" />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="heart-outline" iconFilled="heart" label="Favoritos" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="person-outline" iconFilled="person" label="Perfil" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 60,
    paddingBottom: 4,
    paddingTop: 4,
    maxWidth: 430,
    alignSelf: "center" as const,
    width: "100%",
  },
  tabItem: { alignItems: "center", gap: 1 },
  tabLabel: { fontSize: 10, color: Colors.textLight },
  tabLabelActive: { color: Colors.primary, fontWeight: "600" },
});

import React, { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { CreatorRecentResponse } from "@/domain/models";
import { palette } from "@/theme/palette";

type SurveyResponsesRecord = {
  surveyId: string;
  title: string;
  responses: CreatorRecentResponse[];
};

const RESPONSES_MOCK: Record<string, SurveyResponsesRecord> = {
  c1: {
    surveyId: "c1",
    title: "Consumer Spending Habits Q1 2025",
    responses: [
      {
        id: "r-1",
        pseudonym: "Anon #4821",
        respondedAt: "2025-02-20T10:18:00Z",
        rewardStatus: "paid",
        reward: { amount: 1, currency: "USD" },
      },
      {
        id: "r-2",
        pseudonym: "Anon #3307",
        respondedAt: "2025-02-20T10:09:00Z",
        rewardStatus: "paid",
        reward: { amount: 1, currency: "USD" },
      },
      {
        id: "r-3",
        pseudonym: "Anon #9142",
        respondedAt: "2025-02-20T09:52:00Z",
        rewardStatus: "unpaid",
      },
      {
        id: "r-4",
        pseudonym: "Anon #2255",
        respondedAt: "2025-02-20T09:39:00Z",
        rewardStatus: "cap_reached",
      },
      {
        id: "r-7",
        pseudonym: "Anon #6641",
        respondedAt: "2025-02-20T09:34:00Z",
        rewardStatus: "paid",
        reward: { amount: 1, currency: "USD" },
      },
      {
        id: "r-8",
        pseudonym: "Anon #1803",
        respondedAt: "2025-02-20T09:30:00Z",
        rewardStatus: "unpaid",
      },
    ],
  },
  c2: {
    surveyId: "c2",
    title: "AI Product Attitudes",
    responses: [
      {
        id: "r-5",
        pseudonym: "Anon #1988",
        respondedAt: "2025-02-20T10:15:00Z",
        rewardStatus: "paid",
        reward: { amount: 1.5, currency: "USD" },
      },
      {
        id: "r-6",
        pseudonym: "Anon #7420",
        respondedAt: "2025-02-20T09:55:00Z",
        rewardStatus: "paid",
        reward: { amount: 1.5, currency: "USD" },
      },
      {
        id: "r-9",
        pseudonym: "Anon #4022",
        respondedAt: "2025-02-20T09:42:00Z",
        rewardStatus: "cap_reached",
      },
    ],
  },
};

function getRelativeMinutes(isoDate: string) {
  const responded = new Date(isoDate).getTime();
  const now = new Date("2025-02-20T10:20:00Z").getTime();
  const diff = Math.max(0, Math.round((now - responded) / (1000 * 60)));
  return `${diff} min ago`;
}

function formatResponseReward(response: CreatorRecentResponse) {
  const amount = response.reward?.amount;
  const currency = response.reward?.currency ?? "USD";

  if (typeof amount === "number" && amount > 0) {
    return {
      label: `+${amount.toFixed(2)} ${currency}`,
      color: palette.success,
    };
  }

  return {
    label: "no reward",
    color: palette.textMuted,
  };
}

export default function ManageResponsesPage() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const selectedId = Array.isArray(params.id) ? params.id[0] : params.id;

  const record = useMemo(() => {
    if (selectedId && RESPONSES_MOCK[selectedId]) {
      return RESPONSES_MOCK[selectedId];
    }
    return RESPONSES_MOCK.c1;
  }, [selectedId]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <MaterialIcons name="chevron-left" size={18} color={palette.primaryDark} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text numberOfLines={1} style={styles.headerTitle}>
            Recent Responses
          </Text>
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            {record.title}
          </Text>
        </View>
      </View>

      <FlatList
        data={record.responses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const reward = formatResponseReward(item);
          const isLast = index === record.responses.length - 1;

          return (
            <View style={[styles.row, !isLast && styles.rowDivider]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.pseudonym.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.name}>{item.pseudonym}</Text>
                <Text style={styles.time}>{getRelativeMinutes(item.respondedAt)}</Text>
              </View>
              <Text style={[styles.reward, { color: reward.color }]}>{reward.label}</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: palette.primaryNegative,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  backButtonPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: palette.primaryLight,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.primaryDark,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: palette.textSecondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
    marginRight: 10,
  },
  avatarText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: "700",
  },
  rowInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.primaryDark,
  },
  time: {
    marginTop: 2,
    fontSize: 11,
    color: palette.textMuted,
  },
  reward: {
    fontSize: 13,
    fontWeight: "500",
  },
});

import React, { useMemo } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

import {
  CreatorRecentResponse,
  SurveyManageDetail,
  SurveyRequirement,
} from "@/domain/models";
import { palette } from "@/theme/palette";

type ManageSurveyRecord = {
  survey: SurveyManageDetail;
  durationLabel: string;
  closesLabel: string;
};

const MANAGE_SURVEY_MOCK: Record<string, ManageSurveyRecord> = {
  c1: {
    survey: {
      id: "c1",
      title: "Consumer Spending Habits Q1 2025",
      description: "Finance behavior survey for Q1 2025.",
      status: "live",
      categories: [{ id: "cat-finance", label: "Finance" }],
      budget: {
        rewardPerVoter: { amount: 1, currency: "USD" },
        paidCap: 500,
        remainingBudget: { amount: 253, currency: "USD" },
      },
      progress: {
        responseCount: 583,
        paidResponseCount: 247,
        paidCap: 500,
        paidSlotsLeft: 253,
      },
      timeInfo: {
        closesAt: "2025-03-15T23:59:00Z",
        daysRemaining: 23,
      },
      requirements: [
        {
          id: "req-1",
          type: "age",
          label: "Age",
          value: "25-54",
        },
        {
          id: "req-2",
          type: "location",
          label: "Location",
          value: "SK",
        },
      ],
      recentResponses: [
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
      ],
      allowedActions: ["share", "end"],
    },
    durationLabel: "Feb 10 - Mar 15, 2025",
    closesLabel: "Mar 15, 2025",
  },
  c2: {
    survey: {
      id: "c2",
      title: "AI Product Attitudes",
      description: "Track user trust and adoption across AI features.",
      status: "live",
      categories: [{ id: "cat-tech", label: "Technology" }],
      budget: {
        rewardPerVoter: { amount: 1.5, currency: "USD" },
        paidCap: 150,
        remainingBudget: { amount: 81, currency: "USD" },
      },
      progress: {
        responseCount: 96,
        paidResponseCount: 46,
        paidCap: 150,
        paidSlotsLeft: 104,
      },
      timeInfo: {
        closesAt: "2025-03-08T23:59:00Z",
        daysRemaining: 16,
      },
      requirements: [
        {
          id: "req-3",
          type: "age",
          label: "Age",
          value: "18-45",
        },
        {
          id: "req-4",
          type: "location",
          label: "Location",
          value: "US",
        },
      ],
      recentResponses: [
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
      ],
      allowedActions: ["share", "end"],
    },
    durationLabel: "Feb 18 - Mar 8, 2025",
    closesLabel: "Mar 8, 2025",
  },
};

function formatWholeMoney(amount: number, currency: string) {
  return `${amount.toFixed(0)} ${currency}`;
}

function formatReward(amount: number, currency: string) {
  return `+${amount.toFixed(2)} ${currency}`;
}

function getRelativeMinutes(isoDate: string) {
  const responded = new Date(isoDate).getTime();
  const now = new Date("2025-02-20T10:20:00Z").getTime();
  const diff = Math.max(0, Math.round((now - responded) / (1000 * 60)));
  return `${diff} min ago`;
}

function buildRequirements(requirements: SurveyRequirement[] = []) {
  return requirements.map((item) => `${item.label} ${item.value}`);
}

function getResponseRewardLabel(response: CreatorRecentResponse) {
  const amount = response.reward?.amount;
  if (typeof amount === "number" && amount > 0) {
    return {
      text: formatReward(amount, response.reward?.currency || "USD"),
      color: palette.success,
    };
  }

  return {
    text: "no reward",
    color: palette.textMuted,
  };
}

export default function ManageSurveyPage() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const selectedId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [isExporting, setIsExporting] = React.useState(false);

  const record = useMemo(() => {
    if (selectedId && MANAGE_SURVEY_MOCK[selectedId]) {
      return MANAGE_SURVEY_MOCK[selectedId];
    }
    return MANAGE_SURVEY_MOCK.c1;
  }, [selectedId]);

  const survey = record.survey;
  const totalResponses = survey.progress?.responseCount ?? 0;
  const paidResponses = survey.progress?.paidResponseCount ?? 0;
  const paidCap = survey.progress?.paidCap ?? survey.budget?.paidCap ?? 0;
  const paidSlotsLeft = survey.progress?.paidSlotsLeft ?? Math.max(0, paidCap - paidResponses);
  const remainingBudget = survey.budget?.remainingBudget?.amount ?? 0;
  const remainingBudgetCurrency = survey.budget?.remainingBudget?.currency ?? "USD";
  const paidCapProgress = paidCap > 0 ? Math.min(1, paidResponses / paidCap) : 0;
  const paidCapProgressLabel = `${Math.round(paidCapProgress * 100)}%`;
  const daysRemaining = survey.timeInfo?.daysRemaining ?? 0;
  const rewardPerVoter = survey.budget?.rewardPerVoter?.amount ?? 0;
  const rewardCurrency = survey.budget?.rewardPerVoter?.currency ?? "USD";
  const requirements = buildRequirements(survey.requirements);
  const categoryLabel = survey.categories[0]?.label ?? "General";

  const handleExportCsv = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);

      const csvRows: string[][] = [
        [
          "survey_id",
          "title",
          "status",
          "category",
          "duration",
          "total_responses",
          "paid_responses",
          "paid_cap",
          "paid_slots_left",
          "reward_per_voter",
          "reward_currency",
          "remaining_budget",
          "remaining_budget_currency",
          "requirements",
        ],
        [
          survey.id,
          survey.title,
          survey.status,
          categoryLabel,
          record.durationLabel,
          String(totalResponses),
          String(paidResponses),
          String(paidCap),
          String(paidSlotsLeft),
          rewardPerVoter.toFixed(2),
          rewardCurrency,
          remainingBudget.toFixed(2),
          remainingBudgetCurrency,
          requirements.join(" | "),
        ],
        [""],
        ["response_id", "pseudonym", "responded_at", "reward_status", "reward_amount", "reward_currency"],
      ];

      for (const response of survey.recentResponses ?? []) {
        csvRows.push([
          response.id,
          response.pseudonym,
          response.respondedAt,
          response.rewardStatus,
          response.reward ? response.reward.amount.toFixed(2) : "",
          response.reward ? response.reward.currency : "",
        ]);
      }

      const escapeCsvCell = (value: string) => `"${value.replace(/"/g, "\"\"")}"`;
      const csvContent = csvRows
        .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
        .join("\n");

      const baseDir = FileSystem.documentDirectory;
      if (!baseDir) {
        throw new Error("Document directory is unavailable on this device.");
      }

      const safeTitle = survey.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const fileName = `${safeTitle || "survey"}-${Date.now()}.csv`;
      const fileUri = `${baseDir}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (Platform.OS === "web") {
        Alert.alert("CSV exported", `File prepared: ${fileName}`);
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          UTI: "public.comma-separated-values-text",
          dialogTitle: "Export survey CSV",
        });
      } else {
        Alert.alert("CSV exported", `Saved to ${fileUri}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to export CSV.";
      Alert.alert("Export failed", message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: 16 }]}>
          <View style={styles.heroHeader}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            >
              <MaterialIcons name="chevron-left" size={18} color={palette.white} />
            </Pressable>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroKicker}>Survey Dashboard</Text>
              <Text style={styles.heroTitle}>{survey.title}</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.menuButton, pressed && styles.iconButtonPressed]}>
              <MaterialIcons name="more-horiz" size={18} color={palette.white} />
            </Pressable>
          </View>

          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE - {categoryLabel}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalResponses}</Text>
              <Text style={styles.statLabel}>Total resp.</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{paidResponses}</Text>
              <Text style={styles.statLabel}>Paid resp.</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{paidCap}</Text>
              <Text style={styles.statLabel}>Paid cap</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatWholeMoney(remainingBudget, remainingBudgetCurrency)}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Paid cap progress</Text>
              <Text style={styles.progressValue}>
                {paidCapProgressLabel} - {paidSlotsLeft} slots left
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${paidCapProgress * 100}%` }]} />
            </View>
            <Text style={styles.progressHint}>
              Closes {record.closesLabel} - {daysRemaining} days remaining
            </Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <MaterialIcons name="error-outline" size={16} color={palette.orange} />
          <Text style={styles.warningText}>
            {paidSlotsLeft} paid slots remaining. Responses after the cap are still recorded but voters
            will not be rewarded.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Responses</Text>
            <Pressable
              onPress={() => router.push(`/survey/manage/${survey.id}/responses`)}
              style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
            >
              <Text style={styles.linkText}>View all</Text>
            </Pressable>
          </View>

          {(survey.recentResponses ?? []).map((response, index) => {
            const rewardLabel = getResponseRewardLabel(response);
            const initial = response.pseudonym.charAt(0).toUpperCase();
            const isLast = index === (survey.recentResponses ?? []).length - 1;

            return (
              <View key={response.id} style={[styles.responseRow, !isLast && styles.rowDivider]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </View>
                <View style={styles.responseInfo}>
                  <Text style={styles.responseName}>{response.pseudonym}</Text>
                  <Text style={styles.responseTime}>{getRelativeMinutes(response.respondedAt)}</Text>
                </View>
                <Text style={[styles.responseReward, { color: rewardLabel.color }]}>{rewardLabel.text}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Survey Info</Text>
            <Pressable
              onPress={handleExportCsv}
              disabled={isExporting}
              style={({ pressed }) => [
                styles.linkButton,
                pressed && !isExporting && styles.linkButtonPressed,
                isExporting && styles.linkButtonDisabled,
              ]}
            >
              <Text style={styles.linkText}>{isExporting ? "Exporting..." : "Export CSV"}</Text>
            </Pressable>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel} numberOfLines={1}>
              Category
            </Text>
            <View style={styles.infoPill}>
              <Text style={styles.infoPillText}>{categoryLabel}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, styles.rowDivider]}>
            <Text style={styles.infoLabel} numberOfLines={1}>
              Duration
            </Text>
            <Text style={styles.infoValue}>{record.durationLabel}</Text>
          </View>

          <View style={[styles.infoRow, styles.rowDivider]}>
            <Text style={styles.infoLabel} numberOfLines={1}>
              Paid cap
            </Text>
            <Text style={styles.infoValue}>
              {paidCap} voters - ${rewardPerVoter.toFixed(2)} each
            </Text>
          </View>

          <View style={[styles.infoRow, styles.requirementsRow]}>
            <Text style={styles.infoLabel} numberOfLines={1}>
              Requirements
            </Text>
            <View style={styles.requirementsWrap}>
              {requirements.map((item) => (
                <View key={item} style={styles.requirementPill}>
                  <Text style={styles.requirementText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionBar}>
        <Pressable style={({ pressed }) => [styles.shareButton, pressed && styles.shareButtonPressed]}>
          <MaterialIcons name="share" size={15} color={palette.primaryDark} />
          <Text style={styles.shareText}>Share</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.endButton, pressed && styles.endButtonPressed]}>
          <MaterialIcons name="cancel" size={15} color={palette.warning} />
          <Text style={styles.endText}>End Survey</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.surfaceSoft,
  },
  content: {
    paddingBottom: 98,
  },
  hero: {
    backgroundColor: palette.primaryPressed,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: palette.white25,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.35)",
    transform: [{ scale: 0.97 }],
  },
  menuButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.2)",
    transform: [{ scale: 0.97 }],
  },
  heroTitleWrap: {
    flex: 1,
  },
  heroKicker: {
    color: palette.white50,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  heroTitle: {
    marginTop: 2,
    color: palette.white,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
  },
  livePill: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: palette.white25,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
  },
  liveText: {
    fontSize: 11,
    color: palette.white,
    fontWeight: "700",
  },
  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.white25,
    borderRadius: 11,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  statValue: {
    color: palette.white,
    fontSize: 18,
    fontWeight: "500",
  },
  statLabel: {
    marginTop: 2,
    color: palette.white50,
    fontSize: 10,
    fontWeight: "500",
  },
  progressWrap: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  progressValue: {
    fontSize: 11,
    color: palette.white,
    fontWeight: "500",
  },
  progressTrack: {
    marginTop: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 3,
  },
  progressHint: {
    marginTop: 6,
    color: palette.white50,
    fontSize: 10,
  },
  warningBox: {
    marginTop: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: palette.orangeBorder,
    borderRadius: 10,
    backgroundColor: palette.surfaceMuted,
    paddingVertical: 11,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  warningText: {
    flex: 1,
    color: palette.orange,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  sectionCard: {
    marginTop: 14,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    backgroundColor: palette.white,
    paddingBottom: 4,
  },
  sectionHeader: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.primaryDark,
  },
  linkText: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.primary,
  },
  linkButton: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  linkButtonPressed: {
    backgroundColor: palette.primaryNegative,
  },
  linkButtonDisabled: {
    opacity: 0.6,
  },
  responseRow: {
    minHeight: 45,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceSoft,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: palette.white,
    fontSize: 13,
    fontWeight: "700",
  },
  responseInfo: {
    flex: 1,
  },
  responseName: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.primaryDark,
  },
  responseTime: {
    marginTop: 2,
    fontSize: 10,
    color: palette.textMuted,
  },
  responseReward: {
    fontSize: 13,
    fontWeight: "500",
  },
  infoRow: {
    minHeight: 46,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  requirementsRow: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  infoLabel: {
    width: 92,
    flexShrink: 0,
    fontSize: 12,
    color: palette.textMuted,
    fontWeight: "700",
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: palette.primaryDark,
    fontWeight: "500",
  },
  infoPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: palette.primaryNegative,
  },
  infoPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: palette.primary,
  },
  requirementsWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  requirementPill: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: palette.surfaceMuted,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.primaryDarkText,
  },
  actionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.white,
    flexDirection: "row",
    gap: 10,
  },
  shareButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  shareButtonPressed: {
    backgroundColor: palette.primaryNegative,
    transform: [{ scale: 0.985 }],
  },
  shareText: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.primaryDark,
  },
  endButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.warningLight,
    backgroundColor: palette.primaryNegative,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  endButtonPressed: {
    backgroundColor: palette.warningLight,
    transform: [{ scale: 0.985 }],
  },
  endText: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.warning,
  },
});

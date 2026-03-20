import React, { useMemo } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Pressable,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CreatedSurveyCardData } from "@/domain/models";
import { palette } from "@/theme/palette";

type QuestionOption = {
    label: string;
    percent: number;
    count: number;
    color?: string;
};

type QuestionResult = {
    id: string;
    questionNumber: number;
    title: string;
    options: QuestionOption[];
};

const MOCK_SURVEYS: CreatedSurveyCardData[] = [
    {
        id: "c4",
        title: "Remote Work Satisfaction",
        category: "Workplace",
        status: "results",
        rewardPerVoter: 1.25,
        endsAt: "Feb 1",
        responsesCurrent: 468,
        responsesTarget: 300,
        spent: 375,
        totalSpent: 375,
    },
    {
        id: "c5",
        title: "Remote Work Satisfaction",
        category: "Workplace",
        status: "results",
        rewardPerVoter: 1.25,
        endsAt: "Feb 1",
        responsesCurrent: 300,
        responsesTarget: 300,
        spent: 375,
        totalSpent: 375,
    },
];

const MOCK_RESULTS: Record<string, QuestionResult[]> = {
    c4: [
        {
            id: "q1",
            questionNumber: 1,
            title: "How often do you check your monthly budget?",
            options: [
                { label: "Weekly or more", percent: 41, count: 192, color: palette.success },
                { label: "Monthly", percent: 28, count: 131, color: palette.primary },
                { label: "Rarely", percent: 19, count: 89, color: palette.textMuted },
                { label: "Never", percent: 12, count: 56, color: palette.border },
            ],
        },
        {
            id: "q2",
            questionNumber: 2,
            title: "Has remote work improved your work-life balance?",
            options: [
                { label: "Yes, significantly", percent: 54, count: 253, color: palette.success },
                { label: "A little", percent: 24, count: 112, color: palette.primary },
                { label: "Not really", percent: 14, count: 66, color: palette.textMuted },
                { label: "No", percent: 8, count: 37, color: palette.border },
            ],
        },
    ],
    c5: [
        {
            id: "q1",
            questionNumber: 1,
            title: "Do you feel productive working remotely?",
            options: [
                { label: "Very productive", percent: 48, count: 144, color: palette.success },
                { label: "Somewhat productive", percent: 27, count: 81, color: palette.primary },
                { label: "Neutral", percent: 15, count: 45, color: palette.textMuted },
                { label: "Not productive", percent: 10, count: 30, color: palette.border },
            ],
        },
        {
            id: "q2",
            questionNumber: 2,
            title: "Has remote work improved your work-life balance?",
            options: [
                { label: "Yes, significantly", percent: 54, count: 253, color: palette.success },
                { label: "A little", percent: 24, count: 112, color: palette.primary },
                { label: "Not really", percent: 14, count: 66, color: palette.textMuted },
                { label: "No", percent: 8, count: 37, color: palette.border },
            ],
        },
    ],
};

function getStatusText(survey: CreatedSurveyCardData) {
    if (survey.status === "results") return `Completed · ${survey.endsAt ?? ""}`.trim();
    if (survey.status === "active") return `Active · Ends ${survey.endsAt ?? ""}`.trim();
    if (survey.status === "draft") return "Draft";
    return survey.status;
}

function formatMoney(value?: number) {
    return `$${value ?? 0}`;
}

export default function SurveyResultsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const survey = useMemo(() => {
        return MOCK_SURVEYS.find((item) => item.id === id) ?? MOCK_SURVEYS[0];
    }, [id]);

    const questions = useMemo(() => {
        return MOCK_RESULTS[survey.id] ?? [];
    }, [survey.id]);

    const totalResponses = survey.responsesCurrent ?? 0;
    const paidResponses = Math.min(
        survey.responsesCurrent ?? 0,
        survey.responsesTarget ?? 0
    );
    const paidOut = survey.totalSpent ?? survey.spent ?? 0;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.topBar}>
                        <Pressable style={styles.backButton} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={20} color={palette.white} />

                        </Pressable>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.overline}>SURVEY RESULTS</Text>
                            <Text style={styles.headerTitle}>{survey.title}</Text>
                        </View>
                    </View>

                    <View style={styles.statusBadge}>
                        <Ionicons name="checkmark" size={14} color={palette.green.text} />
                        <Text style={styles.statusText}>{getStatusText(survey)}</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <StatCard label="Total resp." value={String(totalResponses)} />
                        <StatCard label="Paid resp." value={String(paidResponses)} />
                        <StatCard label="Paid out" value={formatMoney(paidOut)} />
                    </View>
                </View>

                <View style={styles.content}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {questions.map((question) => (
                            <View key={question.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.questionTitle}>{question.title}</Text>
                                    <Text style={styles.questionNumber}>
                                        Q{question.questionNumber}
                                    </Text>
                                </View>

                                {question.options.map((option) => (
                                    <View key={option.label} style={styles.optionBlock}>
                                        <View style={styles.optionRow}>
                                            <Text style={styles.optionLabel}>{option.label}</Text>
                                            <Text
                                                style={[
                                                    styles.optionPercent,
                                                    { color: option.color || "#2563EB" },
                                                ]}
                                            >
                                                {option.percent}%
                                            </Text>
                                        </View>

                                        <View style={styles.progressTrack}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    {
                                                        width: `${option.percent}%`,
                                                        backgroundColor:
                                                            option.color || "#2563EB",
                                                    },
                                                ]}
                                            />
                                        </View>

                                        <Text style={styles.optionCount}>
                                            {option.count} responses
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ))}

                        <View style={styles.buttonRow}>
                            <Pressable
                                style={styles.secondaryButton}
                                onPress={() => Alert.alert("Share", "Mock share action")}
                            >
                                <Ionicons name="share-social-outline" size={18} color={palette.primaryDark} />
                                <Text style={styles.secondaryButtonText}>Share</Text>
                            </Pressable>

                            <Pressable
                                style={styles.primaryButton}
                                onPress={() => Alert.alert("Export CSV", "Mock export action")}
                            >
                                <Ionicons name="download-outline" size={18} color={palette.white} />
                                <Text style={styles.primaryButtonText}>Export CSV</Text>
                            </Pressable>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <View style={styles.statCard}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: palette.primaryDark,
    },
    container: {
        flex: 1,
        backgroundColor: palette.primaryDark,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: palette.primaryDark,
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: palette.white7,
        alignItems: "center",
        justifyContent: "center",
    },
    overline: {
        color: palette.white50,
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 2,
    },
    headerTitle: {
        color: palette.white,
        fontSize: 24,
        fontWeight: "800",
    },
    statusBadge: {
        marginTop: 16,
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: palette.green.bgSoft,
        borderColor: palette.successLight,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
    },
    statusText: {
        color: palette.green.text,
        fontSize: 14,
        fontWeight: "700",
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: palette.white7,
        borderRadius: 16,
        padding: 14,
    },
    statValue: {
        color: palette.white,
        fontSize: 18,
        fontWeight: "800",
    },
    statLabel: {
        color: palette.white50,
        fontSize: 13,
        marginTop: 4,
    },
    content: {
        flex: 1,
        backgroundColor: palette.surfaceMuted,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        overflow: "hidden",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: palette.white,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: palette.border,
        padding: 16,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 14,
    },
    questionTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: "800",
        color: palette.primaryDark,
        lineHeight: 28,
    },
    questionNumber: {
        color: palette.textMuted,
        fontSize: 14,
        fontWeight: "700",
    },
    optionBlock: {
        marginBottom: 16,
    },
    optionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
        gap: 10,
    },
    optionLabel: {
        flex: 1,
        color: palette.primaryDark,
        fontSize: 16,
        fontWeight: "700",
    },
    optionPercent: {
        fontSize: 16,
        fontWeight: "800",
    },
    progressTrack: {
        height: 10,
        borderRadius: 999,
        backgroundColor: palette.border,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 999,
    },
    optionCount: {
        marginTop: 6,
        color: palette.textMuted,
        fontSize: 14,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    secondaryButton: {
        flex: 1,
        height: 54,
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    secondaryButtonText: {
        color: palette.primaryDark,
        fontSize: 16,
        fontWeight: "700",
    },
    primaryButton: {
        flex: 1.4,
        height: 54,
        backgroundColor: palette.primary,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    primaryButtonText: {
        color: palette.white,
        fontSize: 16,
        fontWeight: "700",
    },
});
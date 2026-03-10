import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import CreatedSurveys from "@/app/survey/createdSurveys";
import ParticipatedSurveys from "@/app/survey/participatedSurveys";
import { ParticipatedSurveySummary } from "@/domain/models";
import { CreatedSurveyCardData } from "@/domain/models";
import { palette } from "@/theme/palette";
import { router, useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");


export default function MySurveys() {
    const params = useLocalSearchParams<{ tab?: string | string[] }>();

    const normalizeTab = (value?: string | string[]): "created" | "participated" => {
        const rawValue = Array.isArray(value) ? value[0] : value;
        return rawValue === "participated" ? "participated" : "created";
    };

    const [activeTab, setActiveTab] = useState<"created" | "participated">(
        normalizeTab(params.tab)
    );

    useEffect(() => {
        setActiveTab(normalizeTab(params.tab));
    }, [params.tab]);

    const createdSurveys: CreatedSurveyCardData[] = [
        {
            id: "c1",
            title: "Healthcare Access Study",
            category: "Medical",
            status: "active",
            rewardPerVoter: 2,
            endsAt: "Mar 10",
            responsesCurrent: 500,
            responsesTarget: 250,
            spent: 364,
        },
        {
            id: "c2",
            title: "AI Product Attitudes",
            category: "Technology",
            status: "active",
            rewardPerVoter: 1.5,
            endsAt: "Mar 8",
            responsesCurrent: 96,
            responsesTarget: 150,
            spent: 144,
        },
        {
            id: "c3",
            title: "Sustainable Shopping Habits",
            category: "Environment",
            status: "draft",
            rewardPerVoter: 0.75,
            responsesCurrent: 0,
            responsesTarget: 200,
            budget: 150,
        },
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

    const participatedSurveys: ParticipatedSurveySummary[] = [
        { id: "1", title: "Healthcare Access Study", category: "Medical", votedAt: "Mar 10", rewardStatus: "paid", reward: { amount: 2.0, currency: "USD" } },
        { id: "2", title: "AI Product Attitudes", category: "Technology", votedAt: "Mar 8", rewardStatus: "paid", reward: { amount: 1.5, currency: "USD" } },
        { id: "3", title: "Eco-Conscious Buying", category: "Environment", votedAt: "Mar 6", rewardStatus: "unpaid", reward: { amount: 0, currency: "USD" } },
        { id: "4", title: "Public Transit Feedback", category: "Civic", votedAt: "Mar 4", rewardStatus: "paid", reward: { amount: 0.8, currency: "USD" } },
        { id: "5", title: "Crypto Wallet UX", category: "Technology", votedAt: "Mar 2", rewardStatus: "paid", reward: { amount: 1.2, currency: "USD" } },
        { id: "6", title: "Healthy Eating Habits", category: "Lifestyle", votedAt: "Feb 28", rewardStatus: "unpaid", reward: { amount: 0, currency: "USD" } },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.tabWrapper}>
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => setActiveTab("created")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "created" && styles.activeText,
                            ]}
                        >
                            Created
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => setActiveTab("participated")}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === "participated" && styles.activeText,
                            ]}
                        >
                            Participated
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View
                    style={[
                        styles.indicator,
                        {
                            left: activeTab === "created" ? 0 : width / 2,
                        },
                    ]}
                />
            </View>

            <View style={styles.content}>
                {activeTab === "created" ? (
                    <CreatedSurveys
                        surveys={createdSurveys}
                        onCreateNew={() => {router.push("/create-survey")}}
                        onManage={() => {}}
                        onEdit={() => {}}
                        onResults={() => {}}
                    />
                ) : (
                    <ParticipatedSurveys surveys={participatedSurveys} />
                )}
            </View>
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.white,
    },
    tabWrapper: {
        position: "relative",
    },
    tabRow: {
        flexDirection: "row",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 16,
    },
    tabText: {
        fontSize: 16,
        color: palette.textMuted,
        fontWeight: "500",
    },
    activeText: {
        color: palette.primary,
    },
    divider: {
        height: 1,
        backgroundColor: palette.border,
    },
    indicator: {
        position: "absolute",
        bottom: 0,
        height: 3,
        width: width / 2,
        backgroundColor: palette.primary,
    },
    content: {
        flex: 1,
    },
});

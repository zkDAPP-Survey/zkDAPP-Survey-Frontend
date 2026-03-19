import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { CATEGORIES } from "@/constants/surveyFilters";

const TIME_OPTIONS = ["Under 5 min", "5–10 min", "10–20 min"];

type FilterModalProps = {
    visible: boolean;
    onClose: () => void;
    onReset: () => void;
    onApply: () => void;

    draftCategories: string[];
    setDraftCategories: React.Dispatch<React.SetStateAction<string[]>>;

    draftMinReward: number;
    setDraftMinReward: React.Dispatch<React.SetStateAction<number>>;

    draftOpenOnly: boolean;
    setDraftOpenOnly: React.Dispatch<React.SetStateAction<boolean>>;

    draftTime: string;
    setDraftTime: React.Dispatch<React.SetStateAction<string>>;

    draftQualifiedOnly: boolean;
    setDraftQualifiedOnly: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function FilterModal({
    visible,
    onClose,
    onReset,
    onApply,
    draftCategories,
    setDraftCategories,
    draftMinReward,
    setDraftMinReward,
    draftOpenOnly,
    setDraftOpenOnly,
    draftTime,
    setDraftTime,
    draftQualifiedOnly,
    setDraftQualifiedOnly,
}: FilterModalProps) {
    const toggleCategory = (category: string) => {
        if (category === "All") {
            setDraftCategories(["All"]);
            return;
        }

        if (draftCategories.includes(category)) {
            const updated = draftCategories.filter(
                (item) => item !== category && item !== "All"
            );

            setDraftCategories(updated.length > 0 ? updated : ["All"]);
        } else {
            setDraftCategories((prev) => [
                ...prev.filter((item) => item !== "All"),
                category,
            ]);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBackdrop} onPress={onClose} />

                <View style={styles.modalCard}>
                    <View style={styles.dragHandle} />

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filter</Text>
                        <Pressable onPress={onReset}>
                            <Text style={styles.resetText}>Reset</Text>
                        </Pressable>
                    </View>

                    <Text style={styles.sectionTitle}>Categories</Text>
                    <View style={styles.chipsWrap}>
                        {CATEGORIES.map((category) => {
                            const active = draftCategories.includes(category);

                            return (
                                <Pressable
                                    key={category}
                                    style={[styles.modalChip, active && styles.modalChipActive]}
                                    onPress={() => toggleCategory(category)}
                                >
                                    <Text
                                        style={[
                                            styles.modalChipText,
                                            active && styles.modalChipTextActive,
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Text style={styles.sectionTitle}>Minimum reward</Text>
                    <View style={styles.rewardBox}>
                        <View style={styles.rewardHeaderRow}>
                            <Text style={styles.rewardPlaceholder}>From</Text>
                            <Text style={styles.rewardValue}>${draftMinReward}</Text>
                        </View>

                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={20}
                            step={1}
                            value={draftMinReward}
                            onValueChange={setDraftMinReward}
                            minimumTrackTintColor="#3B6EF5"
                            maximumTrackTintColor="#DCE3F0"
                            thumbTintColor="#3B6EF5"
                        />

                        <View style={styles.rewardScaleRow}>
                            <Text style={styles.rewardScaleText}>$0</Text>
                            <Text style={styles.rewardScaleText}>$20</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Availability</Text>
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleText}>Open surveys only</Text>
                        <Switch value={draftOpenOnly} onValueChange={setDraftOpenOnly} />
                    </View>

                    <Text style={styles.sectionTitle}>Estimated time</Text>
                    <View style={styles.chipsWrap}>
                        {TIME_OPTIONS.map((item) => {
                            const active = draftTime === item;

                            return (
                                <Pressable
                                    key={item}
                                    style={[styles.modalChip, active && styles.modalChipActive]}
                                    onPress={() => setDraftTime(item)}
                                >
                                    <Text
                                        style={[
                                            styles.modalChipText,
                                            active && styles.modalChipTextActive,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <Text style={styles.sectionTitle}>Qualification</Text>
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleText}>
                            Show only surveys I qualify for
                        </Text>
                        <Switch
                            value={draftQualifiedOnly}
                            onValueChange={setDraftQualifiedOnly}
                        />
                    </View>

                    <View style={styles.actionsRow}>
                        <Pressable
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.actionButton, styles.applyButton]}
                            onPress={onApply}
                        >
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.25)",
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalCard: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 22,
        paddingTop: 12,
        paddingBottom: 30,
        minHeight: "72%",
    },
    dragHandle: {
        alignSelf: "center",
        width: 54,
        height: 6,
        borderRadius: 999,
        backgroundColor: "#D9DEE8",
        marginBottom: 18,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#1F2A44",
    },
    resetText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2F6BFF",
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F2A44",
        marginBottom: 12,
        marginTop: 12,
    },
    chipsWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    modalChip: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#D6DCEB",
        backgroundColor: "#FFFFFF",
    },
    modalChipActive: {
        backgroundColor: "#3B6EF5",
        borderColor: "#3B6EF5",
    },
    modalChipText: {
        color: "#4A5878",
        fontSize: 15,
        fontWeight: "500",
    },
    modalChipTextActive: {
        color: "#FFFFFF",
    },
    rewardBox: {
        marginTop: 2,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        backgroundColor: "#F8FAFC",
        borderRadius: 18,
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    rewardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    rewardPlaceholder: {
        fontSize: 15,
        color: "#667085",
    },
    rewardValue: {
        fontSize: 28,
        fontWeight: "700",
        color: "#1F2A44",
    },
    slider: {
        width: "100%",
        height: 40,
    },
    rewardScaleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 4,
    },
    rewardScaleText: {
        fontSize: 13,
        color: "#667085",
    },
    toggleRow: {
        minHeight: 56,
        borderWidth: 1,
        borderColor: "#DCE3F0",
        borderRadius: 18,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
    },
    toggleText: {
        flex: 1,
        fontSize: 16,
        color: "#33415C",
        paddingRight: 12,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 26,
    },
    actionButton: {
        flex: 1,
        height: 58,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#EEF2F7",
    },
    applyButton: {
        backgroundColor: "#3B6EF5",
    },
    cancelButtonText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#33415C",
    },
    applyButtonText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
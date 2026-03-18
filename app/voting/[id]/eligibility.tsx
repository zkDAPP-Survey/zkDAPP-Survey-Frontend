import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";

import { palette } from "@/theme/palette";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "verify" | "verifying" | "confirmed";

type CheckItem = {
  key: string;
  label: string;
  state: "done" | "loading" | "pending";
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function EligibilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("verify");

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const checkItems: CheckItem[] = [
    { key: "wallet",    label: "Wallet connected",         state: step === "verifying" ? "done" : step === "confirmed" ? "done" : "pending" },
    { key: "identity",  label: "Identity data received",   state: step === "verifying" ? "loading" : step === "confirmed" ? "done" : "pending" },
    { key: "eligibility", label: "Eligibility verified",   state: step === "confirmed" ? "done" : "pending" },
  ];

  // When user taps "Open Valera" → simulate wallet deeplink → auto-progress
  const handleOpenValera = () => {
    // In production: Linking.openURL("valera://verify?survey=<id>&callback=...")
    transitionTo("verifying");
  };

  const transitionTo = (next: Step) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setStep(next);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

  // After "verifying" auto-advance to "confirmed"
  useEffect(() => {
    if (step !== "verifying") return;
    const timer = setTimeout(() => transitionTo("confirmed"), 3000);
    return () => clearTimeout(timer);
  }, [step]);

  const handleProceed = () => {
    router.push(`/voting/${id}/questions` as any);
  };

  const title =
    step === "verify"    ? "Verify Your Identity" :
    step === "verifying" ? "Checking Eligibility" :
                           "Identity Verified";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        {step === "verify" && (
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="chevron-left" size={20} color={palette.textSecondary} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      {/* ── Content ── */}
      <Animated.View style={[styles.centered, { opacity: fadeAnim }]}>
        {/* ── STEP: verify ── */}
        {step === "verify" && (
          <>
            <View style={[styles.iconCircle, styles.iconCircleBlue]}>
              <Feather name="lock" size={32} color={palette.primary} />
            </View>

            <Text style={styles.centeredTitle}>Verify Your Identity</Text>
            <Text style={styles.centeredText}>
              To vote in this survey, we need to verify your eligibility via your
              identity wallet. Your personal data stays private — only proof of
              eligibility is shared.
            </Text>

            {/* Valera wallet card */}
            <View style={styles.walletCard}>
              <View style={styles.walletIcon}>
                <Feather name="shield" size={26} color={palette.white} />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>Valera</Text>
                <Text style={styles.walletDesc}>Identity Wallet</Text>
              </View>
              <Feather name="chevron-right" size={18} color={palette.textMuted} />
            </View>

            {/* Privacy note */}
            <View style={styles.infoBox}>
              <View style={styles.infoIconWrap}>
                <Feather name="info" size={16} color={palette.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>
                  Your identity data stays private. Only a proof of eligibility is
                  shared with the survey.
                </Text>
              </View>
            </View>
          </>
        )}

        {/* ── STEP: verifying ── */}
        {step === "verifying" && (
          <>
            <ActivityIndicator
              size="large"
              color={palette.primary}
              style={styles.spinner}
            />
            <Text style={styles.centeredTitle}>Checking Eligibility…</Text>
            <Text style={styles.centeredText}>
              We're securely verifying your identity. This usually takes a few
              seconds…
            </Text>

            <View style={styles.checklistCard}>
              {checkItems.map((item) => (
                <CheckRow key={item.key} item={item} />
              ))}
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoIconWrap}>
                <Feather name="shield" size={16} color={palette.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>
                  <Text style={styles.infoStrong}>Your privacy is protected. </Text>
                  We verify eligibility without revealing your identity.
                </Text>
              </View>
            </View>
          </>
        )}

        {/* ── STEP: confirmed ── */}
        {step === "confirmed" && (
          <>
            <View style={[styles.iconCircle, styles.iconCircleGreen]}>
              <Feather name="check" size={32} color={palette.success} />
            </View>

            <Text style={styles.centeredTitle}>You're Eligible!</Text>
            <Text style={styles.centeredText}>
              Your identity has been successfully verified. You are eligible to
              participate in this survey.
            </Text>

            <View style={styles.checklistCard}>
              {checkItems.map((item) => (
                <CheckRow key={item.key} item={{ ...item, state: "done" }} />
              ))}
            </View>
          </>
        )}
      </Animated.View>

      {/* ── Action Bar ── */}
      {step !== "verifying" && (
        <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
          {step === "verify" && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleOpenValera}>
              <Feather name="external-link" size={16} color={palette.white} />
              <Text style={styles.primaryBtnText}>Open Valera</Text>
            </TouchableOpacity>
          )}
          {step === "confirmed" && (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleProceed}>
              <Text style={styles.primaryBtnText}>Proceed to Vote</Text>
              <Feather name="chevron-right" size={16} color={palette.white} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── CheckRow helper ──────────────────────────────────────────────────────────

function CheckRow({ item }: { item: CheckItem }) {
  return (
    <View style={checkStyles.row}>
      {item.state === "done" && (
        <Feather name="check-circle" size={18} color={palette.success} />
      )}
      {item.state === "loading" && (
        <ActivityIndicator size="small" color={palette.primary} style={checkStyles.spinner} />
      )}
      {item.state === "pending" && (
        <View style={checkStyles.emptyCircle} />
      )}
      <Text
        style={[
          checkStyles.label,
          item.state === "pending" && checkStyles.labelMuted,
        ]}
      >
        {item.label}
      </Text>
    </View>
  );
}

const checkStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  spinner: {
    width: 18,
    height: 18,
  },
  emptyCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: palette.border,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: palette.primaryDark,
  },
  labelMuted: {
    color: palette.textSecondary,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: palette.white,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: palette.primaryDark,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 32,
    backgroundColor: palette.surfaceSoft,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  iconCircleBlue: {
    backgroundColor: palette.primaryNegative,
  },
  iconCircleGreen: {
    backgroundColor: palette.successLight,
  },
  spinner: {
    marginBottom: 24,
  },
  centeredTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.primaryDark,
    marginBottom: 10,
    textAlign: "center",
  },
  centeredText: {
    fontSize: 14,
    color: palette.textSecondary,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 300,
    marginBottom: 28,
  },
  walletCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: palette.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    marginBottom: 16,
  },
  walletIcon: {
    width: 52,
    height: 52,
    borderRadius: 13,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.primaryDark,
  },
  walletDesc: {
    fontSize: 13,
    color: palette.textSecondary,
    marginTop: 2,
  },
  infoBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: palette.primaryNegative,
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: palette.primary,
    lineHeight: 19,
  },
  infoIconWrap: {
    width: 16,
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoStrong: {
    fontWeight: "700",
  },
  checklistCard: {
    width: "100%",
    backgroundColor: palette.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 16,
  },
  actionBar: {
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  primaryBtn: {
    backgroundColor: palette.primary,
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryBtnText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: "700",
  },
});



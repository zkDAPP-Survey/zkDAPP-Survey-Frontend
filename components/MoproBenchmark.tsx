import React, { useState } from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { palette } from "@/theme/palette";
import { EligibilityCircuitInput } from "@/utils/sdjwt/eligibilityInput";
import { generateEligibilityProofOnDevice } from "@/utils/zk/moproProver";
// Valid circuit v3 input from a test credential (test issuer key, fake personal data). It is only proven, never
// sent on-chain, so it measures proving in isolation from Valera, the deep link and the network.
import benchmarkInput from "@/utils/zk/benchmarkInput.json";

const RUNS = 10;

type Stats = { mean: number; sd: number; min: number; max: number };

function stats(values: number[]): Stats {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const sd = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / Math.max(1, values.length - 1));
  return { mean, sd, min: Math.min(...values), max: Math.max(...values) };
}

const fmt = (s: Stats) => `${s.mean.toFixed(0)} ± ${s.sd.toFixed(0)} ms (min ${s.min.toFixed(0)}, max ${s.max.toFixed(0)})`;

export default function MoproBenchmark() {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("");

  const run = async () => {
    setRunning(true);
    const witness: number[] = [];
    const proving: number[] = [];
    const total: number[] = [];
    try {
      for (let i = 1; i <= RUNS; i += 1) {
        setStatus(`Run ${i}/${RUNS}...`);
        const result = await generateEligibilityProofOnDevice(benchmarkInput as EligibilityCircuitInput);
        witness.push(result.witnessMs);
        proving.push(result.provingMs);
        total.push(result.totalMs);
        console.log("[zk-bench]", JSON.stringify({ run: i, platform: Platform.OS, witnessMs: result.witnessMs, provingMs: result.provingMs, totalMs: result.totalMs }));
      }
      const summary =
        `witness ${fmt(stats(witness))}\nproving ${fmt(stats(proving))}\ntotal ${fmt(stats(total))}`;
      console.log("[zk-bench] summary", JSON.stringify({ runs: RUNS, witness: stats(witness), proving: stats(proving), total: stats(total) }));
      setStatus(`${RUNS} runs:\n${summary}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[zk-bench] failed", message);
      setStatus(`Failed after ${total.length} runs: ${message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <View>
      <Pressable style={styles.row} onPress={run} disabled={running}>
        <Text style={styles.text}>ZK benchmark (mopro, {RUNS} runs)</Text>
        {running ? <ActivityIndicator size="small" /> : <MaterialIcons name="play-arrow" size={20} color={palette.textMuted} />}
      </Pressable>
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  text: { fontSize: 15, color: palette.textPrimary },
  status: { paddingHorizontal: 16, paddingBottom: 12, fontSize: 13, color: palette.textSecondary, fontFamily: Platform.OS === "android" ? "monospace" : undefined },
});

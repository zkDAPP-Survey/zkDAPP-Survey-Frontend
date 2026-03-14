import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

type CallbackData = {
  status: string;
  requestId: string;
  receivedAt: string;
  presentation?: unknown;
  errorCode?: string;
  errorMessage?: string;
  legacyCredential?: unknown;
  legacyDid?: string;
  legacyTimestamp?: string;
};

function tryParseJson(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [callbackData, setCallbackData] = useState<CallbackData | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCallbackParams = Boolean(
    params.status || params.requestId || params.presentation || params.errorCode || params.credential,
  );

  const appendDebugLog = (message: string) => {
    console.log(message);
    setDebugLogs((current) => [...current.slice(-7), `${new Date().toLocaleTimeString()} ${message}`]);
  };

  // Fires on every render — confirms the screen mounted and received params.
  console.log('[AuthCallback] Screen rendered, requestId:', params.requestId ?? 'none', 'status:', params.status ?? 'none');

  useEffect(() => {
    if (!hasCallbackParams) {
      appendDebugLog('[AuthCallback] Opened without callback params, returning to home');
      router.replace('/(tabs)/home');
    }
  }, [hasCallbackParams, router]);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!hasCallbackParams) {
          return;
        }

        setIsProcessing(true);

        const status = params.status as string | undefined;
        const requestId = params.requestId as string | undefined;
        const presentation = params.presentation as string | undefined;
        const errorCode = params.errorCode as string | undefined;
        const errorMessage = params.errorMessage as string | undefined;

        const credential = params.credential as string;
        const did = params.did as string;
        const timestamp = params.timestamp as string;

        const parsedCredential = tryParseJson(credential);
        const parsedPresentation = tryParseJson(presentation);
        const normalizedTimestamp = timestamp
          ? new Date(parseInt(timestamp, 10)).toLocaleString()
          : undefined;

        appendDebugLog(
          `[AuthCallback] Processing callback params requestId=${requestId || 'N/A'} status=${status || 'unknown'} hasPresentation=${Boolean(presentation)} hasError=${Boolean(errorCode)}`,
        );

        const receivedData: CallbackData = {
          status: status || (parsedCredential ? 'legacy-success' : 'unknown'),
          requestId: requestId || 'N/A',
          receivedAt: new Date().toLocaleString(),
          presentation: parsedPresentation ?? undefined,
          errorCode: errorCode || undefined,
          errorMessage: errorMessage || undefined,
          legacyCredential: parsedCredential ?? undefined,
          legacyDid: did || undefined,
          legacyTimestamp: normalizedTimestamp,
        };

        appendDebugLog('CALLBACK SUCCESSFULLY RECEIVED FROM VALERA');
        appendDebugLog(`Status=${receivedData.status}`);
        appendDebugLog(`Request ID=${receivedData.requestId}`);
        appendDebugLog(`Has presentation=${Boolean(receivedData.presentation)}`);
        appendDebugLog(`Error code=${receivedData.errorCode || 'N/A'}`);

        setCallbackData(receivedData);

        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsProcessing(false);

        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }

        redirectTimeoutRef.current = setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 3000);

      } catch (error) {
        console.error('Error processing authentication callback:', error);
        appendDebugLog(
          `Error processing authentication callback: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
        setIsProcessing(false);
      }
    };

    handleAuthCallback();

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [
    hasCallbackParams,
    params.status,
    params.requestId,
    params.presentation,
    params.errorCode,
    params.errorMessage,
    params.credential,
    params.did,
    params.timestamp,
    router,
  ]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {isProcessing ? (
          <>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.text}>Processing authentication...</Text>
            <Text style={styles.subtext}>Receiving data from Valera wallet</Text>
          </>
        ) : (
          <>
            <Text style={[styles.successText, callbackData?.status === 'error' && styles.errorText]}>✓</Text>
            <Text style={styles.text}>
              {callbackData?.status === 'error' ? 'Callback Error Received!' : 'Presentation Received!'}
            </Text>
            <Text style={styles.subtext}>Redirecting to home...</Text>

            {callbackData && (
              <View style={styles.dataContainer}>
                <Text style={styles.dataTitle}>📋 Received Data:</Text>

                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Status:</Text>
                  <Text style={styles.dataValue}>{callbackData.status}</Text>
                </View>

                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Request ID:</Text>
                  <Text style={styles.dataValue}>{callbackData.requestId}</Text>
                </View>

                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Received At:</Text>
                  <Text style={styles.dataValue}>{callbackData.receivedAt}</Text>
                </View>

                {callbackData.errorCode && (
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Error Code:</Text>
                    <Text style={styles.dataValue}>{callbackData.errorCode}</Text>
                  </View>
                )}

                {callbackData.errorMessage && (
                  <View style={styles.dataRow}>
                    <Text style={styles.dataLabel}>Error Message:</Text>
                    <Text style={styles.dataValue}>{callbackData.errorMessage}</Text>
                  </View>
                )}

                {Boolean(callbackData.presentation) && (
                  <>
                    <Text style={styles.dataTitle}>🔐 Presentation Payload:</Text>
                    <View style={styles.credentialBox}>
                      <Text style={styles.credentialText}>
                        {typeof callbackData.presentation === 'string'
                          ? callbackData.presentation
                          : JSON.stringify(callbackData.presentation, null, 2)}
                      </Text>
                    </View>
                  </>
                )}

                {Boolean(callbackData.legacyCredential) && (
                  <>
                    <Text style={styles.dataTitle}>🧪 Legacy Fallback Payload:</Text>
                    {callbackData.legacyDid && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Legacy DID:</Text>
                        <Text style={styles.dataValue}>{callbackData.legacyDid}</Text>
                      </View>
                    )}
                    {callbackData.legacyTimestamp && (
                      <View style={styles.dataRow}>
                        <Text style={styles.dataLabel}>Legacy Timestamp:</Text>
                        <Text style={styles.dataValue}>{callbackData.legacyTimestamp}</Text>
                      </View>
                    )}
                    <View style={styles.credentialBox}>
                      <Text style={styles.credentialText}>
                        {typeof callbackData.legacyCredential === 'string'
                          ? callbackData.legacyCredential
                          : JSON.stringify(callbackData.legacyCredential, null, 2)}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {debugLogs.length > 0 && (
              <View style={styles.dataContainer}>
                <Text style={styles.dataTitle}>Debug Events</Text>
                <View style={styles.credentialBox}>
                  {debugLogs.map((entry, index) => (
                    <Text key={`${index}-${entry}`} style={styles.credentialText}>
                      {entry}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  successText: {
    fontSize: 64,
    color: '#4CAF50',
  },
  errorText: {
    color: '#D32F2F',
  },
  dataContainer: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  credentialBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginBottom: 12,
  },
  credentialText: {
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
  },
});

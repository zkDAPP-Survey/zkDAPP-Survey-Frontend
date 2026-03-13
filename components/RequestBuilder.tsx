import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { palette } from '@/theme/palette';
import {
  CREDENTIAL_TYPES,
  CredentialType,
  getCredentialTypeConfig,
  getDefaultAttributesForType,
} from '@/utils/credentialConfig';

type RequestBuilderStep = 'credential-type' | 'attributes' | 'review';

interface RequestBuilderState {
  step: RequestBuilderStep;
  selectedCredentialType: CredentialType | null;
  selectedAttributes: Set<string>;
  isLoading: boolean;
}

interface RequestBuilderProps {
  onClose?: () => void;
}

export default function RequestBuilder({ onClose }: RequestBuilderProps) {
  const [state, setState] = useState<RequestBuilderState>({
    step: 'credential-type',
    selectedCredentialType: null,
    selectedAttributes: new Set(),
    isLoading: false,
  });

  const handleSelectCredentialType = (typeId: CredentialType) => {
    const defaultAttrs = getDefaultAttributesForType(typeId);
    setState({
      ...state,
      selectedCredentialType: typeId,
      selectedAttributes: new Set(defaultAttrs),
      step: 'attributes',
    });
  };

  const handleToggleAttribute = (attributeId: string) => {
    const newAttributes = new Set(state.selectedAttributes);
    if (newAttributes.has(attributeId)) {
      newAttributes.delete(attributeId);
    } else {
      newAttributes.add(attributeId);
    }
    setState({
      ...state,
      selectedAttributes: newAttributes,
    });
  };

  const handleNext = () => {
    if (state.step === 'attributes') {
      setState({
        ...state,
        step: 'review',
      });
    }
  };

  const handleBack = () => {
    if (state.step === 'attributes') {
      setState({
        ...state,
        step: 'credential-type',
        selectedCredentialType: null,
        selectedAttributes: new Set(),
      });
    } else if (state.step === 'review') {
      setState({
        ...state,
        step: 'attributes',
      });
    }
  };

  const handleSendRequest = async () => {
    if (!state.selectedCredentialType) return;

    setState({ ...state, isLoading: true });

    try {
      const credentialConfig = getCredentialTypeConfig(state.selectedCredentialType);
      if (!credentialConfig) {
        throw new Error('Invalid credential type');
      }

      const callbackUrl = 'zkdappsurveyfrontend://auth';
      const requestId = `req_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
      const nonce = `nonce_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;

      const requestPayload = {
        version: '1.0',
        requestId,
        presentationType: 'sd-jwt',
        aud: 'zkdapp-survey-frontend',
        nonce,
        callbackUrl,
        credentialQuery: {
          vct: credentialConfig.vct,
          requestedClaims: Array.from(state.selectedAttributes),
        },
        options: {
          allowUserSelectSubset: true,
        },
      };

      const valeraUrl = `asitplus-wallet://share?action=share&callback=${encodeURIComponent(
        callbackUrl,
      )}&type=${encodeURIComponent(credentialConfig.vct)}&requestId=${encodeURIComponent(
        requestId,
      )}&request=${encodeURIComponent(JSON.stringify(requestPayload))}`;

      const canOpen = await Linking.canOpenURL(valeraUrl);

      if (!canOpen) {
        Alert.alert(
          'Valera Not Installed',
          'The Valera wallet app is not installed or not properly configured.',
          [{ text: 'OK' }],
        );
        return;
      }

      console.log('[RequestBuilder] Sending request to Valera:', {
        vct: credentialConfig.vct,
        requestedClaims: Array.from(state.selectedAttributes),
        requestId,
      });

      await Linking.openURL(valeraUrl);

      // Dismiss the modal so auth-callback screen is visible when Valera redirects back
      console.log('✅ [RequestBuilder] Valera opened - closing modal to await callback');
      onClose?.();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send request',
        [{ text: 'OK' }],
      );
    } finally {
      setState({ ...state, isLoading: false });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with close button and step indicator */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {state.step === 'credential-type'
            ? 'Select Credential'
            : state.step === 'attributes'
              ? 'Select Attributes'
              : 'Review Request'}
        </Text>
        <Pressable
          onPress={onClose}
          disabled={state.isLoading}
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
        >
          <MaterialIcons name="close" size={24} color={palette.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {state.step === 'credential-type' && (
          <CredentialTypeScreen onSelect={handleSelectCredentialType} />
        )}

        {state.step === 'attributes' && state.selectedCredentialType && (
          <AttributeSelectionScreen
            credentialType={state.selectedCredentialType}
            selectedAttributes={state.selectedAttributes}
            onToggleAttribute={handleToggleAttribute}
          />
        )}

        {state.step === 'review' && state.selectedCredentialType && (
          <ReviewScreen
            credentialType={state.selectedCredentialType}
            selectedAttributes={state.selectedAttributes}
          />
        )}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.footer}>
        {(state.step === 'attributes' || state.step === 'review') && (
          <Pressable
            onPress={handleBack}
            disabled={state.isLoading}
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Back</Text>
          </Pressable>
        )}

        {state.step === 'attributes' && (
          <Pressable
            onPress={handleNext}
            disabled={state.isLoading || state.selectedAttributes.size === 0}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              (pressed || state.selectedAttributes.size === 0) && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Next</Text>
          </Pressable>
        )}

        {state.step === 'review' && (
          <Pressable
            onPress={handleSendRequest}
            disabled={state.isLoading}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              (pressed || state.isLoading) && styles.buttonPressed,
            ]}
          >
            {state.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Request from Valera</Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

function CredentialTypeScreen({
  onSelect,
}: {
  onSelect: (typeId: CredentialType) => void;
}) {
  return (
    <View>
      <Text style={styles.stepDescription}>
        Choose which credential you would like to request from your Valera wallet.
      </Text>

      {CREDENTIAL_TYPES.map((credentialType) => (
        <Pressable
          key={credentialType.id}
          onPress={() => onSelect(credentialType.id)}
          style={({ pressed }) => [styles.credentialCard, pressed && styles.credentialCardPressed]}
        >
          <View>
            <Text style={styles.credentialLabel}>{credentialType.label}</Text>
            <Text style={styles.credentialDescription}>{credentialType.description}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={palette.primary} />
        </Pressable>
      ))}
    </View>
  );
}

function AttributeSelectionScreen({
  credentialType,
  selectedAttributes,
  onToggleAttribute,
}: {
  credentialType: CredentialType;
  selectedAttributes: Set<string>;
  onToggleAttribute: (attributeId: string) => void;
}) {
  const config = getCredentialTypeConfig(credentialType);
  if (!config) return null;

  return (
    <View>
      <Text style={styles.stepDescription}>
        Select which attributes you want to share from your {config.label}.
      </Text>

      <View style={styles.attributesList}>
        {config.attributes.map((attribute) => (
          <Pressable
            key={attribute.id}
            onPress={() => onToggleAttribute(attribute.id)}
            style={styles.attributeItem}
          >
            <MaterialIcons
              name={selectedAttributes.has(attribute.id) ? 'check-box' : 'check-box-outline-blank'}
              size={20}
              color={palette.primary}
            />
            <Text style={styles.attributeLabel}>{attribute.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.selectedCount}>
        {selectedAttributes.size} attribute{selectedAttributes.size !== 1 ? 's' : ''} selected
      </Text>
    </View>
  );
}

function ReviewScreen({
  credentialType,
  selectedAttributes,
}: {
  credentialType: CredentialType;
  selectedAttributes: Set<string>;
}) {
  const config = getCredentialTypeConfig(credentialType);
  if (!config) return null;

  const selectedAttributeLabels = config.attributes
    .filter((attr) => selectedAttributes.has(attr.id))
    .map((attr) => attr.label);

  return (
    <View>
      <Text style={styles.stepDescription}>
        Review your request before sending it to Valera.
      </Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Credential Type</Text>
          <Text style={styles.reviewValue}>{config.label}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Attributes to Share</Text>
          <View>
            {selectedAttributeLabels.map((label, index) => (
              <Text key={index} style={styles.reviewAttributeItem}>
                • {label}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Presentation Type</Text>
          <Text style={styles.reviewValue}>SD-JWT</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Push content below the status bar so the header close button is touchable on Android
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0,
    backgroundColor: palette.background || '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  credentialCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  credentialCardPressed: {
    backgroundColor: '#f9f9f9',
  },
  credentialLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 4,
  },
  credentialDescription: {
    fontSize: 13,
    color: '#999',
  },
  attributesList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  attributeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  attributeLabel: {
    fontSize: 14,
    marginLeft: 12,
    color: palette.textPrimary,
  },
  selectedCount: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  reviewSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
    color: palette.textPrimary,
  },
  reviewAttributeItem: {
    fontSize: 14,
    color: palette.textPrimary,
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: palette.primary || '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.primary || '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: palette.primary || '#007AFF',
  },
  buttonPressed: {
    opacity: 0.6,
  },
});

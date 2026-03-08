import * as React from "react";
import { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking } from "react-native";

export default function Profile() {
    const requestCredentialFromValera = async () => {
        try {
            const callbackUrl = 'zkdappsurveyfrontend://auth';
            const valeraUrl = `asitplus-wallet://share?action=share&callback=${encodeURIComponent(callbackUrl)}&type=AgeVerification`;
            
            const canOpen = await Linking.canOpenURL(valeraUrl);
            
            if (!canOpen) {
                Alert.alert(
                    'Valera Not Installed',
                    'Valera wallet is not installed or not properly configured on this device.',
                    [{ text: 'OK' }]
                );
                return;
            }
            
            await Linking.openURL(valeraUrl);
            
        } catch (error: any) {
            console.error('Error requesting credential from Valera:', error);
            Alert.alert('Error', 'Failed to open Valera wallet: ' + (error?.message || 'Unknown error'));
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Test Features</Text>
                
                <Text style={styles.featureLabel}>Test Valera Integration</Text>
                <Text style={styles.description}>
                    Make sure Valera is running on the same device!
                </Text>
                
                <TouchableOpacity
                    style={styles.button}
                    onPress={requestCredentialFromValera}
                >
                    <Text style={styles.buttonText}>Request Credential from Valera</Text>
                </TouchableOpacity>
                
                <View style={styles.divider} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 20,
        color: '#333',
    },
    featureLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 24,
    },
});
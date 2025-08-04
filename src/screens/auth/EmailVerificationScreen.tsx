import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface EmailVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
    };
  };
}

export default function EmailVerificationScreen({ 
  navigation, 
  route 
}: EmailVerificationScreenProps) {
  const { theme } = useTheme();
  const { checkEmailVerification, resendVerificationEmail } = useAuth();
  const [isPolling, setIsPolling] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'waiting' | 'checking' | 'verified'>('waiting');
  const email = route.params?.email || '';

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isPolling) {
      // Poll every 2 seconds for email verification
      intervalId = setInterval(async () => {
        setVerificationStatus('checking');
        try {
          const isVerified = await checkEmailVerification();
          if (isVerified) {
            setVerificationStatus('verified');
            setIsPolling(false);
            // Navigate to guided first steps
            navigation.replace('GuidedSteps');
          } else {
            setVerificationStatus('waiting');
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
          setVerificationStatus('waiting');
        }
      }, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling, checkEmailVerification, navigation]);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await resendVerificationEmail(email);
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Email Sent", "We've sent you another verification email. Please check your inbox.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignUp = () => {
    setIsPolling(false);
    navigation.goBack();
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name="mail" 
              size={64} 
              color={verificationStatus === 'verified' ? '#10b981' : theme.colors.primary} 
            />
            {verificationStatus === 'checking' && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}
          </View>
          
          <Text style={styles.title}>
            {verificationStatus === 'verified' ? 'Email Verified!' : 'Check Your Email'}
          </Text>
          
          <Text style={styles.subtitle}>
            {verificationStatus === 'verified' 
              ? 'Your email has been successfully verified. Taking you to the next step...'
              : `We've sent a verification link to ${email}. Click the link in your email to continue.`
            }
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: theme.colors.primary }
            ]} />
            <Text style={styles.statusText}>Email sent</Text>
            <Ionicons name="checkmark" size={16} color="#10b981" />
          </View>
          
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot, 
              { 
                backgroundColor: verificationStatus === 'verified' ? '#10b981' : 
                                 verificationStatus === 'checking' ? theme.colors.primary : 
                                 theme.colors.border 
              }
            ]} />
            <Text style={[
              styles.statusText,
              verificationStatus === 'verified' && { color: '#10b981' }
            ]}>
              {verificationStatus === 'verified' ? 'Email verified' : 'Waiting for verification'}
            </Text>
            {verificationStatus === 'verified' && (
              <Ionicons name="checkmark" size={16} color="#10b981" />
            )}
            {verificationStatus === 'checking' && (
              <ActivityIndicator size={16} color={theme.colors.primary} />
            )}
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>What to do next:</Text>
          <Text style={styles.instructionText}>
            1. Check your email inbox (and spam folder)
          </Text>
          <Text style={styles.instructionText}>
            2. Click the verification link in the email
          </Text>
          <Text style={styles.instructionText}>
            3. Wait for automatic confirmation
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.resendButton, isResending && styles.buttonDisabled]}
            onPress={handleResendEmail}
            disabled={isResending}
          >
            {isResending ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                <Ionicons name="refresh" size={16} color={theme.colors.primary} />
                <Text style={styles.resendButtonText}>Resend Email</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToSignUp}
          >
            <Ionicons name="arrow-back" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.backButtonText}>Back to Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    iconContainer: {
      position: 'relative',
      marginBottom: 24,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 32,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    statusContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 32,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    instructions: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 32,
    },
    instructionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    instructionText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    actions: {
      gap: 16,
    },
    resendButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      gap: 8,
    },
    resendButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      gap: 8,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
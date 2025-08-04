import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface GuidedStepsScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

interface Step {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

const steps: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to BinQR!',
    subtitle: 'Organize your storage with ease',
    description: 'BinQR helps you keep track of all your stored items using QR codes. Never lose track of what\'s in your boxes again!',
    icon: 'cube',
    iconColor: '#2563eb',
  },
  {
    id: 'create-boxes',
    title: 'Create Your First Box',
    subtitle: 'Start organizing your items',
    description: 'Create virtual boxes for your physical storage containers. Add photos, descriptions, and tags to easily find items later.',
    icon: 'add-circle',
    iconColor: '#10b981',
  },
  {
    id: 'qr-codes',
    title: 'Generate QR Codes',
    subtitle: 'Link digital to physical',
    description: 'Each box gets a unique QR code that you can print and stick on your physical container. Scan it anytime to see what\'s inside!',
    icon: 'qr-code',
    iconColor: '#f59e0b',
  },
  {
    id: 'scan-find',
    title: 'Scan & Find',
    subtitle: 'Quick access to your items',
    description: 'Use the built-in scanner to quickly view box contents, add new items, or update existing ones. Finding things has never been easier!',
    icon: 'camera',
    iconColor: '#8b5cf6',
  },
];

export default function GuidedStepsScreen({ navigation }: GuidedStepsScreenProps) {
  const { theme } = useTheme();
  const { completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    // Navigation will be handled by AuthStack based on needsOnboarding state change
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicators */}
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
                index < currentStep && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Step content */}
        <View style={styles.stepContainer}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={currentStepData.icon}
              size={80}
              color={currentStepData.iconColor}
            />
          </View>

          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>
        </View>

        {/* Features highlight for first step */}
        {currentStep === 0 && (
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Organize with photos & tags</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Generate printable QR codes</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Quick scanning & search</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.featureText}>Never lose items again</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation controls */}
      <View style={styles.controls}>
        <View style={styles.topControls}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color={theme.colors.textSecondary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          {!isLastStep && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={isLastStep ? 'checkmark' : 'arrow-forward'}
            size={20}
            color="white"
          />
        </TouchableOpacity>
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
    },
    contentContainer: {
      flexGrow: 1,
      padding: 20,
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 40,
      gap: 8,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
    },
    progressDotActive: {
      backgroundColor: theme.colors.primary,
      width: 24,
    },
    progressDotCompleted: {
      backgroundColor: '#10b981',
    },
    stepContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    iconContainer: {
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    description: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: width - 80,
    },
    featuresContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginTop: 32,
      gap: 16,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    featureText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    controls: {
      padding: 20,
      paddingBottom: 40,
    },
    topControls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      minHeight: 32,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    skipButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    skipButtonText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      borderRadius: 8,
      gap: 8,
    },
    nextButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
  });
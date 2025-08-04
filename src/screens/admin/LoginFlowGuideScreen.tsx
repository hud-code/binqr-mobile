import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { LOGIN_FLOW_STEPS } from "../../lib/admin";

const { width } = Dimensions.get("window");

export default function LoginFlowGuideScreen() {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < LOGIN_FLOW_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepSelect = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = LOGIN_FLOW_STEPS[currentStep];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerText: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
    },
    subHeader: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 4,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    stepCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
      minHeight: 200,
      justifyContent: "center",
      alignItems: "center",
    },
    stepIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    stepNumber: {
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: theme.colors.accent || theme.colors.primary,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    stepNumberText: {
      color: "white",
      fontSize: 12,
      fontWeight: "bold",
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 12,
    },
    stepDescription: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },
    navigation: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    navButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    navButtonDisabled: {
      backgroundColor: theme.colors.disabled,
    },
    navButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    progressContainer: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    progressText: {
      textAlign: "center",
      color: theme.colors.textSecondary,
      fontSize: 14,
      marginBottom: 12,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      overflow: "hidden",
      marginBottom: 16,
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    stepIndicators: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
    stepDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.border,
    },
    stepDotActive: {
      backgroundColor: theme.colors.primary,
    },
    stepList: {
      maxHeight: 200,
    },
    stepListItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      backgroundColor: theme.colors.background,
    },
    stepListItemActive: {
      backgroundColor: theme.colors.primary + "20",
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    stepListText: {
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 12,
      flex: 1,
    },
    stepListNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    stepListNumberActive: {
      backgroundColor: theme.colors.primary,
    },
    stepListNumberText: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    stepListNumberTextActive: {
      color: "white",
    },
  });

  const progressPercentage = ((currentStep + 1) / LOGIN_FLOW_STEPS.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>First Login Flow Guide</Text>
        <Text style={styles.subHeader}>User Onboarding Experience Preview</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Step Display */}
        <View style={styles.stepCard}>
          <View style={styles.stepIcon}>
            <Ionicons 
              name={currentStepData.icon as any} 
              size={40} 
              color="white" 
            />
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
            </View>
          </View>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepDescription}>{currentStepData.description}</Text>
        </View>

        {/* Step List Overview */}
        <View style={[styles.stepCard, { paddingTop: 16 }]}>
          <Text style={[styles.stepTitle, { fontSize: 18, marginBottom: 16 }]}>
            All Flow Steps
          </Text>
          <ScrollView style={styles.stepList} showsVerticalScrollIndicator={false}>
            {LOGIN_FLOW_STEPS.map((step, index) => (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.stepListItem,
                  index === currentStep && styles.stepListItemActive
                ]}
                onPress={() => handleStepSelect(index)}
              >
                <View style={[
                  styles.stepListNumber,
                  index === currentStep && styles.stepListNumberActive
                ]}>
                  <Text style={[
                    styles.stepListNumberText,
                    index === currentStep && styles.stepListNumberTextActive
                  ]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={styles.stepListText}>{step.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {LOGIN_FLOW_STEPS.length}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <View style={styles.stepIndicators}>
          {LOGIN_FLOW_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                index <= currentStep && styles.stepDotActive
              ]}
            />
          ))}
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <Ionicons name="chevron-back" size={20} color="white" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, currentStep === LOGIN_FLOW_STEPS.length - 1 && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={currentStep === LOGIN_FLOW_STEPS.length - 1}
        >
          <Text style={styles.navButtonText}>Next</Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
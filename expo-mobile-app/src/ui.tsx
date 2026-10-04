import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ArrowRight,
  X,
  ChevronRight,
  CarFront,
  Check,
} from "lucide-react-native";
import { router } from "expo-router";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { tokens } from "@white-label/core";
export const C = tokens;
export function Screen({
  children,
  title,
  subtitle,
  back = false,
  right,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {back && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Înapoi"
              onPress={() => router.back()}
              style={s.back}
            >
              <ArrowLeft size={22} color={C.navy} />
            </Pressable>
          )}
          {!!title && (
            <View style={s.headingRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.h1}>{title}</Text>
                {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
              </View>
              {right}
            </View>
          )}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Txt({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <Text style={[s.text, style]}>{children}</Text>;
}
export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={s.label}>{children}</Text>;
}
export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}) {
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.card, style, pressed && { opacity: 0.8 }]}
    >
      {children}
    </Pressable>
  ) : (
    <View style={[s.card, style]}>{children}</View>
  );
}
export function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
  danger = false,
  icon,
}: {
  children: React.ReactNode;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  danger?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.buttonSecondary,
        danger && { backgroundColor: "#FCEDEF", borderColor: "#FCEDEF" },
        disabled && { opacity: 0.45 },
        pressed && { opacity: 0.85 },
      ]}
    >
      {icon}
      <Text
        style={[
          s.buttonText,
          secondary && { color: C.navy },
          danger && { color: C.red },
        ]}
      >
        {children}
      </Text>
      {!secondary && !danger && !icon && <ArrowRight size={17} color="white" />}
    </Pressable>
  );
}
export function Pill({
  label,
  tone = "blue",
}: {
  label: string;
  tone?: string;
}) {
  const color =
    tone === "green"
      ? C.green
      : tone === "red"
        ? C.red
        : tone === "orange"
          ? C.orange
          : tone === "gray"
            ? C.muted
            : C.blue;
  return (
    <View style={[s.pill, { backgroundColor: color + "12" }]}>
      <View
        style={{ width: 4, height: 4, borderRadius: 3, backgroundColor: color }}
      />
      <Text style={{ fontSize: 10, color, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}
export function SectionTitle({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View style={s.sectionTitle}>
      <Text style={s.h2}>{title}</Text>
      {!!action && (
        <Pressable accessibilityRole="button" onPress={onPress} style={s.row}>
          <Text style={s.link}>{action}</Text>
          <ChevronRight size={14} color={C.blue} />
        </Pressable>
      )}
    </View>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8, marginBottom: 15 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#A9B3C2"
        style={s.input}
        {...props}
      />
    </View>
  );
}
export function Sheet({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%", maxHeight: "90%" }}
        >
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeading}>
              <Text style={s.h2}>{title}</Text>
              <Pressable
                accessibilityLabel="Închide"
                onPress={onClose}
                hitSlop={12}
              >
                <X size={22} color={C.muted} />
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 25 }}
            >
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
export function Choice({
  title,
  subtitle,
  selected,
  onPress,
  icon,
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[s.choice, selected && s.choiceSelected]}
    >
      {icon && (
        <View style={[s.tile, selected && { backgroundColor: "#E4EDFF" }]}>
          {icon}
        </View>
      )}
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={[s.choiceTitle, selected && { color: C.blue }]}>
          {title}
        </Text>
        {!!subtitle && <Text style={s.small}>{subtitle}</Text>}
      </View>
      <View style={[s.radio, selected && { borderColor: C.blue }]}>
        {selected && <View style={s.radioDot} />}
      </View>
    </Pressable>
  );
}
export function Empty({
  title = "Nimic de afișat",
  text = "Informațiile tale vor apărea aici.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <View style={{ alignItems: "center", padding: 30, gap: 12 }}>
      <CarFront color="#A3B2C7" size={34} />
      <Text style={s.h2}>{title}</Text>
      <Text style={[s.small, { textAlign: "center", lineHeight: 21 }]}>
        {text}
      </Text>
    </View>
  );
}
export function CarArt({
  width = 190,
  color = "#DFE8F4",
}: {
  width?: number;
  color?: string;
}) {
  return (
    <Svg width={width} height={width * 0.48} viewBox="0 0 280 134">
      <Path
        d="M20 87 L27 65 Q30 57 49 55 L76 25 Q83 19 99 19 L162 19 Q176 19 184 28 L213 53 L249 59 Q260 62 262 72 L264 90 Q262 98 249 98 L28 98 Q17 96 20 87"
        fill={color}
      />
      <Path
        d="M87 29 L68 53 L125 53 L125 29 Z M135 29 L135 53 L200 53 L176 32 Q171 28 160 28 Z"
        fill="#55708E"
      />
      <Path
        d="M132 25 L132 90 M208 57 L211 86 M61 59 L58 87"
        stroke="#AFBED0"
        strokeWidth="2"
      />
      <Path
        d="M23 72 L45 72 L40 81 L21 81 M239 68 L260 72 L261 80 L236 77"
        fill="#F6F9FD"
      />
      <Rect x="141" y="59" width="13" height="3" rx="1.5" fill="#7790AD" />
      <Rect x="78" y="59" width="13" height="3" rx="1.5" fill="#7790AD" />
      <Path d="M21 88 H263" stroke="#A5B7CE" strokeWidth="4" />
      <Circle cx="68" cy="96" r="23" fill="#1B304B" />
      <Circle cx="68" cy="96" r="12" fill="#ADC0D8" />
      <Circle cx="68" cy="96" r="5" fill="#597490" />
      <Circle cx="217" cy="96" r="23" fill="#1B304B" />
      <Circle cx="217" cy="96" r="12" fill="#ADC0D8" />
      <Circle cx="217" cy="96" r="5" fill="#597490" />
    </Svg>
  );
}
export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.background },
  content: { padding: 23, paddingBottom: 35 },
  text: { color: C.navy, fontSize: 14, lineHeight: 22 },
  h1: { fontSize: 27, fontWeight: "700", color: C.navy, letterSpacing: -0.7 },
  h2: { fontSize: 17, fontWeight: "700", color: C.navy, letterSpacing: -0.3 },
  subtitle: { fontSize: 12, color: "#8996AA", lineHeight: 20, marginTop: 7 },
  small: { fontSize: 12, color: "#8291A7", lineHeight: 19 },
  label: {
    fontSize: 9,
    letterSpacing: 1.8,
    fontWeight: "700",
    color: "#8495AE",
    marginBottom: 10,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E6ECF4",
    borderRadius: 16,
    padding: 19,
    marginBottom: 13,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    minHeight: 51,
    backgroundColor: C.blue,
    borderColor: C.blue,
    borderWidth: 1,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    padding: 13,
  },
  buttonSecondary: { backgroundColor: "white", borderColor: "#DFE7F2" },
  buttonText: { color: "white", fontSize: 13, fontWeight: "600" },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  sectionTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 27,
    marginBottom: 15,
    gap: 8,
  },
  link: { fontSize: 11, fontWeight: "500", color: C.blue },
  input: {
    borderWidth: 1,
    borderColor: "#DDE6F1",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    color: C.navy,
    fontSize: 14,
    minHeight: 49,
  },
  fieldLabel: { fontSize: 12, color: "#7589A6", fontWeight: "500" },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#0E213B66",
  },
  sheet: {
    backgroundColor: "#F8FAFE",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 23,
    paddingBottom: 15,
    maxHeight: "100%",
  },
  sheetHandle: {
    alignSelf: "center",
    width: 35,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#DCE4EF",
    marginTop: -9,
    marginBottom: 21,
  },
  sheetHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  choice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 17,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E1E8F2",
    backgroundColor: "white",
    marginBottom: 11,
    minHeight: 76,
  },
  choiceSelected: { borderColor: "#7DA4F3", backgroundColor: "#F0F5FF" },
  choiceTitle: { color: C.navy, fontSize: 14, fontWeight: "600" },
  radio: {
    height: 18,
    width: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CFD9E6",
    justifyContent: "center",
    alignItems: "center",
  },
  radioDot: { height: 8, width: 8, borderRadius: 5, backgroundColor: C.blue },
  tile: {
    height: 42,
    width: 42,
    backgroundColor: "#F0F4FA",
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  back: { width: 37, height: 37, justifyContent: "center", marginBottom: 17 },
  divider: { height: 1, backgroundColor: "#E9EEF5", marginVertical: 16 },
  error: {
    fontSize: 12,
    lineHeight: 19,
    color: C.red,
    backgroundColor: "#FDEDF0",
    padding: 12,
    borderRadius: 9,
    marginVertical: 10,
  },
});

import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Platform, TextInput, Modal, ScrollView, KeyboardAvoidingView,
} from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import { useResenasStore } from "../store/resenasStore";
import { type Resena } from "../data/cafes";

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={size}
          color={i <= rating ? "#F4B942" : Colors.border}
        />
      ))}
    </View>
  );
}

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.starSelector}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} style={styles.starBtn}>
          <Ionicons
            name={i <= value ? "star" : "star-outline"}
            size={36}
            color={i <= value ? "#F4B942" : Colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const RATING_LABELS: Record<number, string> = {
  0: "Tocá para calificar",
  1: "Muy malo",
  2: "Regular",
  3: "Bueno",
  4: "Muy bueno",
  5: "Excelente",
};

export default function CafeResenas() {
  const insets = useSafeAreaInsets();
  const { id, cafeName, openForm } = useLocalSearchParams<{ id: string; cafeName: string; openForm?: string }>();

  const { getResenas, addResena } = useResenasStore();
  const storeResenas = getResenas(id ?? "");
  const [resenas, setResenas] = useState<Resena[]>(storeResenas);
  const [showForm, setShowForm] = useState(openForm === "1");

  // Form state
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(0);
  const [formText, setFormText] = useState("");
  const [formError, setFormError] = useState("");

  const promedio = resenas.length > 0
    ? (resenas.reduce((s, r) => s + r.rating, 0) / resenas.length).toFixed(1)
    : null;

  const resetForm = () => {
    setFormName("");
    setFormRating(0);
    setFormText("");
    setFormError("");
  };

  const handleSubmit = () => {
    if (!formName.trim()) return setFormError("Ingresá tu nombre.");
    if (formRating === 0) return setFormError("Elegí una calificación.");
    if (!formText.trim()) return setFormError("Escribí tu experiencia.");

    const nueva: Resena = {
      id: Date.now().toString(),
      name: formName.trim(),
      rating: formRating,
      text: formText.trim(),
      date: "Ahora mismo",
    };
    addResena(id ?? "", nueva);
    setResenas(prev => [nueva, ...prev]);
    resetForm();
    setShowForm(false);
  };

  const handleClose = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Reseñas</Text>
          <View style={{ width: 40 }} />
        </View>

        {resenas.length > 0 ? (
          <>
            {/* Resumen */}
            <View style={styles.summary}>
              <Text style={styles.avgNumber}>{promedio}</Text>
              <View style={styles.summaryRight}>
                <Stars rating={Math.round(Number(promedio))} size={18} />
                <Text style={styles.summaryCount}>
                  {resenas.length} reseña{resenas.length !== 1 ? "s" : ""}
                </Text>
                <Text style={styles.cafeName}>{cafeName}</Text>
              </View>
            </View>

            <FlatList
              data={resenas}
              keyExtractor={r => r.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarLetter}>{item.name[0].toUpperCase()}</Text>
                    </View>
                    <View style={styles.cardMeta}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.date}>{item.date}</Text>
                    </View>
                    <Stars rating={item.rating} />
                  </View>
                  <Text style={styles.text}>"{item.text}"</Text>
                </View>
              )}
              ListFooterComponent={
                <TouchableOpacity style={styles.writeBtn} onPress={() => setShowForm(true)}>
                  <Text style={styles.writeBtnText}>Escribir reseña</Text>
                </TouchableOpacity>
              }
            />
          </>
        ) : (
          /* Empty state */
          <View style={styles.emptyWrapper}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.secondary} />
            </View>
            <Text style={styles.emptyTitle}>Sin reseñas todavía</Text>
            <Text style={styles.emptyText}>
              Sé el primero en compartir tu experiencia en {cafeName ?? "este café"}.
            </Text>
            <TouchableOpacity style={styles.writeBtn} onPress={() => setShowForm(true)}>
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
              <Text style={styles.writeBtnText}>Escribir reseña</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal formulario */}
      <Modal visible={showForm} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleClose} />

          <View style={styles.modalSheet}>
            {/* Drag handle */}
            <View style={styles.handle} />

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Tu reseña</Text>
                {cafeName && <Text style={styles.modalCafe}>{cafeName}</Text>}

                {/* Selector estrellas */}
                <View style={styles.formGroup}>
                  <StarSelector value={formRating} onChange={setFormRating} />
                  <Text style={styles.ratingLabel}>{RATING_LABELS[formRating]}</Text>
                </View>

                {/* Nombre */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Tu nombre</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej. Valentina R."
                    placeholderTextColor={Colors.textLight}
                    value={formName}
                    onChangeText={setFormName}
                    maxLength={40}
                  />
                </View>

                {/* Texto */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Contá tu experiencia</Text>
                  <TextInput
                    style={[styles.input, styles.inputMulti]}
                    placeholder="¿Qué te pareció el café, el ambiente, el servicio?"
                    placeholderTextColor={Colors.textLight}
                    value={formText}
                    onChangeText={setFormText}
                    multiline
                    maxLength={300}
                    textAlignVertical="top"
                  />
                  <Text style={styles.charCount}>{formText.length}/300</Text>
                </View>

                {formError ? (
                  <Text style={styles.errorText}>{formError}</Text>
                ) : null}

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>Publicar reseña</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Platform.OS === "web" ? Colors.border : Colors.background, alignItems: "center" },
  container: { flex: 1, width: "100%", maxWidth: 430, backgroundColor: Colors.background },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: Colors.primary },

  // Summary
  summary: {
    flexDirection: "row", alignItems: "center", gap: 20,
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  avgNumber: { fontSize: 48, fontWeight: "700", color: Colors.primary, lineHeight: 56 },
  summaryRight: { gap: 6 },
  summaryCount: { fontSize: 14, color: Colors.textLight },
  cafeName: { fontSize: 14, fontWeight: "600", color: Colors.primary },

  // List
  list: { paddingHorizontal: 20, gap: 14, paddingBottom: 32 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16, padding: 16, gap: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  avatarLetter: { fontSize: 18, fontWeight: "700", color: Colors.white },
  cardMeta: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "700", color: Colors.text },
  date: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  text: { fontSize: 14, color: Colors.text, lineHeight: 22 },

  writeBtn: {
    alignItems: "center", justifyContent: "center",
    marginTop: 8, paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    width: "100%",
  },
  writeBtnText: { fontSize: 15, fontWeight: "700", color: Colors.white, textAlign: "center" },

  // Empty state
  emptyWrapper: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 40, gap: 16, paddingBottom: 60,
  },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.surfaceWarm,
    alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary },
  emptyText: { fontSize: 15, color: Colors.textLight, textAlign: "center", lineHeight: 24 },
  emptyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8,
  },
  emptyBtnText: { color: Colors.white, fontSize: 15, fontWeight: "600" },

  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  modalSheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center", marginTop: 12, marginBottom: 4,
  },
  modalContent: { paddingHorizontal: 24, paddingTop: 16, gap: 20, paddingBottom: 8 },
  modalTitle: { fontSize: 22, fontWeight: "700", color: Colors.primary, textAlign: "center" },
  modalCafe: { fontSize: 14, color: Colors.textLight, textAlign: "center", marginTop: -12 },

  // Form
  formGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600", color: Colors.text },
  starSelector: { flexDirection: "row", justifyContent: "center", gap: 8 },
  starBtn: { padding: 4 },
  ratingLabel: { textAlign: "center", fontSize: 14, color: Colors.textLight },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.text,
  },
  inputMulti: { height: 110, paddingTop: 12 },
  charCount: { fontSize: 12, color: Colors.textLight, textAlign: "right" },
  errorText: { fontSize: 13, color: Colors.error, textAlign: "center", marginTop: -8 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14, paddingVertical: 16, alignItems: "center",
  },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  cancelBtn: { alignItems: "center", paddingVertical: 12 },
  cancelBtnText: { fontSize: 15, color: Colors.textLight },
});

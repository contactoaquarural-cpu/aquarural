import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../utils/theme';

const CONFIGS = {
  success: { icon: 'check-circle',    bg: colors.primaryContainer,  text: colors.primary,  border: colors.primary  + '44' },
  error:   { icon: 'error',           bg: colors.errorContainer,    text: colors.error,    border: colors.error    + '44' },
  warning: { icon: 'warning',         bg: colors.tertiaryContainer, text: colors.tertiary, border: colors.tertiary + '44' },
  info:    { icon: 'info',            bg: colors.surfaceContainerHigh, text: colors.onSurface, border: colors.outline + '44' },
  confirm: { icon: 'help-outline',    bg: colors.surfaceContainerLow,  text: colors.onSurface, border: colors.outline + '44' },
};

// ─── Toast de notificación (success / error / warning / info) ────────────────
export const Toast = ({ visible, type = 'info', title, message, onDismiss, duration = 3000 }) => {
  const opacity   = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const config = CONFIGS[type] || CONFIGS.info;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity,    { toValue: 1, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      ]).start();

      if (type !== 'confirm' && duration > 0) {
        const t = setTimeout(() => onDismiss?.(), duration);
        return () => clearTimeout(t);
      }
    } else {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { backgroundColor: config.bg, borderColor: config.border, opacity, transform: [{ translateY }] }]}>
      <MaterialIcons name={config.icon} size={22} color={config.text} />
      <View style={styles.toastContent}>
        {title   ? <Text style={[styles.toastTitle,   { color: config.text }]}>{title}</Text>   : null}
        {message ? <Text style={[styles.toastMessage, { color: config.text + 'cc' }]}>{message}</Text> : null}
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <MaterialIcons name="close" size={18} color={config.text + '88'} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Modal de confirmación (reemplaza Alert con botones) ─────────────────────
export const ConfirmModal = ({ visible, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel, danger = false }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(opacity, { toValue: 1, useNativeDriver: true }),
        Animated.spring(scale,   { toValue: 1, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scale,   { toValue: 0.9, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity }]}>
      <Animated.View style={[styles.modal, { transform: [{ scale }] }]}>
        <View style={styles.modalIcon}>
          <MaterialIcons
            name={danger ? 'warning' : 'help-outline'}
            size={28}
            color={danger ? colors.tertiary : colors.primary}
          />
        </View>
        {title   ? <Text style={styles.modalTitle}>{title}</Text>   : null}
        {message ? <Text style={styles.modalMessage}>{message}</Text> : null}
        <View style={styles.modalBtns}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
            <Text style={styles.cancelBtnText}>{cancelText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, danger && styles.confirmBtnDanger]}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <Text style={[styles.confirmBtnText, danger && styles.confirmBtnTextDanger]}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Hook conveniente ─────────────────────────────────────────────────────────
export const useToast = () => {
  const [toast, setToast] = React.useState({ visible: false, type: 'info', title: '', message: '' });

  const show = (type, title, message, duration) =>
    setToast({ visible: true, type, title, message, duration });

  const hide = () => setToast((t) => ({ ...t, visible: false }));

  const toastProps = { ...toast, onDismiss: hide };

  return { show, hide, toastProps };
};

const styles = StyleSheet.create({
  toast: {
    position:          'absolute',
    top:               spacing.lg,
    left:              spacing.lg,
    right:             spacing.lg,
    flexDirection:     'row',
    alignItems:        'flex-start',
    gap:               spacing.sm,
    padding:           spacing.md,
    borderRadius:      radius.xl,
    borderWidth:       1,
    zIndex:            9999,
    elevation:         10,
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 4 },
    shadowOpacity:     0.3,
    shadowRadius:      8,
  },
  toastContent:  { flex: 1 },
  toastTitle:    { ...typography.bodyBold },
  toastMessage:  { ...typography.small, marginTop: 2 },

  overlay: {
    position:        'absolute',
    top:             0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#000000aa',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          9999,
    elevation:       10,
  },
  modal: {
    width:             '85%',
    backgroundColor:   colors.surfaceContainerLow,
    borderRadius:      radius.xxl,
    padding:           spacing.xl,
    alignItems:        'center',
    gap:               spacing.md,
  },
  modalIcon: {
    width:           56,
    height:          56,
    borderRadius:    radius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.xs,
  },
  modalTitle:   { ...typography.h2, textAlign: 'center' },
  modalMessage: { ...typography.body, textAlign: 'center', lineHeight: 22 },
  modalBtns:    { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, width: '100%' },
  cancelBtn: {
    flex:            1,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md,
    alignItems:      'center',
  },
  cancelBtnText:      { ...typography.bodyBold, color: colors.onSurfaceVariant },
  confirmBtn: {
    flex:            1,
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md,
    alignItems:      'center',
  },
  confirmBtnDanger:     { backgroundColor: colors.errorContainer },
  confirmBtnText:       { ...typography.bodyBold, color: colors.primary },
  confirmBtnTextDanger: { color: colors.error },
});

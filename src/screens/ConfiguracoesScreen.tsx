import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getQueueStatus } from '../services/offlineQueue';
import { sincronizarCompleto } from '../services/syncService';

export default function ConfiguracoesScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [status, setStatus] = useState(getQueueStatus());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getQueueStatus());
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const sincronizarAgora = async () => {
    setSyncing(true);
    try {
      await sincronizarCompleto();
    } finally {
      setSyncing(false);
      setStatus(getQueueStatus());
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Configurações</Text>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}> 
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Tema</Text>
          </View>
          <TouchableOpacity style={[styles.actionButton, { borderColor: theme.colors.primary }]} onPress={toggleTheme}>
            <Text style={[styles.actionText, { color: theme.colors.primary }]}>{isDark ? 'Claro' : 'Escuro'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
          Alterna entre tema claro e escuro.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}> 
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Ionicons name={status.isOnline ? 'wifi' : 'wifi-off'} size={20} color={status.isOnline ? theme.colors.success : theme.colors.error} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Sincronização</Text>
          </View>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            onPress={sincronizarAgora}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={[styles.actionText, { color: theme.colors.primary }]}>Sincronizar</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>Status: {status.isOnline ? 'Online' : 'Offline'}</Text>
        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>Pendências na fila: {status.pendingCount}</Text>
        {status.isSyncing ? (
          <Text style={[styles.helperText, { color: theme.colors.warning }]}>Sincronizando...</Text>
        ) : null}
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}> 
        <View style={styles.row}>
          <Ionicons name="information-circle" size={20} color={theme.colors.info} />
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Sobre</Text>
        </View>
        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>Gerenciamento de Fretes</Text>
        <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>Versão 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  helperText: { marginTop: 6, fontSize: 13 },
  actionButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  actionText: { fontWeight: '600' },
});

/** Dashboard inicial */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { EstatisticasFretes } from '../models/Frete';
import { calcularEstatisticas } from '../services/database';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }: any) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [stats, setStats] = useState<EstatisticasFretes>({
    totalFaturado: 0,
    quantidadeFretes: 0,
    freteMesAtual: 0,
    quantidadeMesAtual: 0,
    totalSaldo: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [valoresVisiveis, setValoresVisiveis] = useState(true);

  const carregar = async () => {
    try {
      const s = await calcularEstatisticas();
      setStats(s);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  const formatarMoeda = (v: number | undefined) => {
    if (!v && v !== 0) return 'R$ 0,00';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const renderValor = (valor: string) => {
    if (valoresVisiveis) {
      return valor;
    }
    return '••••••';
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} />}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Gestão de Fretes</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => setValoresVisiveis(!valoresVisiveis)} style={styles.eyeButton}>
              <Ionicons name={valoresVisiveis ? 'eye' : 'eye-off'} size={24} color={theme.colors.textOnPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={theme.colors.textOnPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 Totais Gerais</Text>
        <View style={[styles.cardBig, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="cash-outline" size={40} color={theme.colors.success} />
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Total Faturado</Text>
            <Text style={[styles.cardValueBig, { color: theme.colors.success, opacity: valoresVisiveis ? 1 : 0.3 }]}>
              {renderValor(formatarMoeda(stats.totalFaturado))}
            </Text>
          </View>
        </View>

        <View style={[styles.cardSmall, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="file-tray-full-outline" size={30} color={theme.colors.info} />
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Total de Fretes</Text>
            <Text style={[styles.cardValue, { color: theme.colors.info }]}>{stats.quantidadeFretes}</Text>
          </View>
        </View>

        <View style={[styles.cardMedium, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="wallet-outline" size={35} color={theme.colors.error} />
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Saldo Total a Receber</Text>
            <Text style={[styles.cardValueSaldo, { color: theme.colors.error, opacity: valoresVisiveis ? 1 : 0.3 }]}>
              {renderValor(formatarMoeda(stats.totalSaldo))}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📅 Mês Atual</Text>
        <View style={[styles.cardMedium, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="trending-up-outline" size={35} color={theme.colors.warning} />
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Faturado no Mês</Text>
            <Text style={[styles.cardValueMed, { color: theme.colors.warning, opacity: valoresVisiveis ? 1 : 0.3 }]}>
              {renderValor(formatarMoeda(stats.freteMesAtual))}
            </Text>
          </View>
        </View>

        <View style={[styles.cardSmall, { backgroundColor: theme.colors.card }]}>
          <Ionicons name="calendar-outline" size={30} color="#9C27B0" />
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>Fretes no Mês</Text>
            <Text style={[styles.cardValue, { color: theme.colors.info }]}>{stats.quantidadeMesAtual}</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  header: { padding: 20, paddingTop: 60, paddingBottom: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  eyeButton: { padding: 8 },
  themeButton: { padding: 8 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 16, color: '#E3F2FD', marginTop: 5 },
  section: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15 },
  cardBig: { borderRadius: 12, padding: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardMedium: { borderRadius: 12, padding: 18, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardSmall: { borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardContent: { marginLeft: 15, flex: 1 },
  cardLabel: { fontSize: 14, marginBottom: 5 },
  cardValueBig: { fontSize: 28, fontWeight: 'bold' },
  cardValueMed: { fontSize: 24, fontWeight: 'bold' },
  cardValue: { fontSize: 20, fontWeight: 'bold' },
  cardValueSaldo: { fontSize: 24, fontWeight: 'bold' },
});

/** Dashboard inicial */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { EstatisticasFretes } from '../models/Frete';
import { calcularEstatisticas } from '../services/database';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';

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
      showsVerticalScrollIndicator={false}
    >
      {/* Header com Gradiente */}
      <LinearGradient
        colors={[theme.colors.primary, '#7B68EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Gestão de Fretes</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => setValoresVisiveis(!valoresVisiveis)} style={styles.headerButton}>
              <Ionicons name={valoresVisiveis ? 'eye' : 'eye-off'} size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Total Faturado - Card Principal */}
        <Card gradient gradientColors={[theme.colors.success, '#84C82C']}>
          <View style={styles.mainCardContent}>
            <View>
              <Text style={styles.mainCardLabel}>Total Faturado</Text>
              <Text style={[styles.mainCardValue, { opacity: valoresVisiveis ? 1 : 0.4 }]}>
                {renderValor(formatarMoeda(stats.totalFaturado))}
              </Text>
            </View>
            <View style={styles.mainCardIcon}>
              <Ionicons name="cash" size={48} color="#FFFFFF" />
            </View>
          </View>
        </Card>

        {/* Seção Totais Gerais */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📊 Totais Gerais</Text>
        <View style={styles.gridContainer}>
          <Card style={styles.gridCard}>
            <View style={styles.smallCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="file-tray-full" size={24} color={theme.colors.info} />
              </View>
            </View>
            <Text style={[styles.smallCardLabel, { color: theme.colors.textSecondary }]}>Total de Fretes</Text>
            <Text style={[styles.smallCardValue, { color: theme.colors.info }]}>{stats.quantidadeFretes}</Text>
          </Card>

          <Card style={styles.gridCard}>
            <View style={styles.smallCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="wallet" size={24} color={theme.colors.error} />
              </View>
            </View>
            <Text style={[styles.smallCardLabel, { color: theme.colors.textSecondary }]}>Saldo a Receber</Text>
            <Text style={[styles.smallCardValue, { color: theme.colors.error, opacity: valoresVisiveis ? 1 : 0.4 }]}>
              {renderValor(formatarMoeda(stats.totalSaldo))}
            </Text>
          </Card>
        </View>

        {/* Seção Mês Atual */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>📅 Mês Atual</Text>
        <View style={styles.gridContainer}>
          <Card style={styles.gridCard}>
            <View style={styles.smallCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF08A' }]}>
                <Ionicons name="trending-up" size={24} color={theme.colors.warning} />
              </View>
            </View>
            <Text style={[styles.smallCardLabel, { color: theme.colors.textSecondary }]}>Faturado no Mês</Text>
            <Text style={[styles.smallCardValue, { color: theme.colors.warning, opacity: valoresVisiveis ? 1 : 0.4 }]}>
              {renderValor(formatarMoeda(stats.freteMesAtual))}
            </Text>
          </Card>

          <Card style={styles.gridCard}>
            <View style={styles.smallCardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#E9D5FF' }]}>
                <Ionicons name="calendar" size={24} color="#9333EA" />
              </View>
            </View>
            <Text style={[styles.smallCardLabel, { color: theme.colors.textSecondary }]}>Fretes no Mês</Text>
            <Text style={[styles.smallCardValue, { color: '#9333EA' }]}>{stats.quantidadeMesAtual}</Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerButtons: { flexDirection: 'row', gap: 12 },
  headerButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF20', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#FFFFFF90', marginTop: 6, fontWeight: '500' },
  content: { padding: 16 },
  mainCardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainCardLabel: { fontSize: 14, color: '#FFFFFF90', fontWeight: '500', marginBottom: 8 },
  mainCardValue: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 },
  mainCardIcon: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#FFFFFF20', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12, letterSpacing: -0.5 },
  gridContainer: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  gridCard: { flex: 1 },
  smallCardHeader: { marginBottom: 12 },
  iconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  smallCardLabel: { fontSize: 12, fontWeight: '500', marginBottom: 8, letterSpacing: 0.3 },
  smallCardValue: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
});


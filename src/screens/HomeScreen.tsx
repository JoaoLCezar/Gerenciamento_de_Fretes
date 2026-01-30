/** Dashboard inicial */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { EstatisticasFretes } from '../models/Frete';
import { calcularEstatisticas } from '../services/database';

export default function HomeScreen({ navigation }: any) {
  const [stats, setStats] = useState<EstatisticasFretes>({
    totalFaturado: 0,
    quantidadeFretes: 0,
    freteMesAtual: 0,
    quantidadeMesAtual: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const formatarMoeda = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); carregar(); }} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Gestão de Fretes</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Totais Gerais</Text>
        <View style={styles.cardBig}>
          <Ionicons name="cash-outline" size={40} color="#4CAF50" />
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Total Faturado</Text>
            <Text style={styles.cardValueBig}>{formatarMoeda(stats.totalFaturado)}</Text>
          </View>
        </View>

        <View style={styles.cardSmall}>
          <Ionicons name="file-tray-full-outline" size={30} color="#2196F3" />
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Total de Fretes</Text>
            <Text style={styles.cardValue}>{stats.quantidadeFretes}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Mês Atual</Text>
        <View style={styles.cardMedium}>
          <Ionicons name="trending-up-outline" size={35} color="#FF9800" />
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Faturado no Mês</Text>
            <Text style={styles.cardValueMed}>{formatarMoeda(stats.freteMesAtual)}</Text>
          </View>
        </View>

        <View style={styles.cardSmall}>
          <Ionicons name="calendar-outline" size={30} color="#9C27B0" />
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Fretes no Mês</Text>
            <Text style={styles.cardValue}>{stats.quantidadeMesAtual}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('NovoFrete')}>
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <Text style={styles.btnPrimaryText}>Novo Frete</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('ListaFretes')}>
          <Ionicons name="list" size={24} color="#007AFF" />
          <Text style={styles.btnSecondaryText}>Ver Todos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 60, paddingBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 16, color: '#E3F2FD', marginTop: 5 },
  section: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 15 },
  cardBig: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardMedium: { backgroundColor: '#FFF', borderRadius: 12, padding: 18, marginBottom: 15, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardSmall: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  cardContent: { marginLeft: 15, flex: 1 },
  cardLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  cardValueBig: { fontSize: 28, fontWeight: 'bold', color: '#4CAF50' },
  cardValueMed: { fontSize: 24, fontWeight: 'bold', color: '#FF9800' },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#2196F3' },
  actions: { padding: 15, gap: 10 },
  btnPrimary: { backgroundColor: '#007AFF', borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnPrimaryText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  btnSecondary: { backgroundColor: '#FFF', borderRadius: 12, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 2, borderColor: '#007AFF' },
  btnSecondaryText: { color: '#007AFF', fontSize: 18, fontWeight: '600' },
});

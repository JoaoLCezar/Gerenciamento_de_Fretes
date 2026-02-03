import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Frete } from '../models/Frete';
import { listarFretes } from '../services/database';
import { obterTextoStatus, obterCorStatus } from '../utils/statusHelper';
import { useTheme } from '../context/ThemeContext';

export default function ListaFretesScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = async () => {
    try {
      const dados = await listarFretes();
      setFretes(dados);
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

  const formatarData = (dataISO: string | undefined) => {
    if (!dataISO) return 'Data indefinida';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const renderItem = ({ item }: { item: Frete }) => {
    const titulo = item.titulo || `${item.origem} -> ${item.destino}`;
    return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() => navigation.navigate('DetalheFrete', { freteId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{titulo}</Text>
        <View style={[styles.badge, { backgroundColor: obterCorStatus(item.statusPagamento) }]}>
          <Text style={styles.badgeText}>{obterTextoStatus(item.statusPagamento)}</Text>
        </View>
      </View>
      <Text style={[styles.cardRoute, { color: theme.colors.textSecondary }]}>{`${item.origem} -> ${item.destino}`}</Text>
      <Text style={[styles.cardDate, { color: theme.colors.textSecondary }]}>{item.data ? formatarData(item.data) : 'Data indefinida'}</Text>
      <Text style={[styles.cardValue, { color: theme.colors.primary }]}>{formatarMoeda(item.valorTotal)}</Text>
      {item.adiantamento ? (
        <Text style={[styles.cardInfo, { color: theme.colors.textSecondary }]}>Adiantamento: {formatarMoeda(item.adiantamento)}</Text>
      ) : null}
      {item.saldo ? (
        <Text style={[styles.cardInfo, { color: theme.colors.textSecondary }]}>Saldo: {formatarMoeda(item.saldo)}</Text>
      ) : null}
      {item.observacoes ? <Text style={[styles.cardObs, { color: theme.colors.text }]}>{item.observacoes}</Text> : null}
    </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Carregando fretes...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={fretes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={fretes.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              carregar();
            }}
          />
        }
        ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>Nenhum frete cadastrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 16 },
  listContent: { padding: 12, paddingBottom: 30 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16 },
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  cardRoute: { marginTop: 4, fontSize: 13 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cardDate: { marginTop: 6, fontSize: 13 },
  cardValue: { marginTop: 8, fontSize: 18, fontWeight: 'bold' },
  cardInfo: { marginTop: 4, fontSize: 13 },
  cardObs: { marginTop: 6, fontSize: 14 },
});

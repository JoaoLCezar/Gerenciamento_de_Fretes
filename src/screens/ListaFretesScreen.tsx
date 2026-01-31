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
import { Ionicons } from '@expo/vector-icons';
import { Frete } from '../models/Frete';
import { listarFretes } from '../services/database';

export default function ListaFretesScreen({ navigation }: any) {
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

  const renderItem = ({ item }: { item: Frete }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('DetalheFrete', { freteId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{`${item.origem} -> ${item.destino}`}</Text>
      </View>
      <Text style={styles.cardDate}>{item.data ? formatarData(item.data) : 'Data indefinida'}</Text>
      <Text style={styles.cardValue}>{formatarMoeda(item.valor)}</Text>
      {item.observacoes ? <Text style={styles.cardObs}>{item.observacoes}</Text> : null}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando fretes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('NovoFrete')}>
          <Ionicons name="add" size={22} color="#FFF" />
          <Text style={styles.btnPrimaryText}>Novo frete</Text>
        </TouchableOpacity>
      </View>

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
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum frete cadastrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  loadingText: { marginTop: 8, color: '#666', fontSize: 16 },
  actions: { flexDirection: 'row', gap: 10, padding: 12 },
  btnPrimary: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  listContent: { padding: 12, paddingBottom: 30 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#777', fontSize: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  cardDate: { marginTop: 6, color: '#666', fontSize: 13 },
  cardValue: { marginTop: 8, fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  cardObs: { marginTop: 6, color: '#555', fontSize: 14 },
});

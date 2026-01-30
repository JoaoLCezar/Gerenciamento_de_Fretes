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
import { sincronizarCompleto } from '../services/syncService';

export default function ListaFretesScreen({ navigation }: any) {
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

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

  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const sincronizar = async () => {
    setSyncing(true);
    await sincronizarCompleto();
    await carregar();
    setSyncing(false);
  };

  const renderItem = ({ item }: { item: Frete }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{`${item.origem} -> ${item.destino}`}</Text>
        <View style={[styles.badge, item.synced ? styles.badgeOk : styles.badgeWarn]}>
          <Text style={styles.badgeText}>{item.synced ? 'Sincronizado' : 'Offline'}</Text>
        </View>
      </View>
      <Text style={styles.cardDate}>{item.data}</Text>
      <Text style={styles.cardValue}>{formatarMoeda(item.valor)}</Text>
      {item.observacoes ? <Text style={styles.cardObs}>{item.observacoes}</Text> : null}
    </View>
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
        <TouchableOpacity
          style={[styles.btnSecondary, syncing && styles.btnSecondaryDisabled]}
          onPress={sincronizar}
          disabled={syncing}
        >
          {syncing ? <ActivityIndicator size="small" color="#007AFF" /> : <Ionicons name="cloud-done" size={20} color="#007AFF" />}
          <Text style={styles.btnSecondaryText}>{syncing ? 'Sincronizando...' : 'Sincronizar'}</Text>
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
  btnSecondary: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  btnSecondaryDisabled: { opacity: 0.6 },
  btnSecondaryText: { color: '#007AFF', fontWeight: '600', fontSize: 14 },
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeOk: { backgroundColor: '#E8F5E9' },
  badgeWarn: { backgroundColor: '#FFF3E0' },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#333' },
  cardDate: { marginTop: 6, color: '#666', fontSize: 13 },
  cardValue: { marginTop: 8, fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  cardObs: { marginTop: 6, color: '#555', fontSize: 14 },
});

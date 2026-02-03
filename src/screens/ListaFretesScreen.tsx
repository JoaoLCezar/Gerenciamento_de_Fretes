import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Frete, StatusPagamento } from '../models/Frete';
import { listarFretes } from '../services/database';
import { obterTextoStatus, obterCorStatus } from '../utils/statusHelper';
import { useTheme } from '../context/ThemeContext';

type TipoOrdenacao = 'recente' | 'antigo' | 'maiorValor' | 'menorValor';

export default function ListaFretesScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [fretes, setFretes] = useState<Frete[]>([]);
  const [fretesFiltrados, setFretesFiltrados] = useState<Frete[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filtros
  const [busca, setBusca] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<StatusPagamento | 'todos'>('todos');
  const [ordenacao, setOrdenacao] = useState<TipoOrdenacao>('recente');

  const carregar = async () => {
    try {
      const dados = await listarFretes();
      setFretes(dados);
      aplicarFiltros(dados, busca, statusFiltro, ordenacao);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const aplicarFiltros = (
    data: Frete[],
    textoBusca: string,
    status: StatusPagamento | 'todos',
    ordem: TipoOrdenacao
  ) => {
    let resultado = [...data];

    // Filtro de busca por texto
    if (textoBusca.trim()) {
      const termo = textoBusca.toLowerCase();
      resultado = resultado.filter(
        (f) =>
          f.titulo?.toLowerCase().includes(termo) ||
          f.origem?.toLowerCase().includes(termo) ||
          f.destino?.toLowerCase().includes(termo)
      );
    }

    // Filtro por status de pagamento
    if (status !== 'todos') {
      resultado = resultado.filter((f) => f.statusPagamento === status);
    }

    // Ordenação
    switch (ordem) {
      case 'recente':
        resultado.sort((a, b) => {
          const dataA = a.data ? new Date(a.data).getTime() : 0;
          const dataB = b.data ? new Date(b.data).getTime() : 0;
          return dataB - dataA;
        });
        break;
      case 'antigo':
        resultado.sort((a, b) => {
          const dataA = a.data ? new Date(a.data).getTime() : 0;
          const dataB = b.data ? new Date(b.data).getTime() : 0;
          return dataA - dataB;
        });
        break;
      case 'maiorValor':
        resultado.sort((a, b) => (b.valorTotal || 0) - (a.valorTotal || 0));
        break;
      case 'menorValor':
        resultado.sort((a, b) => (a.valorTotal || 0) - (b.valorTotal || 0));
        break;
    }

    setFretesFiltrados(resultado);
  };

  const handleBuscaChange = (texto: string) => {
    setBusca(texto);
    aplicarFiltros(fretes, texto, statusFiltro, ordenacao);
  };

  const handleStatusChange = (status: StatusPagamento | 'todos') => {
    setStatusFiltro(status);
    aplicarFiltros(fretes, busca, status, ordenacao);
  };

  const handleOrdenacaoChange = (ordem: TipoOrdenacao) => {
    setOrdenacao(ordem);
    aplicarFiltros(fretes, busca, statusFiltro, ordem);
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

  const FilterChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
      style={[
        styles.chip,
        { 
          backgroundColor: active ? theme.colors.primary : theme.colors.card,
          borderColor: active ? theme.colors.primary : theme.colors.border,
        }
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: active ? theme.colors.textOnPrimary : theme.colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Barra de busca */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Buscar por título, origem ou destino..."
          placeholderTextColor={theme.colors.textSecondary}
          value={busca}
          onChangeText={handleBuscaChange}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => handleBuscaChange('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros de Status */}
      <View style={styles.filtersSection}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <FilterChip label="Todos" active={statusFiltro === 'todos'} onPress={() => handleStatusChange('todos')} />
          <FilterChip label="Pendente" active={statusFiltro === 'pendente'} onPress={() => handleStatusChange('pendente')} />
          <FilterChip label="Adiantamento" active={statusFiltro === 'adiantamento_pago'} onPress={() => handleStatusChange('adiantamento_pago')} />
          <FilterChip label="Pago" active={statusFiltro === 'pago'} onPress={() => handleStatusChange('pago')} />
        </ScrollView>
      </View>

      {/* Ordenação */}
      <View style={styles.filtersSection}>
        <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Ordenar:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <FilterChip label="Mais recente" active={ordenacao === 'recente'} onPress={() => handleOrdenacaoChange('recente')} />
          <FilterChip label="Mais antigo" active={ordenacao === 'antigo'} onPress={() => handleOrdenacaoChange('antigo')} />
          <FilterChip label="Maior valor" active={ordenacao === 'maiorValor'} onPress={() => handleOrdenacaoChange('maiorValor')} />
          <FilterChip label="Menor valor" active={ordenacao === 'menorValor'} onPress={() => handleOrdenacaoChange('menorValor')} />
        </ScrollView>
      </View>

      {/* Contador de resultados */}
      <View style={styles.resultadosContainer}>
        <Text style={[styles.resultadosText, { color: theme.colors.textSecondary }]}>
          {fretesFiltrados.length} {fretesFiltrados.length === 1 ? 'frete' : 'fretes'}
        </Text>
      </View>

      <FlatList
        data={fretesFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={fretesFiltrados.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              carregar();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {busca || statusFiltro !== 'todos' ? 'Nenhum frete encontrado com os filtros aplicados' : 'Nenhum frete cadastrado'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filtersSection: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  chipsContainer: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultadosContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resultadosText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: { padding: 12, paddingTop: 4, paddingBottom: 30 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 40,
    gap: 12,
  },
  emptyText: { fontSize: 16, textAlign: 'center' },
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

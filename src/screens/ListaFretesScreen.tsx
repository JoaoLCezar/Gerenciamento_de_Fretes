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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Frete, StatusPagamento } from '../models/Frete';
import { listarFretes } from '../services/database';
import { obterTextoStatus, obterCorStatus } from '../utils/statusHelper';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import CustomInput from '../components/CustomInput';

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

  const getStatusColor = (status: StatusPagamento) => {
    switch (status) {
      case 'pendente':
        return '#FEE2E2';
      case 'adiantamento_pago':
        return '#FEF08A';
      case 'pago':
        return '#DCFCE7';
      default:
        return theme.colors.surface;
    }
  };

  const renderItem = ({ item }: { item: Frete }) => {
    const titulo = item.titulo || `${item.origem} -> ${item.destino}`;
    return (
      <Card style={styles.fretesCard}>
        <TouchableOpacity
          onPress={() => navigation.navigate('DetalheFrete', { freteId: item.id })}
          activeOpacity={0.6}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]} numberOfLines={1}>
                {titulo}
              </Text>
              <Text style={[styles.cardRoute, { color: theme.colors.textSecondary }]}>
                {`${item.origem} → ${item.destino}`}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusColor(item.statusPagamento) }]}>
              <Text style={[styles.badgeText, { color: obterCorStatus(item.statusPagamento) }]}>
                {obterTextoStatus(item.statusPagamento)}
              </Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.footerLeft}>
              <View style={styles.footerItem}>
                <Ionicons name="calendar" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                  {formatarData(item.data)}
                </Text>
              </View>
            </View>
            <Text style={[styles.cardValue, { color: theme.colors.success }]}>
              {formatarMoeda(item.valorTotal)}
            </Text>
          </View>
        </TouchableOpacity>
      </Card>
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
        active && styles.chipActive,
        { 
          backgroundColor: active ? theme.colors.primary : theme.colors.surface,
          borderColor: theme.colors.border,
        }
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: active ? '#FFFFFF' : theme.colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, '#7B68EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>Fretes</Text>
      </LinearGradient>

      {/* Barra de busca */}
      <View style={styles.searchSection}>
        <CustomInput
          placeholder="Buscar fretes..."
          value={busca}
          onChangeText={handleBuscaChange}
          icon="search"
        />
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
        <Ionicons name="filter" size={16} color={theme.colors.textSecondary} />
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
              {busca || statusFiltro !== 'todos' ? 'Nenhum frete encontrado' : 'Nenhum frete cadastrado'}
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
  headerGradient: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1 },
  searchSection: { paddingHorizontal: 12, paddingVertical: 8 },
  filtersSection: { paddingHorizontal: 12, paddingBottom: 12 },
  filterLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, letterSpacing: 0.3 },
  chipsContainer: { flexDirection: 'row', paddingVertical: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  chipActive: { elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
  chipText: { fontSize: 13, fontWeight: '600' },
  resultadosContainer: { paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultadosText: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 30 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, fontWeight: '500', marginTop: 16, textAlign: 'center' },
  fretesCard: { marginBottom: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.5 },
  cardRoute: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  footerLeft: { flexDirection: 'row', gap: 12 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, fontWeight: '500' },
  cardValue: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '700' },
});

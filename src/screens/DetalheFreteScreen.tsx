import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Frete } from '../models/Frete';
import { buscarFretePorId } from '../services/database';
import { deletarFreteComFila } from '../services/offlineQueue';
import { obterTextoStatus, obterCorStatus } from '../utils/statusHelper';
import { useTheme } from '../context/ThemeContext';

export default function DetalheFreteScreen({ route, navigation }: any) {
  const { theme } = useTheme();
  const { freteId } = route.params;
  const [frete, setFrete] = useState<Frete | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const formatarData = (dataISO: string | undefined) => {
    if (!dataISO) return 'Data indefinida';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarMoeda = (v: number | undefined) => {
    if (!v && v !== 0) return 'R$ 0,00';
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const carregar = async () => {
    try {
      const dados = await buscarFretePorId(freteId);
      setFrete(dados);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar o frete.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [freteId])
  );

  const excluir = () => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja deletar este frete?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deletarFreteComFila(freteId);
              // Sucesso silencioso
              navigation.goBack();
            } catch (err) {
              console.warn('Erro ao deletar frete (será sincronizado depois):', err);
              navigation.goBack();
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Carregando frete...</Text>
      </View>
    );
  }

  if (!frete) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Frete não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <View style={styles.routeContainer}>
          <Text style={[styles.routeText, { color: theme.colors.text }]}>{frete.origem}</Text>
          <Ionicons name="arrow-forward" size={24} color={theme.colors.primary} style={styles.arrow} />
          <Text style={[styles.routeText, { color: theme.colors.text }]}>{frete.destino}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.cardSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Status de Pagamento</Text>
          <View style={[styles.statusBadge, { backgroundColor: obterCorStatus(frete.statusPagamento) }]}>
            <Text style={styles.statusText}>{obterTextoStatus(frete.statusPagamento)}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

        <View style={styles.cardSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Data do Frete</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{frete.data ? formatarData(frete.data) : 'Data indefinida'}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

        <View style={styles.cardSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Origem</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{frete.origem}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

        <View style={styles.cardSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Destino</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{frete.destino}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

        <View style={styles.cardSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Valor Total</Text>
          <Text style={[styles.value, styles.valueMoney, { color: theme.colors.primary }]}>{formatarMoeda(frete.valorTotal)}</Text>
        </View>

        {frete.adiantamento ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            <View style={styles.cardSection}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Adiantamento</Text>
              <Text style={[styles.value, styles.valueInfo, { color: theme.colors.success }]}>{formatarMoeda(frete.adiantamento)}</Text>
            </View>
          </>
        ) : null}

        {frete.saldo ? (
          <>
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            <View style={styles.cardSection}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Saldo Restante</Text>
              <Text style={[styles.value, styles.valueInfo, { color: theme.colors.success }]}>{formatarMoeda(frete.saldo)}</Text>
            </View>
          </>
        ) : null}

        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
        <View style={styles.cardSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Falta Receber</Text>
          <Text style={[styles.value, styles.valuePending, { color: theme.colors.error }]}>
            {formatarMoeda(frete.valorTotal - (frete.adiantamento || 0) - (frete.saldo || 0))}
          </Text>
        </View>

        {frete.observacoes && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
            <View style={styles.cardSection}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Observações</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{frete.observacoes}</Text>
            </View>
          </>
        )}

        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

        <View style={styles.cardSection}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>ID do Frete</Text>
          <Text style={[styles.value, styles.valueSmall, { color: theme.colors.textSecondary }]}>{frete.id}</Text>
        </View>
      </View>

      <View style={[styles.timestamps, { backgroundColor: theme.colors.card }]}>
        <View style={styles.timestampItem}>
          <Text style={[styles.timestampLabel, { color: theme.colors.textSecondary }]}>Criado em:</Text>
          <Text style={[styles.timestampValue, { color: theme.colors.textSecondary }]}>
            {frete.createdAt ? new Date(frete.createdAt).toLocaleString('pt-BR') : 'N/A'}
          </Text>
        </View>
        <View style={styles.timestampItem}>
          <Text style={[styles.timestampLabel, { color: theme.colors.textSecondary }]}>Atualizado em:</Text>
          <Text style={[styles.timestampValue, { color: theme.colors.textSecondary }]}>
            {frete.updatedAt ? new Date(frete.updatedAt).toLocaleString('pt-BR') : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btnEdit, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('EditarFrete', { freteId })}
        >
          <Ionicons name="pencil" size={20} color={theme.colors.primary} />
          <Text style={[styles.btnEditText, { color: theme.colors.primary }]}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btnDelete, { backgroundColor: theme.colors.error }]} onPress={excluir} disabled={deleting}>
          {deleting ? (
            <ActivityIndicator size="small" color={theme.colors.textOnPrimary} />
          ) : (
            <>
              <Ionicons name="trash" size={20} color={theme.colors.textOnPrimary} />
              <Text style={[styles.btnDeleteText, { color: theme.colors.textOnPrimary }]}>Deletar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
  },
  header: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  routeText: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  arrow: {
    marginHorizontal: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardSection: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  valueMoney: {
    fontSize: 20,
    fontWeight: '700',
  },
  valueInfo: {
    fontSize: 18,
    fontWeight: '600',
  },
  valuePending: {
    fontSize: 18,
    fontWeight: '700',
  },
  valueSmall: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  timestamps: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  timestampItem: {
    marginBottom: 12,
  },
  timestampLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  timestampValue: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  btnEdit: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    elevation: 2,
  },
  btnEditText: {
    fontWeight: '700',
    fontSize: 16,
  },
  btnDelete: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  btnDeleteText: {
    fontWeight: '700',
    fontSize: 16,
  },
});

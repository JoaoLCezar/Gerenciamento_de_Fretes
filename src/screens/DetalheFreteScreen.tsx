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

export default function DetalheFreteScreen({ route, navigation }: any) {
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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando frete...</Text>
      </View>
    );
  }

  if (!frete) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Frete não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.routeContainer}>
          <Text style={styles.routeText}>{frete.origem}</Text>
          <Ionicons name="arrow-forward" size={24} color="#007AFF" style={styles.arrow} />
          <Text style={styles.routeText}>{frete.destino}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardSection}>
          <Text style={styles.label}>Data do Frete</Text>
          <Text style={styles.value}>{frete.data ? formatarData(frete.data) : 'Data indefinida'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardSection}>
          <Text style={styles.label}>Origem</Text>
          <Text style={styles.value}>{frete.origem}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardSection}>
          <Text style={styles.label}>Destino</Text>
          <Text style={styles.value}>{frete.destino}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardSection}>
          <Text style={styles.label}>Valor Total</Text>
          <Text style={[styles.value, styles.valueMoney]}>{formatarMoeda(frete.valorTotal)}</Text>
        </View>

        {frete.adiantamento ? (
          <>
            <View style={styles.divider} />
            <View style={styles.cardSection}>
              <Text style={styles.label}>Adiantamento</Text>
              <Text style={[styles.value, styles.valueInfo]}>{formatarMoeda(frete.adiantamento)}</Text>
            </View>
          </>
        ) : null}

        {frete.saldo ? (
          <>
            <View style={styles.divider} />
            <View style={styles.cardSection}>
              <Text style={styles.label}>Saldo Restante</Text>
              <Text style={[styles.value, styles.valueInfo]}>{formatarMoeda(frete.saldo)}</Text>
            </View>
          </>
        ) : null}

        {frete.observacoes && (
          <>
            <View style={styles.divider} />
            <View style={styles.cardSection}>
              <Text style={styles.label}>Observações</Text>
              <Text style={styles.value}>{frete.observacoes}</Text>
            </View>
          </>
        )}

        <View style={styles.divider} />

        <View style={styles.cardSection}>
          <Text style={styles.label}>ID do Frete</Text>
          <Text style={[styles.value, styles.valueSmall]}>{frete.id}</Text>
        </View>
      </View>

      <View style={styles.timestamps}>
        <View style={styles.timestampItem}>
          <Text style={styles.timestampLabel}>Criado em:</Text>
          <Text style={styles.timestampValue}>
            {frete.createdAt ? new Date(frete.createdAt).toLocaleString('pt-BR') : 'N/A'}
          </Text>
        </View>
        <View style={styles.timestampItem}>
          <Text style={styles.timestampLabel}>Atualizado em:</Text>
          <Text style={styles.timestampValue}>
            {frete.updatedAt ? new Date(frete.updatedAt).toLocaleString('pt-BR') : 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnEdit}
          onPress={() => navigation.navigate('EditarFrete', { freteId })}
        >
          <Ionicons name="pencil" size={20} color="#007AFF" />
          <Text style={styles.btnEditText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnDelete} onPress={excluir} disabled={deleting}>
          {deleting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="trash" size={20} color="#FFF" />
              <Text style={styles.btnDeleteText}>Deletar</Text>
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
    backgroundColor: '#F5F5F5',
    padding: 12,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
  },
  header: {
    backgroundColor: '#FFF',
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
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  arrow: {
    marginHorizontal: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  card: {
    backgroundColor: '#FFF',
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
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  valueMoney: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  valueInfo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#28A745',
  },
  valueSmall: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  timestamps: {
    backgroundColor: '#FFF',
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
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  timestampValue: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  btnEdit: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    elevation: 2,
  },
  btnEditText: {
    color: '#007AFF',
    fontWeight: '700',
    fontSize: 16,
  },
  btnDelete: {
    flex: 1,
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  btnDeleteText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

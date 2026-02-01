import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { buscarFretePorId } from '../services/database';
import { atualizarFreteComFila } from '../services/offlineQueue';

export default function EditarFreteScreen({ route, navigation }: any) {
  const { freteId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [data, setData] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [adiantamento, setAdiantamento] = useState('');
  const [saldo, setSaldo] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const formatarData = (d: Date) => {
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const formatarDataISO = (d: Date) => {
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${ano}-${mes}-${dia}`;
  };

  const parseDataISO = (dataISO: string): Date => {
    const [ano, mes, dia] = dataISO.split('-');
    return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
  };

  const carregar = async () => {
    try {
      const frete = await buscarFretePorId(freteId);
      if (!frete) {
        Alert.alert('Erro', 'Frete não encontrado');
        navigation.goBack();
        return;
      }

      setData(parseDataISO(frete.data));
      setOrigem(frete.origem);
      setDestino(frete.destino);
      setValorTotal(frete.valorTotal.toString().replace('.', ','));
      setAdiantamento(frete.adiantamento ? frete.adiantamento.toString().replace('.', ',') : '');
      setSaldo(frete.saldo ? frete.saldo.toString().replace('.', ',') : '');
      setObservacoes(frete.observacoes || '');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar o frete');
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

  const salvar = async () => {
    if (!data || !origem || !destino || !valorTotal) {
      Alert.alert('Campos obrigatórios', 'Preencha data, origem, destino e valor total.');
      return;
    }

    const valorTotalNumber = parseFloat(valorTotal.replace(',', '.'));
    if (Number.isNaN(valorTotalNumber)) {
      Alert.alert('Valor inválido', 'Informe o valor total usando números.');
      return;
    }

    let adiantamentoNumber = 0;
    if (adiantamento.trim()) {
      adiantamentoNumber = parseFloat(adiantamento.replace(',', '.'));
      if (Number.isNaN(adiantamentoNumber)) {
        Alert.alert('Valor inválido', 'Informe o adiantamento usando números.');
        return;
      }
    }

    let saldoNumber = 0;
    if (saldo.trim()) {
      saldoNumber = parseFloat(saldo.replace(',', '.'));
      if (Number.isNaN(saldoNumber)) {
        Alert.alert('Valor inválido', 'Informe o saldo usando números.');
        return;
      }
    }

    // Calcular saldo automaticamente se não for informado
    if (!saldo.trim() && adiantamento.trim()) {
      saldoNumber = valorTotalNumber - adiantamentoNumber;
    }

    setSaving(true);
    try {
      const dadosAtualizados: any = {
        data: formatarDataISO(data),
        origem,
        destino,
        valorTotal: valorTotalNumber,
      };

      if (adiantamentoNumber > 0) {
        dadosAtualizados.adiantamento = adiantamentoNumber;
      }
      if (saldoNumber > 0) {
        dadosAtualizados.saldo = saldoNumber;
      }
      if (observacoes.trim()) {
        dadosAtualizados.observacoes = observacoes.trim();
      }

      await atualizarFreteComFila(freteId, dadosAtualizados);
      navigation.goBack();
    } catch (err) {
      console.warn('Erro ao atualizar frete (será sincronizado depois):', err);
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando frete...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Editar frete</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Data (DD/MM/AAAA)</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateInput]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={data ? styles.dateText : styles.datePlaceholder}>
              {data ? formatarData(data) : 'Selecionar data'}
            </Text>
            <Ionicons name="calendar" size={20} color="#007AFF" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={data ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selectedDate) => {
                if (Platform.OS !== 'ios') setShowDatePicker(false);
                if (selectedDate) setData(selectedDate);
              }}
            />
          )}
          {showDatePicker && Platform.OS === 'ios' ? (
            <TouchableOpacity style={styles.dateDone} onPress={() => setShowDatePicker(false)}>
              <Text style={styles.dateDoneText}>OK</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.inline}>
          <View style={[styles.field, styles.inlineItem]}>
            <Text style={styles.label}>Origem</Text>
            <TextInput style={styles.input} placeholder="Cidade origem" value={origem} onChangeText={setOrigem} />
          </View>
          <View style={[styles.field, styles.inlineItem]}>
            <Text style={styles.label}>Destino</Text>
            <TextInput style={styles.input} placeholder="Cidade destino" value={destino} onChangeText={setDestino} />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Valor Total</Text>
          <TextInput
            style={styles.input}
            placeholder="1500,00"
            keyboardType="decimal-pad"
            value={valorTotal}
            onChangeText={setValorTotal}
          />
        </View>

        <View style={styles.inline}>
          <View style={[styles.field, styles.inlineItem]}>
            <Text style={styles.label}>Adiantamento (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="500,00"
              keyboardType="decimal-pad"
              value={adiantamento}
              onChangeText={setAdiantamento}
            />
          </View>
          <View style={[styles.field, styles.inlineItem]}>
            <Text style={styles.label}>Saldo (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="1000,00"
              keyboardType="decimal-pad"
              value={saldo}
              onChangeText={setSaldo}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Opcional"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.button, styles.btnCancel]} 
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Ionicons name="close" size={22} color="#666" />
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.btnSave]} 
            onPress={salvar} 
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : <Ionicons name="checkmark" size={22} color="#FFF" />}
            <Text style={styles.btnSaveText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F5F5F5', flexGrow: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  loadingText: { marginTop: 8, color: '#666', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, color: '#333' },
  field: { marginBottom: 12 },
  label: { marginBottom: 6, color: '#555', fontWeight: '600' },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { color: '#333', fontSize: 16 },
  datePlaceholder: { color: '#999', fontSize: 16 },
  dateDone: {
    marginTop: 8,
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateDoneText: { color: '#FFF', fontWeight: '700' },
  inline: { flexDirection: 'row', gap: 10 },
  inlineItem: { flex: 1 },
  textArea: { height: 100, textAlignVertical: 'top' },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnCancel: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#DDD',
  },
  btnCancelText: { color: '#666', fontWeight: '700', fontSize: 16 },
  btnSave: {
    backgroundColor: '#007AFF',
  },
  btnSaveText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});

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
import { calcularStatusPagamento } from '../utils/statusHelper';
import { useTheme } from '../context/ThemeContext';

export default function EditarFreteScreen({ route, navigation }: any) {
  const { theme } = useTheme();
  const { freteId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [data, setData] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [titulo, setTitulo] = useState('');
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
      setTitulo(frete.titulo || `${frete.origem} -> ${frete.destino}`);
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
    if (!titulo || !data || !origem || !destino || !valorTotal) {
      Alert.alert('Campos obrigatórios', 'Preencha titulo, data, origem, destino e valor total.');
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

    setSaving(true);
    try {
      const dadosAtualizados: any = {
        titulo: titulo.trim(),
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

      // Calcular status de pagamento
      dadosAtualizados.statusPagamento = calcularStatusPagamento(
        valorTotalNumber,
        adiantamentoNumber > 0 ? adiantamentoNumber : undefined,
        saldoNumber > 0 ? saldoNumber : undefined
      );

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
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Carregando frete...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Editar frete</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Título</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
            placeholder="Ex: Entrega São Paulo"
            placeholderTextColor={theme.colors.placeholder}
            value={titulo}
            onChangeText={setTitulo}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Data (DD/MM/AAAA)</Text>
          <TouchableOpacity
            style={[styles.input, styles.dateInput, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder }]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Text style={data ? [styles.dateText, { color: theme.colors.text }] : [styles.datePlaceholder, { color: theme.colors.placeholder }]}>
              {data ? formatarData(data) : 'Selecionar data'}
            </Text>
            <Ionicons name="calendar" size={20} color={theme.colors.primary} />
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
            <TouchableOpacity style={[styles.dateDone, { backgroundColor: theme.colors.primary }]} onPress={() => setShowDatePicker(false)}>
              <Text style={[styles.dateDoneText, { color: theme.colors.textOnPrimary }]}>OK</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.inline}>
          <View style={[styles.field, styles.inlineItem]}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Origem</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
              placeholder="Cidade origem"
              placeholderTextColor={theme.colors.placeholder}
              value={origem} 
              onChangeText={setOrigem} 
            />
          </View>
          <View style={[styles.field, styles.inlineItem]}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Destino</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
              placeholder="Cidade destino"
              placeholderTextColor={theme.colors.placeholder}
              value={destino} 
              onChangeText={setDestino} 
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Valor Total</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
            placeholder="1500,00"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="decimal-pad"
            value={valorTotal}
            onChangeText={setValorTotal}
          />
        </View>

        <View style={styles.inline}>
          <View style={[styles.field, styles.inlineItem]}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Adiantamento (opcional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
              placeholder="500,00"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="decimal-pad"
              value={adiantamento}
              onChangeText={setAdiantamento}
            />
          </View>
          <View style={[styles.field, styles.inlineItem]}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Saldo (opcional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
              placeholder="1000,00"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="decimal-pad"
              value={saldo}
              onChangeText={setSaldo}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: theme.colors.inputBackground, borderColor: theme.colors.inputBorder, color: theme.colors.text }]}
            placeholder="Opcional"
            placeholderTextColor={theme.colors.placeholder}
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={[styles.button, styles.btnCancel, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]} 
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            <Text style={[styles.btnCancelText, { color: theme.colors.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.btnSave, { backgroundColor: theme.colors.primary }]} 
            onPress={salvar} 
            disabled={saving}
          >
            {saving ? <ActivityIndicator color={theme.colors.textOnPrimary} /> : <Ionicons name="checkmark" size={22} color={theme.colors.textOnPrimary} />}
            <Text style={[styles.btnSaveText, { color: theme.colors.textOnPrimary }]}>{saving ? 'Salvando...' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, fontSize: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: '600' },
  input: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  dateInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { fontSize: 16 },
  datePlaceholder: { fontSize: 16 },
  dateDone: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dateDoneText: { fontWeight: '700' },
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
    borderWidth: 2,
  },
  btnCancelText: { fontWeight: '700', fontSize: 16 },
  btnSave: {},
  btnSaveText: { fontWeight: '700', fontSize: 16 },
});

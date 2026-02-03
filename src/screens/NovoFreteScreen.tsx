import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { criarFreteComFila } from '../services/offlineQueue';
import { calcularStatusPagamento } from '../utils/statusHelper';
import { useTheme } from '../context/ThemeContext';

export default function NovoFreteScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [data, setData] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [adiantamento, setAdiantamento] = useState('');
  const [saldo, setSaldo] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

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

  const salvar = async () => {
    if (!titulo || !data || !origem || !destino || !valorTotal) {
      Alert.alert('Campos obrigatorios', 'Preencha titulo, data, origem, destino e valor total.');
      return;
    }

    const valorTotalNumber = parseFloat(valorTotal.replace(',', '.'));
    if (Number.isNaN(valorTotalNumber)) {
      Alert.alert('Valor invalido', 'Informe o valor total usando numeros.');
      return;
    }

    let adiantamentoNumber = 0;
    if (adiantamento.trim()) {
      adiantamentoNumber = parseFloat(adiantamento.replace(',', '.'));
      if (Number.isNaN(adiantamentoNumber)) {
        Alert.alert('Valor invalido', 'Informe o adiantamento usando numeros.');
        return;
      }
    }

    let saldoNumber = 0;
    if (saldo.trim()) {
      saldoNumber = parseFloat(saldo.replace(',', '.'));
      if (Number.isNaN(saldoNumber)) {
        Alert.alert('Valor invalido', 'Informe o saldo usando numeros.');
        return;
      }
    }

    setSaving(true);
    try {
      const freteData: any = {
        titulo: titulo.trim(),
        data: formatarDataISO(data),
        origem,
        destino,
        valorTotal: valorTotalNumber,
        createdAt: Date.now(),
      };
      if (adiantamentoNumber > 0) {
        freteData.adiantamento = adiantamentoNumber;
      }
      if (saldoNumber > 0) {
        freteData.saldo = saldoNumber;
      }
      if (observacoes.trim()) {
        freteData.observacoes = observacoes.trim();
      }
      
      // Calcular status de pagamento
      freteData.statusPagamento = calcularStatusPagamento(
        valorTotalNumber,
        adiantamentoNumber > 0 ? adiantamentoNumber : undefined,
        saldoNumber > 0 ? saldoNumber : undefined
      );
      
      await criarFreteComFila(freteData);
      // Sucesso silencioso - sem Alert
      setOrigem('');
      setDestino('');
      setValorTotal('');
      setAdiantamento('');
      setSaldo('');
      setObservacoes('');
      setData(null);
      setTitulo('');
      navigation.navigate('ListaFretes');
    } catch (err) {
      // Erro silencioso - salvo na fila mesmo assim
      console.warn('Erro ao salvar frete (será sincronizado depois):', err);
      navigation.navigate('ListaFretes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Cadastrar frete</Text>

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
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Observacoes</Text>
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

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={salvar} disabled={saving}>
          {saving ? <ActivityIndicator color={theme.colors.textOnPrimary} /> : <Ionicons name="save" size={22} color={theme.colors.textOnPrimary} />}
          <Text style={[styles.buttonText, { color: theme.colors.textOnPrimary }]}>{saving ? 'Salvando...' : 'Salvar frete'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1 },
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
  button: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { fontWeight: '700', fontSize: 16 },
});

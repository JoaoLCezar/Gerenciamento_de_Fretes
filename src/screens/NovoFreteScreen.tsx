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
import { criarFrete } from '../services/database';

export default function NovoFreteScreen({ navigation }: any) {
  const [data, setData] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [valor, setValor] = useState('');
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
    if (!data || !origem || !destino || !valor) {
      Alert.alert('Campos obrigatorios', 'Preencha data, origem, destino e valor.');
      return;
    }

    const valorNumber = parseFloat(valor.replace(',', '.'));
    if (Number.isNaN(valorNumber)) {
      Alert.alert('Valor invalido', 'Informe o valor usando numeros.');
      return;
    }

    setSaving(true);
    try {
      await criarFrete({
        data: formatarDataISO(data),
        origem,
        destino,
        valor: valorNumber,
        observacoes: observacoes.trim() || undefined,
      });
      navigation.navigate('ListaFretes');
    } catch (err) {
      Alert.alert('Erro', 'Nao foi possivel salvar o frete.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Cadastrar frete</Text>

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
          <Text style={styles.label}>Valor</Text>
          <TextInput
            style={styles.input}
            placeholder="1500,00"
            keyboardType="decimal-pad"
            value={valor}
            onChangeText={setValor}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Observacoes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Opcional"
            value={observacoes}
            onChangeText={setObservacoes}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={salvar} disabled={saving}>
          {saving ? <ActivityIndicator color="#FFF" /> : <Ionicons name="save" size={22} color="#FFF" />}
          <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Salvar frete'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#F5F5F5', flexGrow: 1 },
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
  button: {
    marginTop: 10,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});

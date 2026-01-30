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
import { criarFrete } from '../services/database';

export default function NovoFreteScreen({ navigation }: any) {
  const [data, setData] = useState('');
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [valor, setValor] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

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
        data,
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
          <Text style={styles.label}>Data (AAAA-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="2024-05-10"
            value={data}
            onChangeText={setData}
            autoCapitalize="none"
          />
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

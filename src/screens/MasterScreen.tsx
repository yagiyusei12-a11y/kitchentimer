import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TimerMaster } from '../types';

interface MasterScreenProps {
  masters: TimerMaster[];
  onAddMaster: (name: string, durationSeconds: number) => void;
  onDeleteMaster: (id: string) => void;
  onNavigateToList: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}秒`;
  if (s === 0) return `${m}分`;
  return `${m}分${s}秒`;
}

export default function MasterScreen({
  masters,
  onAddMaster,
  onDeleteMaster,
  onNavigateToList,
}: MasterScreenProps) {
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');

  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('入力エラー', 'メニュー名を入力してください');
      return;
    }

    const min = parseInt(minutes, 10) || 0;
    const sec = parseInt(seconds, 10) || 0;

    if (min < 0 || sec < 0 || sec >= 60) {
      Alert.alert('入力エラー', '分は0以上、秒は0〜59で入力してください');
      return;
    }

    const totalSeconds = min * 60 + sec;
    if (totalSeconds <= 0) {
      Alert.alert('入力エラー', 'タイマー時間は1秒以上にしてください');
      return;
    }

    onAddMaster(trimmedName, totalSeconds);
    setName('');
    setMinutes('0');
    setSeconds('0');
  };

  const handleDelete = (item: TimerMaster) => {
    Alert.alert(
      '削除確認',
      `「${item.name}」を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => onDeleteMaster(item.id),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>マスタ設定</Text>
        <TouchableOpacity style={styles.navButton} onPress={onNavigateToList}>
          <Text style={styles.navButtonText}>タイマー画面へ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>新規メニュー追加</Text>

          <Text style={styles.label}>メニュー名</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="例：唐揚げ"
            placeholderTextColor="#888"
          />

          <Text style={styles.label}>調理時間</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <TextInput
                style={styles.timeInput}
                value={minutes}
                onChangeText={(t) => setMinutes(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={styles.timeUnit}>分</Text>
            </View>
            <View style={styles.timeField}>
              <TextInput
                style={styles.timeInput}
                value={seconds}
                onChangeText={(t) => {
                  const n = t.replace(/[^0-9]/g, '');
                  if (n === '' || parseInt(n, 10) <= 59) setSeconds(n);
                }}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeUnit}>秒</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>追加する</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>登録済みメニュー（{masters.length}件）</Text>

        <FlatList
          data={masters}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.masterRow}>
              <View style={styles.masterInfo}>
                <Text style={styles.masterName}>{item.name}</Text>
                <Text style={styles.masterDuration}>{formatDuration(item.duration)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
              >
                <Text style={styles.deleteButtonText}>削除</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>メニューがありません</Text>
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#16213e',
    borderBottomWidth: 2,
    borderBottomColor: '#e94560',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  navButton: {
    backgroundColor: '#e94560',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  addSection: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 8,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#0f3460',
    color: '#fff',
    fontSize: 22,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#533483',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  timeField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#533483',
    paddingHorizontal: 12,
  },
  timeInput: {
    flex: 1,
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    paddingVertical: 16,
    textAlign: 'center',
  },
  timeUnit: {
    fontSize: 24,
    color: '#e94560',
    fontWeight: 'bold',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#533483',
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 6,
    borderLeftColor: '#e94560',
  },
  masterInfo: {
    flex: 1,
  },
  masterName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  masterDuration: {
    fontSize: 20,
    color: '#e94560',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#c0392b',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    marginLeft: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

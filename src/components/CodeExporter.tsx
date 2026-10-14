import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Smartphone,
  FolderTree,
  Terminal,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

export const CodeExporter: React.FC = () => {
  const [platform, setPlatform] = useState<'flutter' | 'react-native'>('flutter');
  const [activeFile, setActiveFile] = useState<string>('main');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // FLUTTER CODE SNIPPETS
  const flutterFiles: Record<string, { filename: string; path: string; code: string; desc: string }> = {
    main: {
      filename: 'main.dart',
      path: 'lib/main.dart',
      desc: 'ไฟล์หลักของแอปพลิเคชัน จัดการ Navigation Bar 3 แท็บ (BMI, VCR Tracker, History)',
      code: `import 'package:flutter/material.dart';
import 'screens/bmi_screen.dart';
import 'screens/vcr_tracker_screen.dart';
import 'screens/history_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FitTrackApp());
}

class FitTrackApp extends StatelessWidget {
  const FitTrackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FitTrack BMI & VCR 30-Min',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.teal,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        fontFamily: 'Prompt', // แนะนำติดตั้งฟอนต์ Prompt ใน pubspec.yaml
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  double _userWeight = 65.0; // เก็บน้ำหนักผู้ใช้สำหรับคำนวณแคลอรี

  @override
  Widget build(BuildContext context) {
    final screens = [
      BmiScreen(
        onWeightUpdated: (weight) {
          setState(() => _userWeight = weight);
        },
      ),
      VcrTrackerScreen(userWeight: _userWeight),
      const HistoryScreen(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.monitor_weight_outlined),
            selectedIcon: Icon(Icons.monitor_weight),
            label: 'คำนวณ BMI',
          ),
          NavigationDestination(
            icon: Icon(Icons.timer_outlined),
            selectedIcon: Icon(Icons.timer),
            label: 'วิ่ง VCR 30 นาที',
          ),
          NavigationDestination(
            icon: Icon(Icons.history_outlined),
            selectedIcon: Icon(Icons.history),
            label: 'ประวัติการวิ่ง',
          ),
        ],
      ),
    );
  }
}`,
    },
    bmi: {
      filename: 'bmi_screen.dart',
      path: 'lib/screens/bmi_screen.dart',
      desc: 'หน้าจอคำนวณค่า BMI พร้อมเกณฑ์เอเชีย/ไทย คำแนะนำอาหารและการออกกำลังกาย',
      code: `import 'package:flutter/material.dart';

class BmiScreen extends StatefulWidget {
  final ValueChanged<double>? onWeightUpdated;
  const BmiScreen({super.key, this.onWeightUpdated});

  @override
  State<BmiScreen> createState() => _BmiScreenState();
}

class _BmiScreenState extends State<BmiScreen> {
  final _weightController = TextEditingController(text: '65.0');
  final _heightController = TextEditingController(text: '170.0');

  double? _bmi;
  String _category = '';
  Color _categoryColor = Colors.grey;
  String _recommendation = '';

  void _calculateBmi() {
    final weight = double.tryParse(_weightController.text) ?? 0.0;
    final height = double.tryParse(_heightController.text) ?? 0.0;

    if (weight <= 0 || height <= 0) return;

    widget.onWeightUpdated?.call(weight);

    final heightM = height / 100.0;
    final bmi = weight / (heightM * heightM);

    String cat;
    Color color;
    String rec;

    // เกณฑ์เอเชีย (กระทรวงสาธารณสุขไทย)
    if (bmi < 18.5) {
      cat = 'ผอม / น้ำหนักน้อยกว่าเกณฑ์';
      color = Colors.lightBlue;
      rec = 'ควรเพิ่มอาหารที่มีโปรตีนและพลังงานสูง เสริมสร้างกล้ามเนื้อด้วยเวทเทรนนิ่ง';
    } else if (bmi <= 22.9) {
      cat = 'ปกติ / สมส่วน (สุขภาพดี)';
      color = Colors.green;
      rec = 'ยอดเยี่ยม! รักษาสมดุลอาหารครบ 5 หมู่ และออกกำลังกายวิ่ง VCR 30 นาทีสม่ำเสมอ';
    } else if (bmi <= 24.9) {
      cat = 'ท้วม / น้ำหนักเกินเกณฑ์';
      color = Colors.orange;
      rec = 'ควรควบคุมพลังงานอาหาร ลดหวานมันเค็ม และวิ่งคาร์ดิโอสัปดาห์ละ 3-4 ครั้ง';
    } else {
      cat = 'อ้วน / ดัชนีมวลกายสูง';
      color = Colors.redAccent;
      rec = 'ควรเริ่มปรับพฤติกรรม ควบคุมแคลอรี และเดินเร็วหรือวิ่งแบบลดแรงกระแทก';
    }

    setState(() {
      _bmi = bmi;
      _category = cat;
      _categoryColor = color;
      _recommendation = rec;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('คำนวณดัชนีมวลกาย (BMI)'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  children: [
                    TextField(
                      controller: _weightController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        labelText: 'น้ำหนักตัว (กิโลกรัม)',
                        suffixText: 'kg',
                        prefixIcon: Icon(Icons.scale, color: Colors.teal),
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (_) => _calculateBmi(),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _heightController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        labelText: 'ส่วนสูง (เซนติเมตร)',
                        suffixText: 'cm',
                        prefixIcon: Icon(Icons.height, color: Colors.teal),
                        border: OutlineInputBorder(),
                      ),
                      onChanged: (_) => _calculateBmi(),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _calculateBmi,
                      icon: const Icon(Icons.calculate),
                      label: const Text('คำนวณค่า BMI'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 24),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            if (_bmi != null) ...[
              const SizedBox(height: 20),
              Card(
                color: _categoryColor.withOpacity(0.12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                  side: BorderSide(color: _categoryColor, width: 2),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      const Text('ค่าดัชนีมวลกายของคุณ', style: TextStyle(color: Colors.grey)),
                      Text(
                        _bmi!.toStringAsFixed(1),
                        style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: _categoryColor),
                      ),
                      Text(
                        _category,
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: _categoryColor),
                      ),
                      const Divider(height: 30),
                      Text(
                        _recommendation,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 14, height: 1.5),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}`,
    },
    vcr: {
      filename: 'vcr_tracker_screen.dart',
      path: 'lib/screens/vcr_tracker_screen.dart',
      desc: 'หน้าจับเวลาวิ่ง VCR 30 นาที เริ่ม/พัก/จบ คำนวณระยะทางและแคลอรี พร้อมบันทึก SQLite/SharedPreferences',
      code: `import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class VcrTrackerScreen extends StatefulWidget {
  final double userWeight;
  const VcrTrackerScreen({super.key, required this.userWeight});

  @override
  State<VcrTrackerScreen> createState() => _VcrTrackerScreenState();
}

class _VcrTrackerScreenState extends State<VcrTrackerScreen> {
  static const int targetSeconds = 30 * 60; // 30 นาที = 1800 วินาที

  Timer? _timer;
  int _secondsElapsed = 0;
  bool _isRunning = false;
  double _distanceKm = 0.0;
  double _simulatedSpeedKmh = 9.0; // 9.0 km/h = pace 6:40

  void _startTimer() {
    setState(() => _isRunning = true);
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _secondsElapsed++;
        // จำลองระยะทางที่วิ่งได้ (สามารถต่อ GPS ด้วย package geolocator)
        _distanceKm += (_simulatedSpeedKmh / 3600.0);
      });
    });
  }

  void _pauseTimer() {
    _timer?.cancel();
    setState(() => _isRunning = false);
  }

  void _stopAndSave() async {
    _pauseTimer();
    if (_secondsElapsed < 5) return;

    // คำนวณแคลอรี: MET * Weight * Hours (วิ่ง 9 km/h ประมาณ MET 8.8)
    final hours = _secondsElapsed / 3600.0;
    final calories = 8.8 * widget.userWeight * hours;

    // บันทึกลง SharedPreferences (หรือ sqflite)
    final prefs = await SharedPreferences.getInstance();
    final List<String> runs = prefs.getStringList('vcr_runs') ?? [];

    final newRun = {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'date': DateTime.now().toIso8601String(),
      'durationSeconds': _secondsElapsed,
      'distanceKm': double.parse(_distanceKm.toStringAsFixed(2)),
      'calories': calories.round(),
      'completed30Min': _secondsElapsed >= targetSeconds,
    };

    runs.insert(0, jsonEncode(newRun));
    await prefs.setStringList('vcr_runs', runs);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('บันทึกการวิ่ง VCR 30 นาทีเรียบร้อยแล้ว!')),
      );
      setState(() {
        _secondsElapsed = 0;
        _distanceKm = 0.0;
      });
    }
  }

  String _formatTime(int sec) {
    final m = (sec ~/ 60).toString().padLeft(2, '0');
    final s = (sec % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hours = _secondsElapsed > 0 ? _secondsElapsed / 3600.0 : 0.001;
    final calories = (8.8 * widget.userWeight * hours).round();

    return Scaffold(
      appBar: AppBar(
        title: const Text('VCR 30-Minute Run Tracker'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // วงกลมจับเวลา
              Container(
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.teal, width: 8),
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(color: Colors.teal.withOpacity(0.2), blurRadius: 16),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('เวลาที่วิ่ง', style: TextStyle(color: Colors.grey)),
                    Text(
                      _formatTime(_secondsElapsed),
                      style: const TextStyle(fontSize: 44, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                    ),
                    Text(
                      _secondsElapsed >= targetSeconds ? '✓ ครบ 30 นาทีแล้ว' : 'เป้าหมาย 30:00 นาที',
                      style: TextStyle(
                        fontSize: 12,
                        color: _secondsElapsed >= targetSeconds ? Colors.green : Colors.grey,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 30),
              // สถิติระยะทางและแคลอรี
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _statItem('ระยะทาง', '\${_distanceKm.toStringAsFixed(2)} km', Icons.navigation),
                  _statItem('แคลอรี', '$calories kcal', Icons.local_fire_department),
                ],
              ),
              const SizedBox(height: 40),
              // ปุ่มควบคุม Start / Pause / Stop
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (!_isRunning)
                    ElevatedButton.icon(
                      onPressed: _startTimer,
                      icon: const Icon(Icons.play_arrow),
                      label: const Text('เริ่มวิ่ง (Start)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      ),
                    )
                  else
                    ElevatedButton.icon(
                      onPressed: _pauseTimer,
                      icon: const Icon(Icons.pause),
                      label: const Text('พักชั่วคราว (Pause)'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber[800],
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      ),
                    ),
                  const SizedBox(width: 16),
                  ElevatedButton.icon(
                    onPressed: _secondsElapsed > 0 ? _stopAndSave : null,
                    icon: const Icon(Icons.stop),
                    label: const Text('สิ้นสุดและบันทึก'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.teal, size: 28),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }
}`,
    },
    pubspec: {
      filename: 'pubspec.yaml',
      path: 'pubspec.yaml',
      desc: 'ไฟล์ระบุ Dependency ของ Flutter (shared_preferences, geolocator)',
      code: `name: fittrack_vcr_app
description: "A cross-platform BMI & VCR 30-Minute Run Tracker App"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  shared_preferences: ^2.2.2  # สำหรับ Local Storage ในเครื่อง
  geolocator: ^10.1.0         # สำหรับ GPS พื้นฐาน (iOS/Android)
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true`,
    },
  };

  // REACT NATIVE CODE SNIPPETS
  const rnFiles: Record<string, { filename: string; path: string; code: string; desc: string }> = {
    main: {
      filename: 'App.tsx',
      path: 'App.tsx',
      desc: 'ไฟล์หลัก React Native (Expo) พร้อม Navigation Tabs',
      code: `import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import BmiScreen from './screens/BmiScreen';
import VcrTrackerScreen from './screens/VcrTrackerScreen';
import HistoryScreen from './screens/HistoryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [userWeight, setUserWeight] = useState<number>(65);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any = 'fitness-outline';
            if (route.name === 'BMI') iconName = focused ? 'speedometer' : 'speedometer-outline';
            else if (route.name === 'VCR 30-Min') iconName = focused ? 'timer' : 'timer-outline';
            else if (route.name === 'ประวัติ') iconName = focused ? 'time' : 'time-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#0d9488',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="BMI" options={{ title: 'คำนวณ BMI' }}>
          {() => <BmiScreen onWeightChange={setUserWeight} />}
        </Tab.Screen>
        <Tab.Screen name="VCR 30-Min" options={{ title: 'วิ่ง VCR 30 นาที' }}>
          {() => <VcrTrackerScreen userWeight={userWeight} />}
        </Tab.Screen>
        <Tab.Screen name="ประวัติ" component={HistoryScreen} options={{ title: 'ประวัติการวิ่ง' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}`,
    },
    bmi: {
      filename: 'BmiScreen.tsx',
      path: 'screens/BmiScreen.tsx',
      desc: 'คอมโพเนนต์คำนวณค่า BMI พร้อมบอกเกณฑ์น้ำหนักและคำแนะนำสุขภาพ',
      code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function BmiScreen({ onWeightChange }: { onWeightChange: (w: number) => void }) {
  const [weight, setWeight] = useState('65');
  const [height, setHeight] = useState('170');
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [color, setColor] = useState('#0d9488');

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h) return;

    onWeightChange(w);
    const hm = h / 100;
    const val = w / (hm * hm);
    setBmi(parseFloat(val.toFixed(1)));

    // เกณฑ์เอเชีย
    if (val < 18.5) {
      setCategory('ผอม / น้ำหนักต่ำกว่าเกณฑ์');
      setColor('#0284c7');
    } else if (val <= 22.9) {
      setCategory('ปกติ / สมส่วน (สุขภาพดี)');
      setColor('#10b981');
    } else if (val <= 24.9) {
      setCategory('ท้วม / น้ำหนักเกินเกณฑ์');
      setColor('#f59e0b');
    } else {
      setCategory('อ้วน / เสี่ยงต่อโรคเมตาบอลิก');
      setColor('#ef4444');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>คำนวณค่าดัชนีมวลกาย (BMI)</Text>
      
      <View style={styles.card}>
        <Text style={styles.label}>น้ำหนัก (กิโลกรัม)</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          style={styles.input}
          placeholder="เช่น 65"
        />

        <Text style={styles.label}>ส่วนสูง (เซนติเมตร)</Text>
        <TextInput
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          style={styles.input}
          placeholder="เช่น 170"
        />

        <TouchableOpacity onPress={calculate} style={styles.button}>
          <Text style={styles.buttonText}>คำนวณ BMI</Text>
        </TouchableOpacity>
      </View>

      {bmi !== null && (
        <View style={[styles.resultCard, { borderColor: color }]}>
          <Text style={styles.resultLabel}>ผลการคำนวณ BMI</Text>
          <Text style={[styles.bmiScore, { color }]}>{bmi}</Text>
          <Text style={[styles.categoryText, { color }]}>{category}</Text>
          <Text style={styles.advice}>
            คำแนะนำ: ออกกำลังกายคาร์ดิโอ เช่น วิ่ง VCR 30 นาที สัปดาห์ละ 3-5 วัน
            และรับประทานอาหารครบ 5 หมู่ในสัดส่วน 2:1:1
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f8fafc', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#0f172a' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, marginTop: 6, fontSize: 16 },
  button: { backgroundColor: '#0d9488', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 18 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 20, borderWidth: 2, alignItems: 'center' },
  resultLabel: { color: '#64748b', fontSize: 14 },
  bmiScore: { fontSize: 48, fontWeight: '900', marginVertical: 6 },
  categoryText: { fontSize: 18, fontWeight: 'bold' },
  advice: { textAlign: 'center', color: '#475569', marginTop: 12, lineHeight: 20 },
});`,
    },
    vcr: {
      filename: 'VcrTrackerScreen.tsx',
      path: 'screens/VcrTrackerScreen.tsx',
      desc: 'หน้าจับเวลาวิ่ง VCR 30 นาที พร้อม AsyncStorage บันทึกข้อมูลลงเครื่อง',
      code: `import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VcrTrackerScreen({ userWeight }: { userWeight: number }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
        setDistanceKm((prev) => prev + 9.5 / 3600); // จำลองเพซความเร็ว 9.5 km/h
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const calories = Math.round(8.8 * userWeight * (seconds / 3600));

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return \`\${m}:\${s}\`;
  };

  const handleStopAndSave = async () => {
    setIsRunning(false);
    if (seconds < 5) return;

    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      durationSeconds: seconds,
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      calories,
      completed30Min: seconds >= 1800,
    };

    try {
      const existing = await AsyncStorage.getItem('@vcr_runs');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newRecord);
      await AsyncStorage.setItem('@vcr_runs', JSON.stringify(list));
      Alert.alert('สำเร็จ', 'บันทึกประวัติการวิ่ง VCR 30 นาทีเรียบร้อยแล้ว');
      setSeconds(0);
      setDistanceKm(0);
    } catch (e) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerCircle}>
        <Text style={styles.timerLabel}>เวลาที่วิ่ง</Text>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <Text style={styles.targetLabel}>{seconds >= 1800 ? '✓ ครบ 30 นาทีแล้ว' : 'เป้าหมาย 30:00 นาที'}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{distanceKm.toFixed(2)} km</Text>
          <Text style={styles.statLabel}>ระยะทาง</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{calories} kcal</Text>
          <Text style={styles.statLabel}>แคลอรี</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        {!isRunning ? (
          <TouchableOpacity style={[styles.btn, styles.startBtn]} onPress={() => setIsRunning(true)}>
            <Text style={styles.btnText}>เริ่มวิ่ง (Start)</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.pauseBtn]} onPress={() => setIsRunning(false)}>
            <Text style={styles.btnText}>หยุดชั่วคราว (Pause)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btn, styles.stopBtn, seconds === 0 && { opacity: 0.5 }]}
          disabled={seconds === 0}
          onPress={handleStopAndSave}
        >
          <Text style={styles.btnText}>สิ้นสุดและบันทึก</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: 20 },
  timerCircle: { width: 220, height: 220, borderRadius: 110, borderWidth: 8, borderColor: '#0d9488', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  timerLabel: { color: '#64748b', fontSize: 13 },
  timerText: { fontSize: 44, fontWeight: 'bold', fontFamily: 'monospace', marginVertical: 4 },
  targetLabel: { fontSize: 12, color: '#0d9488', fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginVertical: 30 },
  statBox: { alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, width: '45%' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  btn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
  startBtn: { backgroundColor: '#0d9488' },
  pauseBtn: { backgroundColor: '#f59e0b' },
  stopBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});`,
    },
    pkg: {
      filename: 'package.json',
      path: 'package.json',
      desc: 'Dependencies สำหรับ Expo / React Native',
      code: `{
  "name": "fittrack-react-native",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios"
  },
  "dependencies": {
    "expo": "~50.0.0",
    "expo-status-bar": "~1.11.1",
    "react": "18.2.0",
    "react-native": "0.73.4",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-native-async-storage/async-storage": "1.21.0",
    "expo-location": "~16.5.5"
  }
}`,
    },
  };

  const currentFiles = platform === 'flutter' ? flutterFiles : rnFiles;
  const activeSnippet = currentFiles[activeFile] || currentFiles['main'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white tracking-wide mb-2">
              <Code className="w-3.5 h-3.5" /> โค้ดสำหรับพัฒนาต่อ (Flutter & React Native)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              โครงสร้างโปรเจกต์ & ซอร์สโค้ดพร้อมรัน
            </h2>
            <p className="text-purple-100 text-sm mt-1 max-w-xl">
              โค้ดสำหรับนำไปพัฒนาเป็น Mobile App ทั้ง iOS และ Android ได้ทันที พร้อมคำแนะนำการรันแบบ Step-by-Step
            </p>
          </div>

          {/* Platform toggle */}
          <div className="flex bg-black/30 backdrop-blur-md p-1 rounded-2xl text-xs self-start sm:self-center">
            <button
              type="button"
              onClick={() => {
                setPlatform('flutter');
                setActiveFile('main');
              }}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                platform === 'flutter'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Flutter (แนะนำ)
            </button>
            <button
              type="button"
              onClick={() => {
                setPlatform('react-native');
                setActiveFile('main');
              }}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                platform === 'react-native'
                  ? 'bg-white text-indigo-900 shadow-md'
                  : 'text-purple-200 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" /> React Native (Expo)
            </button>
          </div>
        </div>
      </div>

      {/* Project Structure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: File Tree & How to run */}
        <div className="md:col-span-4 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-purple-600" />
              โครงสร้างไฟล์ {platform === 'flutter' ? 'Flutter' : 'React Native'}
            </h3>

            <div className="space-y-1">
              {Object.keys(currentFiles).map((key) => {
                const item = currentFiles[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveFile(key)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition flex items-center justify-between ${
                      activeFile === key
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>📁 {item.path}</span>
                    {activeFile === key && <span className="w-2 h-2 rounded-full bg-purple-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Terminal Run Guide */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> คำสั่งรันโปรเจกต์
            </h3>

            {platform === 'flutter' ? (
              <div className="space-y-2 text-xs font-mono">
                <div className="bg-black/50 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500"># 1. สร้างโปรเจกต์</span>
                  <p className="text-emerald-400 mt-0.5">flutter create fittrack_app</p>
                  <p className="text-emerald-400">cd fittrack_app</p>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500"># 2. ติดตั้งแพ็กเกจ</span>
                  <p className="text-emerald-400 mt-0.5">flutter pub add shared_preferences geolocator</p>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500"># 3. รันบน Simulator / มือถือ</span>
                  <p className="text-emerald-400 mt-0.5">flutter run</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs font-mono">
                <div className="bg-black/50 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500"># 1. สร้างโปรเจกต์ Expo</span>
                  <p className="text-emerald-400 mt-0.5">npx create-expo-app fittrack-app</p>
                  <p className="text-emerald-400">cd fittrack-app</p>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500"># 2. ติดตั้งแพ็กเกจ</span>
                  <p className="text-emerald-400 mt-0.5">npx expo install @react-native-async-storage/async-storage</p>
                </div>
                <div className="bg-black/50 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-500"># 3. รันแอป</span>
                  <p className="text-emerald-400 mt-0.5">npx expo start</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Code Viewer & Copy button */}
        <div className="md:col-span-8 space-y-3">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-purple-400 font-bold block">
                  {activeSnippet.path}
                </span>
                <span className="text-[11px] text-slate-400">
                  {activeSnippet.desc}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(activeSnippet.code, activeSnippet.path)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition"
              >
                {copiedKey === activeSnippet.path ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    คัดลอกแล้ว!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    คัดลอกโค้ด
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-x-auto max-h-[560px] overflow-y-auto">
              <pre className="text-xs font-mono text-slate-200 leading-relaxed">
                <code>{activeSnippet.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

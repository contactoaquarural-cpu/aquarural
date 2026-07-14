import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useThemeColors } from '../../utils/ThemeContext';
import NoticiasScreen   from '../noticias/NoticiasScreen';
import ConveniosScreen  from '../convenios/ConveniosScreen';
import GanaderoTVScreen from '../ganaderoTV/GanaderoTVScreen';

const TABS = [
  { key: 'noticias',    label: 'Noticias',    icon: '📰' },
  { key: 'ganaderoTV',  label: 'Ganadero TV', icon: '📺' },
  { key: 'convenios',   label: 'Convenios',   icon: '🤝' },
];

const ExplorarScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const s = styles(colors);
  const [tab, setTab] = useState('noticias');

  return (
    <View style={s.container}>
      {/* Sub-tabs */}
      <View style={s.subTabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.subTabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[s.subTab, tab === t.key && s.subTabActivo]}
              onPress={() => setTab(t.key)}
            >
              <View style={s.subTabInner}>
                <Text style={s.subTabIcon}>{t.icon}</Text>
                <Text style={[s.subTabLabel, tab === t.key && s.subTabLabelActivo]}>{t.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Contenido — siempre montado, solo se oculta */}
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, display: tab === 'noticias'   ? 'flex' : 'none' }}>
          <NoticiasScreen   navigation={navigation} inExplorar />
        </View>
        <View style={{ flex: 1, display: tab === 'ganaderoTV' ? 'flex' : 'none' }}>
          <GanaderoTVScreen navigation={navigation} />
        </View>
        <View style={{ flex: 1, display: tab === 'convenios'  ? 'flex' : 'none' }}>
          <ConveniosScreen  navigation={navigation} inExplorar />
        </View>
      </View>
    </View>
  );
};

const styles = (c) => StyleSheet.create({
  container:          { flex: 1, backgroundColor: c.background },
  subTabsWrapper:     { paddingTop: 56, backgroundColor: c.background },
  subTabs:            { paddingHorizontal: 16, paddingBottom: 10, gap: 8, flexDirection: 'row' },
  subTab:            { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: c.surfaceContainer },
  subTabActivo:      { backgroundColor: c.primaryContainer },
  subTabInner:       { flexDirection: 'row', alignItems: 'center', gap: 5 },
  subTabIcon:        { fontSize: 14, lineHeight: 18 },
  subTabLabel:       { fontSize: 13, fontWeight: '600', color: c.onSurfaceVariant },
  subTabLabelActivo: { color: c.onPrimaryContainer },
});

export default ExplorarScreen;

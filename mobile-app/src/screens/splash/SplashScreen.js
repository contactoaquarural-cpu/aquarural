import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../../theme/tokens';

// Degradado blanco → azul de marca, con el mismo wordmark bicolor
// "Aqua"+"Rural" que ya usa el Navbar del landing (texto oscuro + azul de
// marca en una sola línea) — reemplaza el corte diagonal duro anterior.
const SplashScreen = () => {
  return (
    <LinearGradient
      colors={[colors.blanco, colors.blanco, colors.azulMarca]}
      locations={[0, 0.35, 1]}
      style={styles.container}
    >
      <View style={styles.contenido}>
        <Text style={styles.wordmark}>
          <Text style={styles.aqua}>Aqua</Text>
          <Text style={styles.rural}>Rural</Text>
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contenido: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: fonts.headlineExtraBold,
    fontSize: 44,
    letterSpacing: -0.5,
  },
  aqua: {
    color: colors.textoPrincipal,
  },
  rural: {
    color: colors.azulMarca,
  },
});

export default SplashScreen;

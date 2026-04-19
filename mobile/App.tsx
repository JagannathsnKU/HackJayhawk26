import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './context/AppProvider';
import { AuthProvider } from './context/AuthContext';
import { CosmicBackdropProvider } from './context/CosmicBackdropContext';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <CosmicBackdropProvider>
        <AuthProvider>
          <AppProvider>
            <RootNavigator />
            <StatusBar style="light" />
          </AppProvider>
        </AuthProvider>
      </CosmicBackdropProvider>
    </SafeAreaProvider>
  );
}

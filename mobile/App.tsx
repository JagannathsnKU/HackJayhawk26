import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './context/AppProvider';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AppProvider>
        <RootNavigator />
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </AppProvider>
    </SafeAreaProvider>
  );
}

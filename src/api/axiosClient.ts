import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, isAxiosError } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 5000;

const getHostFromUri = (uri: string | undefined): string | undefined => {
  if (!uri) {
    return undefined;
  }

  return uri.replace(/^https?:\/\//, '').split(':')[0];
};

const getDevelopmentHost = (): string | undefined => {
  if (Platform.OS === 'web') {
    return globalThis.location?.hostname || 'localhost';
  }

  return (
    getHostFromUri(Constants.expoConfig?.hostUri) ||
    getHostFromUri(Constants.expoGoConfig?.debuggerHost)
  );
};

const getApiBaseUrl = (): string => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configuredUrl && /^https?:\/\//i.test(configuredUrl)) {
    return configuredUrl.replace(/\/+$/, '');
  }

  const developmentHost = getDevelopmentHost();
  return developmentHost
    ? `http://${developmentHost}:${API_PORT}/api`
    : `http://localhost:${API_PORT}/api`;
};

export const API_BASE_URL = getApiBaseUrl();

export const axiosClient = create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('ccpd_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    if (!error.response) {
      return `Unable to reach the CCPD server at ${API_BASE_URL}. Start the backend and ensure this device is on the same network.`;
    }
    return error.response.data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'Request failed.';
};

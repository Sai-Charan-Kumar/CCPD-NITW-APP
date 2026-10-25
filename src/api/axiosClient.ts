import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, isAxiosError } from 'axios';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export const axiosClient = create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('ccpd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getApiErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'Request failed.';
};

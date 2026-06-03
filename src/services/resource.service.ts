import apiClient from '../utils/api';
import { Resource, CreateResourceData } from '../types/resource';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const getResources = async (filters?: { type?: string; branch?: string; subject?: string; year?: number; uploadedBy?: string }) => {
    const cacheKey = `resources_${JSON.stringify(filters || {})}`;
    try {
        const response = await apiClient.get<Resource[]>('/resources', { params: filters });
        const data = response as unknown as Resource[];
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
    } catch (error) {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData) as Resource[];
        }
        throw error;
    }
};

export const uploadResource = async (data: CreateResourceData) => {
    const response = await apiClient.post<Resource>('/resources', data);
    return response as unknown as Resource;
};

export const updateResource = async (id: string, data: CreateResourceData) => {
    const response = await apiClient.put<Resource>(`/resources/${id}`, data);
    return response as unknown as Resource;
};

export const deleteResource = async (id: string) => {
    const response = await apiClient.delete(`/resources/${id}`);
    return response as any;
};

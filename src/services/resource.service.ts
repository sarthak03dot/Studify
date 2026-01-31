import apiClient from '../utils/api';
import { Resource, CreateResourceData } from '../types/resource';

export const getResources = async (filters?: { type?: string; branch?: string; subject?: string; year?: number; uploadedBy?: string }) => {
    const response = await apiClient.get<Resource[]>('/resources', { params: filters });
    return response as unknown as Resource[];
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

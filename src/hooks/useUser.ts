import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../utils/api";
import { User } from "../types/auth";

export const useProfile = () => {
    return useQuery({
        queryKey: ["profile"],
        queryFn: async () => {
            const response = await apiClient.get<User>("/auth/profile");
            return response as unknown as User;
        },
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<User>) => {
            const response = await apiClient.put<User>("/auth/profile", data);
            return response as unknown as User;
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["profile"], updatedUser);
        },
    });
};

export const useChangePassword = () => {
    return useMutation({
        mutationFn: async (data: any) => {
            const response = await apiClient.post("/auth/change-password", data);
            return response as any;
        },
    });
};

export const useSolveQuestion = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (questionId: string) => {
            const response = await apiClient.post<User>("/auth/solve-question", { questionId });
            return response as unknown as User;
        },
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["profile"], updatedUser);
        },
    });
};

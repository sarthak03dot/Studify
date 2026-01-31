import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getResources, uploadResource, updateResource } from "../services/resource.service";
import { CreateResourceData } from "../types/resource";

export const useResources = (filters?: any) => {
    return useQuery({
        queryKey: ["resources", filters],
        queryFn: () => getResources(filters),
    });
};

export const useUploadResource = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateResourceData) => uploadResource(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resources"] });
        },
    });
};

export const useUpdateResource = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateResourceData }) => updateResource(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["resources"] });
        },
    });
};

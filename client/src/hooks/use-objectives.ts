import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Objective, InsertObjective } from "@shared/schema";

export function useObjectives(groupId?: string) {
    const queryClient = useQueryClient();

    const { data: objectives, isLoading } = useQuery<Objective[]>({
        queryKey: ['/api/objectives', groupId],
        queryFn: async () => {
            const param = groupId ? `?groupId=${groupId}` : '';
            const res = await fetch(`/api/objectives${param}`);
            if (!res.ok) throw new Error("Failed to fetch objectives");
            return res.json();
        }
    });

    const createMutation = useMutation({
        mutationFn: async (objective: InsertObjective) => {
            const res = await fetch('/api/objectives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(objective),
            });
            if (!res.ok) throw new Error("Failed to create objective");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/objectives'] });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
            const res = await fetch(`/api/objectives/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isCompleted }),
            });
            if (!res.ok) throw new Error("Failed to update objective");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/api/objectives'] });
        }
    });

    return {
        objectives,
        isLoading,
        createObjective: createMutation.mutate,
        toggleObjective: toggleMutation.mutate
    };
}

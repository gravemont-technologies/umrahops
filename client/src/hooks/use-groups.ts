import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertGroup, type UpdateGroupRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useGroups() {
  return useQuery({
    queryKey: [api.groups.list.path],
    queryFn: async () => {
      const res = await fetch(api.groups.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch groups");
      return api.groups.list.responses[200].parse(await res.json());
    },
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: [api.groups.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.groups.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch group");
      return api.groups.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertGroup) => {
      const validated = api.groups.create.input.parse(data);
      const res = await fetch(api.groups.create.path, {
        method: api.groups.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.groups.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create group");
      }
      return api.groups.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.groups.list.path] });
      toast({ title: "Group Created", description: "New group has been successfully created." });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & UpdateGroupRequest) => {
      const validated = api.groups.update.input.parse(updates);
      const url = buildUrl(api.groups.update.path, { id });

      const res = await fetch(url, {
        method: api.groups.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update group");
      return api.groups.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.groups.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.groups.get.path, data.id] });
      toast({ title: "Group Updated", description: "Changes saved successfully." });
    },
  });
}

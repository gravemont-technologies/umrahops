import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertTraveler } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useGroupTravelers(groupId: string) {
  return useQuery({
    queryKey: [api.travelers.list.path, groupId],
    queryFn: async () => {
      const url = buildUrl(api.travelers.list.path, { groupId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch travelers");
      return api.travelers.list.responses[200].parse(await res.json());
    },
    enabled: !!groupId,
  });
}

export function useCreateTraveler() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertTraveler) => {
      const validated = api.travelers.create.input.parse(data);
      const res = await fetch(api.travelers.create.path, {
        method: api.travelers.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to add traveler");
      return api.travelers.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      if (data.groupId) {
        queryClient.invalidateQueries({ queryKey: [api.travelers.list.path, data.groupId] });
      }
      toast({ title: "Traveler Added", description: "Traveler added to the group." });
    },
  });
}

export function useBulkCreateTravelers() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (travelers: InsertTraveler[]) => {
      // Validate array
      const validated = api.travelers.bulkCreate.input.parse({ travelers });
      
      const res = await fetch(api.travelers.bulkCreate.path, {
        method: api.travelers.bulkCreate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to import travelers");
      return api.travelers.bulkCreate.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate queries for all affected groups (assuming bulk insert might affect multiple or at least one)
      // Since response is array of travelers, we can pick the group ID from the first one if they belong to same group
      if (data.length > 0 && data[0].groupId) {
        queryClient.invalidateQueries({ queryKey: [api.travelers.list.path, data[0].groupId] });
      }
      toast({ title: "Import Successful", description: `${data.length} travelers imported.` });
    },
    onError: (err) => {
      toast({ 
        title: "Import Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  });
}

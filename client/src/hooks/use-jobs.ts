import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Job } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useJobs() {
  return useQuery({
    queryKey: [api.jobs.list.path],
    queryFn: async () => {
      const res = await fetch(api.jobs.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return api.jobs.list.responses[200].parse(await res.json());
    },
    // Poll every 5 seconds for updates
    refetchInterval: 5000,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: any) => { // Type as InsertJob when strictly needed
      const validated = api.jobs.create.input.parse(data);
      const res = await fetch(api.jobs.create.path, {
        method: api.jobs.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create job");
      return api.jobs.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.jobs.list.path] });
      toast({ title: "Job Queued", description: "Background process started." });
    },
  });
}

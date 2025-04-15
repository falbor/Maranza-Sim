import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    const errorMessage = `${res.status}: ${text}`;
    
    // Gestione più dettagliata dei messaggi di errore relativi ai soldi
    if (res.status === 400) {
      // Shopping e attività che richiedono soldi
      if (text.includes("shopping") || text.includes("Shopping")) {
        toast({
          variant: "destructive",
          title: "Soldi insufficienti per lo shopping",
          description: text,
        });
      }
      // Discoteca
      else if (text.includes("discoteca") || text.includes("Discoteca")) {
        toast({
          variant: "destructive",
          title: "Soldi insufficienti per la discoteca",
          description: text,
        });
      }
      // Altri messaggi relativi ai soldi
      else if (text.includes("soldi") || text.includes("money") || text.includes("cash")) {
        toast({
          variant: "destructive",
          title: "Soldi insufficienti",
          description: text,
        });
      }
      // Altri errori 400
      else {
        toast({
          variant: "destructive",
          title: "Errore",
          description: text,
        });
      }
    } else {
      // Altri tipi di errori non 400
      toast({
        variant: "destructive",
        title: "Errore",
        description: errorMessage,
      });
    }
    
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Cattura errori di rete non gestiti da throwIfResNotOk
    if (!error.message.includes(":")) {
      toast({
        variant: "destructive",
        title: "Errore di rete",
        description: error.message || "Si è verificato un errore di connessione",
      });
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

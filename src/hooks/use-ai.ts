import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { runAi, type AiFeature } from "@/lib/ai.functions";

export function useAi() {
  const fn = useServerFn(runAi);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  const run = useCallback(
    async (feature: AiFeature, data: Record<string, string>): Promise<string | null> => {
      if (busy.current) return null; // prevent duplicate submissions
      busy.current = true;
      setLoading(true);
      setError(null);
      try {
        const res = await fn({ data: { feature, data } });
        if (res.ok) {
          setText(res.text);
          return res.text;
        }
        setError(res.error);
        toast.error(res.error);
        return null;
      } catch {
        const msg = "Network error — please check your connection and try again.";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        busy.current = false;
        setLoading(false);
      }
    },
    [fn],
  );

  const reset = useCallback(() => {
    setText(null);
    setError(null);
  }, []);

  return { text, loading, error, run, reset, setText };
}

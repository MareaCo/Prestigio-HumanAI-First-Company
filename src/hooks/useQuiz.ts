import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QUESTIONS } from "@/data/questions";
import { computeScores, getTier, perfilFromTier } from "@/data/scoring";

type NavigateFn = (
  screen: "dashboard" | "quiz" | "report" | "employee-detail" | "login",
  params?: Record<string, unknown>,
) => void;

export function useQuiz(employeeId: string | null) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => new Array(QUESTIONS.length).fill(null),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectOption = useCallback((idx: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = idx;
      return next;
    });
  }, [currentQ]);

  const nextQuestion = useCallback(() => {
    setCurrentQ((q) => (q < QUESTIONS.length - 1 ? q + 1 : q));
  }, []);
  const prevQuestion = useCallback(() => {
    setCurrentQ((q) => (q > 0 ? q - 1 : q));
  }, []);

  const isComplete = answers[currentQ] !== null;
  const isLast = currentQ === QUESTIONS.length - 1;
  const progress = Math.round(((currentQ + 1) / QUESTIONS.length) * 100);

  const finishQuiz = useCallback(
    async (navigateTo: NavigateFn) => {
      if (!employeeId) {
        setError("No hay empleado asociado al diagnóstico.");
        return;
      }
      setSaving(true);
      setError(null);
      const { total, dimScores } = computeScores(answers);
      const tier = getTier(total);
      const perfil = perfilFromTier(tier.id);

      const { data, error: insertError } = await supabase
        .from("diagnostics")
        .insert({
          employee_id: employeeId,
          tier: tier.id,
          total_score: total,
          dim_scores: dimScores,
          perfil,
          activities_q: { q1: 0, q2: 0, q3: 0, q4: 0 },
        })
        .select()
        .single();

      setSaving(false);
      if (insertError || !data) {
        setError(insertError?.message ?? "No se pudo guardar el diagnóstico.");
        return;
      }
      navigateTo("report", { latestDiagnosticId: data.id });
    },
    [answers, employeeId],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, number> = {
        a: 0, b: 1, c: 2, d: 3,
        "1": 0, "2": 1, "3": 2, "4": 3,
      };
      const k = e.key.toLowerCase();
      if (k in map) {
        e.preventDefault();
        if (answers[currentQ] === null) {
          selectOption(map[k]);
          if (!isLast) window.setTimeout(nextQuestion, 220);
        }
      }
      if (e.key === "Enter" && isComplete && !isLast) nextQuestion();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentQ, answers, isComplete, isLast, selectOption, nextQuestion]);

  return {
    currentQ,
    answers,
    selectOption,
    nextQuestion,
    prevQuestion,
    isComplete,
    isLast,
    progress,
    saving,
    error,
    finishQuiz,
    questions: QUESTIONS,
  };
}

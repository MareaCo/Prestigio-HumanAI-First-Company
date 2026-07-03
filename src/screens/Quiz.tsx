import { useApp } from "@/context/AppContext";
import { useQuiz } from "@/hooks/useQuiz";

export function QuizScreen() {
  const { currentEmployeeId, navigateTo } = useApp();
  const {
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
    questions,
  } = useQuiz(currentEmployeeId);

  const q = questions[currentQ];
  const selectedIdx = answers[currentQ];

  async function handleAdvance() {
    if (!isComplete) return;
    if (isLast) {
      await finishQuiz(navigateTo);
    } else {
      nextQuestion();
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      {/* Header sticky */}
      <header className="sticky top-0 z-10 bg-cream border-b border-ink/10">
        <div className="mx-auto max-w-[900px] px-6 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-[8px] bg-ink flex items-center justify-center text-white font-display font-bold">
            Q
          </div>
          <div className="flex-1 h-[3px] bg-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-ink transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[13px] font-medium text-accent-brand">
            {progress}%
          </span>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-start justify-center">
        <div className="w-full max-w-[780px] px-8 py-12 text-center">
          <p className="text-accent-brand uppercase tracking-[0.14em] text-[12px] font-medium">
            {q.number} · {q.dimension}
          </p>
          <h2
            className="font-display font-bold mt-4 text-ink"
            style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.4rem)", lineHeight: 1.15 }}
          >
            {q.title}
          </h2>
          <p className="mt-4 text-[15px] text-ink-soft max-w-[620px] mx-auto">
            {q.desc}
          </p>
          <p className="mt-3 text-[13px] italic text-ink-muted max-w-[620px] mx-auto mb-10">
            {q.note}
          </p>

          <div className="flex flex-col gap-3 max-w-[660px] mx-auto text-left">
            {q.options.map((opt, i) => {
              const selected = selectedIdx === i;
              return (
                <button
                  key={opt.letter}
                  onClick={() => {
                    selectOption(i);
                    if (!isLast) window.setTimeout(nextQuestion, 220);
                  }}
                  className={`flex items-center gap-4 rounded-[14px] border transition-all px-[22px] py-[18px] hover:translate-x-[3px] ${
                    selected
                      ? "bg-ink text-white border-ink"
                      : "bg-white text-ink border-ink/10"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-[26px] h-[26px] rounded-full border text-[11px] font-medium ${
                      selected
                        ? "border-white opacity-100"
                        : "border-ink/60 opacity-60"
                    }`}
                  >
                    {opt.letter}
                  </span>
                  <span className="text-[14px] leading-snug">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-6 text-[13px] text-tier1">{error}</p>
          )}
        </div>
      </main>

      {/* Footer sticky */}
      <footer className="sticky bottom-0 bg-cream border-t border-ink/10">
        <div className="mx-auto max-w-[900px] px-6 py-4 flex items-center justify-between">
          <button
            onClick={prevQuestion}
            className={`text-[13px] text-ink-soft hover:text-ink ${
              currentQ === 0 ? "invisible" : ""
            }`}
          >
            ← Atrás
          </button>
          <span className="text-[12px] text-ink-muted hidden sm:block">
            Presiona A · B · C · D o ↵ para continuar
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo("dashboard")}
              className="text-[12px] text-ink-muted hover:text-ink"
            >
              Salir
            </button>
            <button
              onClick={handleAdvance}
              disabled={!isComplete || saving}
              className="rounded-[8px] bg-ink text-white text-[13px] font-medium px-[18px] py-[9px] hover:bg-ink-soft disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving
                ? "Guardando…"
                : isLast
                  ? "Finalizar →"
                  : "Siguiente →"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

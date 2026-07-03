import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useDashboard } from "@/hooks/useDashboard";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { AppSidebar } from "@/components/AppSidebar";
import { NewEmployeeModal } from "@/components/NewEmployeeModal";

export function UsersScreen() {
  const { navigateTo } = useApp();
  const { employees, diagnostics, loading, reload } = useDashboard("__all__");
  const [openNew, setOpenNew] = useState(false);

  return (
    <main className="min-h-screen bg-cream text-ink flex">
      <AppSidebar activeScreen="users" />
      <div className="flex-1 mx-auto max-w-[1100px] px-6 py-8 w-full">
        <header className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[1.4rem] font-bold leading-tight">
              HumanAI First CompanyⓇ by Prestigio
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-ink-muted">
              GOBIERNO Y OBSERVABILIDAD
            </p>
          </div>
          <button
            onClick={() => setOpenNew(true)}
            className="shrink-0 rounded-[8px] bg-ink text-white font-medium px-3 py-2 hover:bg-ink-soft text-[13px]"
          >
            + Nuevo colaborador
          </button>
        </header>

        {loading ? (
          <p className="text-ink-muted text-sm">Cargando colaboradores…</p>
        ) : (
          <div>
            <EmployeeTable
              employees={employees}
              diagnostics={diagnostics}
              onOpenDetail={(id) =>
                navigateTo("employee-detail", { currentEmployeeId: id })
              }
              onStartQuiz={(id) =>
                navigateTo("quiz", { currentEmployeeId: id })
              }
            />
          </div>
        )}
      </div>

      <NewEmployeeModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onCreated={() => reload()}
      />
    </main>
  );
}

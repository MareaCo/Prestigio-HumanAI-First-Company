import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useDashboard } from "@/hooks/useDashboard";
import { NewEmployeeModal } from "@/components/NewEmployeeModal";
import { AppSidebar } from "@/components/AppSidebar";
import { ProfileDonut } from "@/components/dashboard/ProfileDonut";
import { AreaBar } from "@/components/dashboard/AreaBar";
import { AwareGrid } from "@/components/dashboard/AwareGrid";
import { DiagnosticBoard } from "@/components/dashboard/DiagnosticBoard";
import { TeamSection } from "@/components/dashboard/TeamSection";

import { supabase } from "@/integrations/supabase/client";

const NTS_COLOR = (v: number) =>
  v >= 70 ? "text-tier4" : v >= 40 ? "text-tier3" : "text-tier1";

export function DashboardScreen() {
  const { areaFilter, setAreaFilter, companyId } = useApp();
  const { employees, diagnostics, filtered, awareScores, nts, loading, reload } =
    useDashboard(areaFilter);
  const [modalOpen, setModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const areasWithData = useMemo(
    () => [...new Set(diagnostics.map((d) => d.employee?.area).filter(Boolean) as string[])].sort(),
    [diagnostics],
  );


  async function regenerateSampleData() {
    if (!companyId) return;
    setSeeding(true);
    try {
      await supabase.from("diagnostics").delete().not("id", "is", null);
      await supabase.from("employees").delete().eq("company_id", companyId);
      const sampleEmployees = SAMPLE_EMPLOYEES.map((e) => ({ ...e, company_id: companyId }));
      const { data: inserted } = await supabase
        .from("employees")
        .insert(sampleEmployees)
        .select();
      if (inserted) {
        const diagRows = inserted.map((emp, i) => {
          const sample = SAMPLE_DIAGS[i % SAMPLE_DIAGS.length];
          return { ...sample, employee_id: emp.id };
        });
        await supabase.from("diagnostics").insert(diagRows);
      }
      reload();
    } finally {
      setSeeding(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream text-ink flex">
      <AppSidebar
        activeScreen="dashboard"
        onRegenerate={regenerateSampleData}
        seeding={seeding}
      />

      <div className="flex-1 mx-auto max-w-[1100px] px-6 py-8 w-full">
        {/* Topbar */}
        <header className="mb-7">
          <div>
            <h1 className="font-display text-[1.4rem] font-bold leading-tight">
              HumanAI First CompanyⓇ by Prestigio
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-ink-muted">
              GOBIERNO Y OBSERVABILIDAD
            </p>
          </div>
        </header>


        {loading ? (
          <p className="text-ink-muted text-sm">Cargando tablero…</p>
        ) : diagnostics.length === 0 ? (
          <EmptyState onAdd={() => setModalOpen(true)} />
        ) : (
          <>
            {/* AWARE - primero */}
            <div className="mt-2 mb-3 flex items-end justify-between gap-4">
              <p className="text-[10px] uppercase tracking-widest text-ink-muted">
                Progreso del método AWARE
              </p>
              <label className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest text-ink-muted">
                  Filtrar por área
                </span>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="h-9 px-3 rounded-[8px] border border-ink/10 bg-white text-[13px] focus:outline-none focus:border-ink"
                >
                  <option value="__all__">Todas · Vista Admin/RRHH</option>
                  {areasWithData.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mb-4">
              <AwareGrid scores={awareScores} />
            </div>

            <div className="mb-6">
              <DiagnosticBoard scores={awareScores} />
            </div>

            {/* KPI grid */}
            <section className="grid grid-cols-2 gap-3 mb-6">
              <KpiCard
                label="Total respuestas"
                value={String(filtered.length)}
                sub={`de ${areasWithData.length} áreas`}
              />
              <KpiCard
                label="Net Transformative Score"
                value={String(nts)}
                sub="promedio de las 5 etapas AWARE"
                valueClass={NTS_COLOR(nts)}
              />
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <ProfileDonut diagnostics={filtered} />
              <AreaBar diagnostics={filtered} />
            </section>

            <div className="mb-6">
              <TeamSection
                teamDiagnostics={filtered}
                allDiagnostics={diagnostics}
                areaName={areaFilter === "__all__" ? "Toda la compañía" : areaFilter}
                isCompanyWide={areaFilter === "__all__"}
              />
            </div>


            <p className="mt-6 text-[11px] text-ink-muted leading-relaxed">
              <strong className="text-ink-soft">Metodología:</strong> los puntajes AWARE son
              proxies calculados a partir del diagnóstico individual. AWAKE = % fuera de perfil
              Escéptico · WATCH = cobertura de áreas con datos suficientes · ALIGN = consistencia
              entre áreas · RELEARN = % en Facilitador/Amplificador · EXPERIMENT = actividades
              Q3/Q4 por empleado. NTS = promedio simple de las 5. · {employees.length} empleados
              registrados · {diagnostics.length} diagnósticos únicos.
            </p>
          </>
        )}
      </div>

      <NewEmployeeModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}

function KpiCard({
  label,
  value,
  sub,
  valueClass,
  small,
}: {
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
  small?: boolean;
}) {
  return (
    <div className="bg-white rounded-[14px] p-5 border border-ink/5">
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">{label}</p>
      <p
        className={`mt-2 font-display font-bold leading-none ${
          small ? "text-[1.4rem]" : "text-[1.9rem]"
        } ${valueClass ?? "text-ink"}`}
      >
        {value}
      </p>
      <p className="mt-2 text-[12px] text-ink-soft">{sub}</p>
    </div>
  );
}


function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-[16px] px-8 py-12 text-center max-w-[560px] mx-auto border border-ink/5">
      <h2 className="font-display text-[1.5rem] font-bold text-ink">
        Aún no hay diagnósticos registrados
      </h2>
      <p className="mt-3 text-[14px] text-ink-soft max-w-[440px] mx-auto">
        Agrega el primer empleado y ejecuta su diagnóstico para ver el tablero.
      </p>
      <button
        onClick={onAdd}
        className="mt-8 rounded-full bg-ink text-white font-medium px-6 py-3 hover:bg-ink-soft"
      >
        → Agregar primer empleado
      </button>
    </div>
  );
}

// ---- Sample data para el botón "Regenerar" (admin) ----
const SAMPLE_EMPLOYEES = [
  { name: "Ana Torres", email: "ana@empresa.com", area: "Ventas" },
  { name: "Luis Pérez", email: "luis@empresa.com", area: "Ventas" },
  { name: "María Gómez", email: "maria@empresa.com", area: "Ventas" },
  { name: "Carlos Ruiz", email: "carlos@empresa.com", area: "Operaciones" },
  { name: "Sofía Díaz", email: "sofia@empresa.com", area: "Operaciones" },
  { name: "Jorge Silva", email: "jorge@empresa.com", area: "Operaciones" },
  { name: "Elena Vega", email: "elena@empresa.com", area: "Tecnología" },
  { name: "Diego Mora", email: "diego@empresa.com", area: "Tecnología" },
  { name: "Paula Ríos", email: "paula@empresa.com", area: "Tecnología" },
  { name: "Iván Castro", email: "ivan@empresa.com", area: "RRHH" },
  { name: "Rosa León", email: "rosa@empresa.com", area: "Marketing" },
  { name: "Pedro Ortiz", email: "pedro@empresa.com", area: "Finanzas" },
];

const SAMPLE_DIAGS = [
  { tier: 1, total_score: 19, dim_scores: { Mentalidad: 2, Contexto: 2, Datos: 2, "Automatización": 3, Calidad: 3, "Autonomía": 2, Liderazgo: 5 }, perfil: "Escéptico", activities_q: { q1: 1, q2: 0, q3: 0, q4: 0 } },
  { tier: 2, total_score: 27, dim_scores: { Mentalidad: 4, Contexto: 3, Datos: 3, "Automatización": 4, Calidad: 4, "Autonomía": 3, Liderazgo: 6 }, perfil: "Táctico", activities_q: { q1: 2, q2: 1, q3: 1, q4: 0 } },
  { tier: 3, total_score: 35, dim_scores: { Mentalidad: 5, Contexto: 5, Datos: 5, "Automatización": 4, Calidad: 5, "Autonomía": 4, Liderazgo: 7 }, perfil: "Táctico", activities_q: { q1: 2, q2: 2, q3: 2, q4: 1 } },
  { tier: 4, total_score: 43, dim_scores: { Mentalidad: 6, Contexto: 6, Datos: 5, "Automatización": 6, Calidad: 6, "Autonomía": 5, Liderazgo: 9 }, perfil: "Facilitador", activities_q: { q1: 3, q2: 3, q3: 3, q4: 2 } },
  { tier: 5, total_score: 51, dim_scores: { Mentalidad: 7, Contexto: 7, Datos: 7, "Automatización": 7, Calidad: 7, "Autonomía": 6, Liderazgo: 10 }, perfil: "Facilitador", activities_q: { q1: 3, q2: 3, q3: 4, q4: 3 } },
  { tier: 6, total_score: 57, dim_scores: { Mentalidad: 8, Contexto: 8, Datos: 7, "Automatización": 8, Calidad: 8, "Autonomía": 7, Liderazgo: 11 }, perfil: "Amplificador", activities_q: { q1: 4, q2: 4, q3: 4, q4: 4 } },
];

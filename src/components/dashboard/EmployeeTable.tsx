import { PERFIL_CONFIG, TIER_NAMES } from "@/data/constants";
import type { Diagnostic, Employee } from "@/types";

interface Props {
  employees: Employee[];
  diagnostics: Diagnostic[];
  onOpenDetail: (employeeId: string) => void;
  onStartQuiz: (employeeId: string) => void;
}

interface Row {
  employee: Employee;
  diagnostic: Diagnostic | null;
}

export function EmployeeTable({ employees, diagnostics, onOpenDetail, onStartQuiz }: Props) {
  const rows: Row[] = employees.map((e) => ({
    employee: e,
    diagnostic: diagnostics.find((d) => d.employee_id === e.id) ?? null,
  }));
  rows.sort((a, b) => {
    const sa = a.diagnostic?.total_score ?? -1;
    const sb = b.diagnostic?.total_score ?? -1;
    return sb - sa;
  });

  const withCount = rows.filter((r) => r.diagnostic).length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-ink/5">
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">Colaboradores</p>
      <p className="mt-1 text-[12px] text-ink-soft">
        {rows.length} colaboradores · {withCount} con diagnóstico · {rows.length - withCount} pendientes
      </p>

      <div className="mt-4 overflow-y-auto" style={{ maxHeight: 360 }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-ink-muted">
              <th className="py-2 pr-3 font-medium">Nombre</th>
              <th className="py-2 pr-3 font-medium">Área</th>
              <th className="py-2 pr-3 font-medium">Perfil</th>
              <th className="py-2 pr-3 font-medium">Nivel</th>
              <th className="py-2 pr-3 font-medium">Score</th>
              <th className="py-2 pr-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ employee, diagnostic }) => {
              if (!diagnostic) {
                return (
                  <tr
                    key={employee.id}
                    onClick={() => onStartQuiz(employee.id)}
                    className="cursor-pointer border-t border-ink/5"
                    style={{ background: "#FFFBF5" }}
                  >
                    <td className="py-2.5 pr-3 text-ink">{employee.name}</td>
                    <td className="py-2.5 pr-3 text-ink-soft">{employee.area}</td>
                    <td className="py-2.5 pr-3 text-ink-muted">Sin diagnóstico</td>
                    <td className="py-2.5 pr-3 text-ink-muted">—</td>
                    <td className="py-2.5 pr-3 text-ink-muted">—</td>
                    <td className="py-2.5 pr-3 text-right text-[11px] font-medium text-tier1">
                      Iniciar →
                    </td>
                  </tr>
                );
              }
              const cfg = PERFIL_CONFIG[diagnostic.perfil];
              return (
                <tr
                  key={employee.id}
                  onClick={() => onOpenDetail(employee.id)}
                  className="cursor-pointer border-t border-ink/5 hover:bg-cream"
                >
                  <td className="py-2.5 pr-3 text-ink">{employee.name}</td>
                  <td className="py-2.5 pr-3 text-ink-soft">{employee.area}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ background: cfg.light, color: cfg.dark }}
                    >
                      {diagnostic.perfil}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-ink-soft">{TIER_NAMES[diagnostic.tier - 1]}</td>
                  <td className="py-2.5 pr-3 text-ink">{diagnostic.total_score}/60</td>
                  <td className="py-2.5 pr-3 text-right text-[11px] text-ink-muted">
                    Ver detalle →
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

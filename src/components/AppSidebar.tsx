import { useApp } from "@/context/AppContext";
import type { Screen } from "@/types";

interface Props {
  activeScreen: Screen;
  onNewEmployee?: () => void;
  onRegenerate?: () => void;
  seeding?: boolean;
}

export function AppSidebar({ activeScreen, onNewEmployee, onRegenerate, seeding }: Props) {
  const { role, logout, navigateTo } = useApp();

  return (
    <aside className="w-[220px] shrink-0 border-r border-ink/10 bg-white/60 min-h-screen sticky top-0 self-start">
      <div className="px-5 py-6 flex flex-col h-screen">
        <p className="text-[10px] uppercase tracking-widest text-ink-muted mb-4">Menú</p>
        <nav className="flex flex-col gap-1 text-[13px]">
          {onNewEmployee && (
            <button
              onClick={onNewEmployee}
              className="text-left rounded-[8px] bg-ink text-white font-medium px-3 py-2 hover:bg-ink-soft"
            >
              + Nuevo colaborador
            </button>
          )}
          <SideItem
            label="Dashboard"
            onClick={() => navigateTo("dashboard")}
            active={activeScreen === "dashboard"}
          />
          <SideItem label="Metodología" onClick={() => {}} />
          <SideItem
            label="Colaboradores"
            onClick={() => navigateTo("users")}
            active={activeScreen === "users"}
          />
          {role === "admin" && onRegenerate && (
            <SideItem
              label={seeding ? "Regenerando…" : "↻ Regenerar datos"}
              onClick={onRegenerate}
              disabled={seeding}
            />
          )}
        </nav>
        <div className="mt-auto pt-4 border-t border-ink/10">
          <SideItem label="Salir" onClick={logout} />
        </div>
      </div>
    </aside>
  );
}

function SideItem({
  label,
  onClick,
  disabled,
  active,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-left rounded-[8px] px-3 py-2 hover:bg-ink/5 hover:text-ink disabled:opacity-60 ${
        active ? "bg-ink/5 text-ink font-medium" : "text-ink-soft"
      }`}
    >
      {label}
    </button>
  );
}

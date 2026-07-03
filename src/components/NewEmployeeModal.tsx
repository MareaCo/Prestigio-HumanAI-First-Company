import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/context/AppContext";
import { AREAS } from "@/data/constants";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (employeeId: string) => void;
}

export function NewEmployeeModal({ open, onClose, onCreated }: Props) {
  const { companyId, navigateTo } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState(AREAS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setEmail("");
      setArea(AREAS[0]);
      setError(null);
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) {
      setError("No hay compañía cargada.");
      return;
    }
    setSaving(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("employees")
      .insert({
        name: name.trim(),
        email: email.trim() || null,
        area,
        company_id: companyId,
      })
      .select()
      .single();
    setSaving(false);
    if (err || !data) {
      setError(err?.message ?? "No se pudo guardar el empleado.");
      return;
    }
    onCreated?.(data.id);
    onClose();
    navigateTo("quiz", { currentEmployeeId: data.id });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <form
        onSubmit={handleSave}
        className="w-full max-w-[480px] bg-white rounded-2xl p-8 shadow-xl"
      >
        <h2 className="font-display text-2xl font-bold text-ink">Nuevo empleado</h2>
        <p className="mt-1 text-[13px] text-ink-muted">
          Se creará y quedará listo para el diagnóstico.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="block text-[12px] uppercase tracking-wider text-ink-muted mb-1.5">
              Nombre *
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[10px] border border-ink/10 bg-white text-ink focus:outline-none focus:border-ink"
            />
          </label>

          <label className="block">
            <span className="block text-[12px] uppercase tracking-wider text-ink-muted mb-1.5">
              Correo electrónico
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[10px] border border-ink/10 bg-white text-ink focus:outline-none focus:border-ink"
            />
          </label>

          <label className="block">
            <span className="block text-[12px] uppercase tracking-wider text-ink-muted mb-1.5">
              Área / Departamento
            </span>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full h-11 px-3 rounded-[10px] border border-ink/10 bg-white text-ink focus:outline-none focus:border-ink"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="mt-4 text-[13px] text-tier1">{error}</p>}

        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-5 rounded-[10px] border border-ink/15 text-ink hover:bg-ink/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-5 rounded-[10px] bg-ink text-white font-medium hover:bg-ink-soft disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar y comenzar diagnóstico →"}
          </button>
        </div>
      </form>
    </div>
  );
}

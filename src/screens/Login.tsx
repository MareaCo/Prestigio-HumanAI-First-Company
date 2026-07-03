import { useState } from "react";
import { useApp } from "@/context/AppContext";

export function LoginScreen() {
  const { navigateTo, setRole } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth simulada (Sprint 1)
    const role = email.trim().toLowerCase() === "admin@empresa.com" ? "admin" : "employee";
    setRole(role);
    navigateTo("dashboard");
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-cream px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col items-center text-center"
      >
        <div
          className="w-12 h-12 rounded-[12px] bg-ink flex items-center justify-center text-white font-display font-bold text-xl mb-6"
          aria-hidden
        >
          H
        </div>

        <h1 className="font-display font-bold text-[1.8rem] leading-tight text-ink">
          Human AI First Company
        </h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          Plataforma de gobierno y observabilidad IA
        </p>

        <div className="w-full mt-10 space-y-4 text-left">
          <label className="block">
            <span className="block text-[13px] font-medium text-ink-soft mb-2">
              Correo electrónico
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-[10px] border border-ink/10 bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors"
              placeholder="tu@empresa.com"
            />
          </label>

          <label className="block">
            <span className="block text-[13px] font-medium text-ink-soft mb-2">
              Contraseña
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 rounded-[10px] border border-ink/10 bg-white text-ink placeholder:text-ink-muted focus:outline-none focus:border-ink transition-colors"
              placeholder="••••••••"
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full mt-6 h-12 rounded-full bg-ink text-white font-medium hover:bg-ink-soft transition-colors"
        >
          Ingresar →
        </button>

        <p className="mt-6 text-[12px] text-ink-muted">
          ¿Primera vez? Solicita acceso a tu administrador.
        </p>
      </form>
    </main>
  );
}

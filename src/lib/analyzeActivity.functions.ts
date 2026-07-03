import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface ActivityAnalysis {
  clara: boolean;
  razon_alerta: string;
  minutos_optimizados: number;
  porcentaje_reduccion: number;
  explicacion: string;
}

export const analyzeActivityFn = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        name: z.string().min(1),
        mins: z.number().int().positive(),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<ActivityAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI Gateway no configurado");

    const prompt = `Eres un experto en productividad y automatización con IA empresarial.
Analiza esta actividad laboral y responde ÚNICAMENTE con JSON válido, sin texto adicional.

Actividad: "${data.name}"
Tiempo actual: ${data.mins} minutos

Una descripción CLARA menciona QUÉ se hace, con QUÉ datos o herramientas, y PARA QUÉ.
Una descripción VAGA es una palabra o frase genérica sin contexto (ej: "reunión", "trabajo diario").

Responde con este JSON exacto (sin markdown, sin comentarios):
{
  "clara": true,
  "razon_alerta": "",
  "minutos_optimizados": ${Math.round(data.mins * 0.4)},
  "porcentaje_reduccion": 60,
  "explicacion": "La IA automatiza la parte repetitiva del proceso"
}

Reglas:
- Si NO es clara: clara=false, razon_alerta explica qué falta (máx 80 chars).
- Si ES clara: estima minutos_optimizados (20%-70% del tiempo actual), porcentaje_reduccion (30-80), explicacion (máx 90 chars).`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (res.status === 429) throw new Error("Límite de uso alcanzado. Intenta de nuevo en un momento.");
    if (res.status === 402) throw new Error("Créditos de IA agotados.");
    if (!res.ok) throw new Error(`AI Gateway error ${res.status}`);

    const body = await res.json();
    const raw: string = body?.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in response");
    return JSON.parse(match[0]) as ActivityAnalysis;
  });

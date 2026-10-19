import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { markdown, grokKey, geminiKey } = await req.json();

    if (!markdown) {
      return NextResponse.json({ error: "Geen content om te polishen" }, { status: 400 });
    }

    const systemPrompt =
      "Maak hiervan schone, goed gestructureerde Markdown. Zet een korte samenvatting bovenaan. Behoud belangrijke details, verwijder ruis, gebruik duidelijke headers en bullets. Antwoord alleen met de Markdown.";

    if (grokKey) {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${grokKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-3",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: markdown.slice(0, 120000) },
          ],
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const polished = data.choices?.[0]?.message?.content || markdown;
        return NextResponse.json({ markdown: polished });
      }
    }

    if (geminiKey) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\n${markdown.slice(0, 100000)}` }],
              },
            ],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const polished = data.candidates?.[0]?.content?.parts?.[0]?.text || markdown;
        return NextResponse.json({ markdown: polished });
      }
    }

    return NextResponse.json(
      { error: "Geen geldige Grok- of Gemini-key opgegeven voor AI-polish." },
      { status: 400 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "AI-polish mislukt" }, { status: 500 });
  }
}

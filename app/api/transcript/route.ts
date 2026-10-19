import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(req: NextRequest) {
  try {
    const { url, geminiKey } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is verplicht" }, { status: 400 });
    }

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(url);
      const text = transcript.map((t) => t.text).join(" ");
      const title = "YouTube Transcript";
      return NextResponse.json({
        markdown: `# ${title}\n\n${text}`,
        title,
      });
    } catch (err: any) {
      if (geminiKey) {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Geef een volledige transcriptie of gedetailleerde samenvatting van deze video: ${url}. Formatteer als schone Markdown met timestamps waar mogelijk.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          return NextResponse.json({
            markdown: `# Video Transcript (Gemini)\n\n${text}`,
            title: "Video (Gemini)",
          });
        }
      }

      return NextResponse.json(
        {
          error:
            "Transcript ophalen mislukt. YouTube blokkeert vaak cloud-IPs. Probeer een Gemini-key of een lokale omgeving.",
        },
        { status: 502 }
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Transcript mislukt" }, { status: 500 });
  }
}

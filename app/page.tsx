"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Completeness = "all" | "main" | "ai";
type HistoryItem = { url: string; title: string; preview: string; ts: number };

export default function Home() {
  const [url, setUrl] = useState("");
  const [completeness, setCompleteness] = useState<Completeness>("main");
  const [filters, setFilters] = useState({
    text: true,
    links: true,
    metadata: true,
    tables: true,
    images: false,
    code: true,
    headers: true,
  });
  const [jinaKey, setJinaKey] = useState("");
  const [grokKey, setGrokKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [title, setTitle] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("url2md-history");
    if (saved) setHistory(JSON.parse(saved));
    const keys = localStorage.getItem("url2md-keys");
    if (keys) {
      const k = JSON.parse(keys);
      setJinaKey(k.jina || "");
      setGrokKey(k.grok || "");
      setGeminiKey(k.gemini || "");
    }
  }, []);

  const saveKeys = () => {
    localStorage.setItem(
      "url2md-keys",
      JSON.stringify({ jina: jinaKey, grok: grokKey, gemini: geminiKey })
    );
  };

  const isYouTube = (u: string) =>
    /youtube\.com|youtu\.be/i.test(u);

  const handleGenerate = async () => {
    if (!url.trim()) {
      setError("Vul een URL in.");
      return;
    }
    setLoading(true);
    setError("");
    setMarkdown("");
    saveKeys();

    try {
      let result: { markdown: string; title: string };

      if (isYouTube(url)) {
        const res = await fetch("/api/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, geminiKey }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Transcript mislukt");
        result = data;
      } else {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, jinaKey, completeness, filters }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Scrape mislukt");
        result = data;
      }

      let finalMd = result.markdown;

      if (completeness === "ai" && (grokKey || geminiKey)) {
        const polishRes = await fetch("/api/ai-polish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            markdown: finalMd,
            grokKey,
            geminiKey,
          }),
        });
        const polishData = await polishRes.json();
        if (polishRes.ok) finalMd = polishData.markdown;
      }

      setMarkdown(finalMd);
      setTitle(result.title || "Resultaat");

      const item: HistoryItem = {
        url,
        title: result.title || url,
        preview: finalMd.slice(0, 180),
        ts: Date.now(),
      };
      const newHist = [item, ...history.filter((h) => h.url !== url)].slice(0, 10);
      setHistory(newHist);
      localStorage.setItem("url2md-history", JSON.stringify(newHist));
    } catch (e: any) {
      setError(e.message || "Er ging iets mis.");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!markdown) return;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/[^a-z0-9]/gi, "_") || "export"}.md`;
    a.click();
  };

  const copy = async () => {
    if (!markdown) return;
    await navigator.clipboard.writeText(markdown);
    alert("Gekopieerd naar klembord.");
  };

  const sendEmail = () => {
    if (!markdown) return;
    const subject = encodeURIComponent(`URL2MD: ${title}`);
    const body = encodeURIComponent(markdown.slice(0, 2000) + "\n\n[...volledige MD via download]");
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          URL2MD
        </h1>
        <p className="text-zinc-400 mt-2">Website info en video-transcripts als schone Markdown</p>
      </header>

      <div className="glass p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-1">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com of YouTube-link"
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Volledigheid</label>
            <select
              value={completeness}
              onChange={(e) => setCompleteness(e.target.value as Completeness)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2"
            >
              <option value="all">Alles (ruwe MD)</option>
              <option value="main">Main content only</option>
              <option value="ai">AI-gefilterd (key nodig)</option>
            </select>
          </div>
          <div className="text-sm text-zinc-500 flex items-end">
            YouTube wordt automatisch als transcript behandeld.
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-zinc-400 mb-2">Filters</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {Object.entries(filters).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => setFilters({ ...filters, [key]: e.target.checked })}
                  className="accent-cyan-400"
                />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <details className="mb-4 text-sm">
          <summary className="cursor-pointer text-zinc-400">API-keys (optioneel, lokaal opgeslagen)</summary>
          <div className="mt-3 space-y-2">
            <input
              type="password"
              placeholder="Jina API key (optioneel)"
              value={jinaKey}
              onChange={(e) => setJinaKey(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Grok API key"
              value={grokKey}
              onChange={(e) => setGrokKey(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Gemini API key"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded px-3 py-2"
            />
          </div>
        </details>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Bezig..." : "Genereer"}
          </button>
          <button onClick={download} disabled={!markdown} className="btn-secondary px-4 py-3 rounded-lg disabled:opacity-40">
            Download .md
          </button>
          <button onClick={copy} disabled={!markdown} className="btn-secondary px-4 py-3 rounded-lg disabled:opacity-40">
            Kopieer
          </button>
          <button onClick={sendEmail} disabled={!markdown} className="btn-secondary px-4 py-3 rounded-lg disabled:opacity-40">
            Stuur naar e-mail
          </button>
        </div>

        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </div>

      {markdown && (
        <div className="glass p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-sm text-cyan-400 hover:underline"
            >
              {showRaw ? "Preview" : "Raw"}
            </button>
          </div>
          {showRaw ? (
            <pre className="bg-zinc-950 p-4 rounded-lg overflow-auto text-sm max-h-[60vh] whitespace-pre-wrap">
              {markdown}
            </pre>
          ) : (
            <div className="prose prose-invert max-w-none prose-headings:text-cyan-300 prose-a:text-cyan-400">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="glass p-6">
          <h3 className="font-semibold mb-3">Recente resultaten</h3>
          <ul className="space-y-2 text-sm">
            {history.map((h) => (
              <li key={h.ts} className="flex justify-between items-start gap-4">
                <div>
                  <button
                    onClick={() => setUrl(h.url)}
                    className="text-cyan-400 hover:underline text-left"
                  >
                    {h.title}
                  </button>
                  <p className="text-zinc-500 text-xs truncate max-w-md">{h.preview}</p>
                </div>
                <span className="text-zinc-600 text-xs">{new Date(h.ts).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="mt-12 text-center text-xs text-zinc-600">
        <p>
          Je bent zelf verantwoordelijk voor Terms of Service en robots.txt van de bronnen.{" "}
          <a href="/terms" className="underline">Voorwaarden</a>
        </p>
      </footer>
    </div>
  );
}

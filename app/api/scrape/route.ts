import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url, jinaKey, completeness, filters } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is verplicht" }, { status: 400 });
    }

    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    const headers: HeadersInit = {
      "Accept": "application/json",
      "X-Return-Format": "markdown",
    };
    if (jinaKey) {
      headers["Authorization"] = `Bearer ${jinaKey}`;
    }

    const res = await fetch(jinaUrl, { headers });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Jina Reader fout: ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") || "";
    let markdown = "";
    let title = "Pagina";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      markdown = data.data?.content || data.content || "";
      title = data.data?.title || data.title || title;
    } else {
      markdown = await res.text();
    }

    if (!filters?.links) {
      markdown = markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    }
    if (!filters?.images) {
      markdown = markdown.replace(/!\[.*?\]\(.*?\)/g, "");
    }

    return NextResponse.json({ markdown, title });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Scrape mislukt" }, { status: 500 });
  }
}

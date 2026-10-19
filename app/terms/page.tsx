export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto p-8 prose prose-invert">
      <h1>Voorwaarden van gebruik</h1>
      <p>URL2MD is een tool om publieke webpagina’s en video’s om te zetten naar Markdown.</p>
      <ul>
        <li>Je bent zelf verantwoordelijk voor het naleven van de Terms of Service en robots.txt van de bronnen die je scraped.</li>
        <li>Gebruik de tool niet voor illegale doeleinden of om content te herdistribueren zonder toestemming.</li>
        <li>API-keys die je invult worden alleen lokaal in je browser opgeslagen en naar de server gestuurd alleen voor de specifieke request.</li>
        <li>Er is geen garantie dat elke site of video succesvol wordt verwerkt (anti-bot, IP-blocks, etc.).</li>
        <li>Deze tool is “as is” zonder enige garantie.</li>
      </ul>
      <p className="text-sm text-zinc-500 mt-8">Template — geen juridisch advies.</p>
    </div>
  );
}

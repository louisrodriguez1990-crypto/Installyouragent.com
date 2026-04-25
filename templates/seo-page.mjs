export const SITE = {
  name: "Install Your Agent",
  url: "https://installyouragent.com",
  email: "hi@installyouragent.com",
};

const css = `
  :root{--ink:#0a0a0a;--panel:#0d0d0d;--line:#1c1c1c;--line2:#262626;--paper:#ededed;--mute:#9a9a9a;--accent:#6dff7a;--accent-ink:#06170a}
  *{box-sizing:border-box}
  html{background:var(--ink);color:var(--paper);font-family:"Inter Tight",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
  body{margin:0;background:var(--ink);color:var(--paper)}
  a{color:inherit}
  .mono,code{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
  .wrap{width:min(1160px,calc(100% - 40px));margin-inline:auto}
  .top{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:26px 0;border-bottom:1px solid var(--line)}
  .brand{display:flex;align-items:center;gap:12px;text-decoration:none;font-weight:700;letter-spacing:-.02em}
  .dot{width:8px;height:8px;border-radius:999px;background:var(--accent);box-shadow:0 0 0 5px rgba(109,255,122,.1)}
  .nav{display:flex;gap:18px;align-items:center;color:var(--mute);font-size:13px}
  .nav a{text-decoration:none}.nav a:hover{color:var(--paper)}
  .hero{padding:82px 0 56px;border-bottom:1px solid var(--line)}
  .eyebrow{color:var(--mute);font-size:11px;letter-spacing:.16em;text-transform:uppercase}
  h1{font-size:clamp(2.7rem,7vw,6.3rem);line-height:.94;letter-spacing:-.045em;margin:18px 0 24px;max-width:980px}
  .lead{font-size:clamp(1.1rem,2vw,1.45rem);line-height:1.45;color:#cfcfcf;max-width:760px;margin:0}
  .answer{margin-top:34px;padding:22px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line);display:grid;grid-template-columns:180px 1fr;gap:24px}
  .answer p{margin:0;color:#d8d8d8;line-height:1.6}
  .cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:34px}
  .btn{display:inline-flex;align-items:center;gap:.6rem;padding:.95rem 1.18rem;border:1px solid var(--line2);text-decoration:none;font-weight:700}
  .btn-primary{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
  .btn-ghost:hover{border-color:#3a3a3a;background:#111}
  main section{padding:58px 0;border-bottom:1px solid var(--line)}
  .grid{display:grid;grid-template-columns:minmax(220px,330px) 1fr;gap:48px;align-items:start}
  h2{font-size:clamp(1.7rem,3.4vw,3rem);line-height:1;letter-spacing:-.035em;margin:0}
  h3{font-size:1.2rem;letter-spacing:-.02em;margin:0 0 10px}
  p{line-height:1.65}
  .muted{color:var(--mute)}
  .panel{border:1px solid var(--line2);background:var(--panel);padding:24px}
  .list{display:grid;gap:14px;margin:0;padding:0;list-style:none}
  .list li{border-top:1px solid var(--line);padding-top:14px;color:#d8d8d8;line-height:1.55}
  .list li:first-child{border-top:0;padding-top:0}
  .cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}
  .pill-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
  .pill{border:1px solid var(--line2);color:#cfcfcf;padding:7px 10px;font-size:12px}
  .price{font-size:clamp(2rem,4vw,3.5rem);letter-spacing:-.04em;line-height:1;font-weight:800;margin:6px 0 12px}
  details{border-top:1px solid var(--line);padding:18px 0}
  summary{cursor:pointer;font-weight:700;font-size:1.1rem}
  details p{color:#cfcfcf;margin:10px 0 0;max-width:760px}
  .related{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
  .related a{border:1px solid var(--line2);padding:14px;text-decoration:none;color:#d8d8d8}.related a:hover{border-color:var(--accent);color:var(--paper)}
  footer{padding:42px 0;color:var(--mute)}
  @media (max-width:760px){.top{align-items:flex-start}.nav{display:none}.hero{padding:56px 0 42px}.answer,.grid,.cols,.related{grid-template-columns:1fr}h1{font-size:clamp(2.45rem,15vw,4rem)}}
`;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function list(items) {
  return `<ul class="list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function faqHtml(faq) {
  return faq.map((item) => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join("");
}

function pageUrl(page) {
  return `${SITE.url}/${page.slug}/`;
}

function offerPrice(priceAnchor = "") {
  const lower = priceAnchor.toLowerCase();
  const match = lower.match(/(\d+(?:\.\d+)?)\s*k/);
  if (match) return String(Math.round(Number(match[1]) * 1000));
  const numeric = lower.match(/\d[\d,]*/);
  return numeric ? numeric[0].replaceAll(",", "") : "3000";
}

export function renderSeoPage(page, pagesBySlug) {
  const canonical = pageUrl(page);
  const related = page.relatedSlugs
    .map((slug) => pagesBySlug.get(slug))
    .filter(Boolean);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${canonical}#service`,
      "name": page.h1,
      "serviceType": page.primaryKeyword,
      "provider": { "@type": "Organization", "name": SITE.name, "url": SITE.url },
      "areaServed": "US",
      "description": page.description,
      "offers": { "@type": "Offer", "priceCurrency": "USD", "price": offerPrice(page.priceAnchor), "availability": "https://schema.org/InStock" }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${canonical}#faq`,
      "mainEntity": page.faq.map((item) => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": { "@type": "Answer", "text": item.a }
      }))
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE.url}/` },
        { "@type": "ListItem", "position": 2, "name": "Agent install guides", "item": `${SITE.url}/seo/` },
        { "@type": "ListItem", "position": 3, "name": page.h1, "item": canonical }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${canonical}#article`,
      "headline": page.h1,
      "description": page.description,
      "author": { "@type": "Organization", "name": SITE.name },
      "publisher": { "@type": "Organization", "name": SITE.name },
      "dateModified": page.lastReviewed,
      "datePublished": page.lastReviewed,
      "mainEntityOfPage": canonical
    }
  ];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<title>${escapeHtml(page.title)}</title>
<meta name="description" content="${escapeHtml(page.description)}" />
<link rel="canonical" href="${canonical}" />
<meta name="robots" content="index,follow" />
<meta name="theme-color" content="#0a0a0a" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter+Tight:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<style>${css}</style>
${jsonLd.map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join("\n")}
</head>
<body>
<header class="wrap top">
  <a class="brand" href="/"><span class="dot" aria-hidden="true"></span><span>${SITE.name}</span></a>
  <nav class="nav mono" aria-label="Primary"><a href="/seo/">Install guides</a><a href="/#book">Book intake</a><a href="mailto:${SITE.email}">${SITE.email}</a></nav>
</header>
<main>
  <section class="hero">
    <div class="wrap">
      <div class="eyebrow mono">${escapeHtml(page.cluster)} / last reviewed ${escapeHtml(page.lastReviewed)}</div>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lead">${escapeHtml(page.intro)}</p>
      <div class="answer">
        <div class="eyebrow mono">Short answer</div>
        <p>${escapeHtml(page.answer)}</p>
      </div>
      <div class="cta-row"><a class="btn btn-primary" href="/#book">Book a 15-min intake <span aria-hidden="true">-&gt;</span></a><a class="btn btn-ghost" href="mailto:${SITE.email}">Email the install brief</a></div>
    </div>
  </section>

  <section>
    <div class="wrap grid">
      <div><div class="eyebrow mono">Worth paying for</div><h2>When this install makes commercial sense.</h2></div>
      <div class="panel">
        <p>${escapeHtml(page.worthPayingFor)}</p>
        <div class="price">${escapeHtml(page.priceAnchor)}</div>
        <p class="muted">Smaller experiments can start with a lighter diagnostic, but serious installs usually need production routing, permissions, handoff, and recovery work.</p>
        <div class="pill-row">${page.secondaryKeywords.map((kw) => `<span class="pill mono">${escapeHtml(kw)}</span>`).join("")}</div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap grid">
      <div><div class="eyebrow mono">Blueprint</div><h2>Install stack and workflow.</h2></div>
      <div class="cols">
        <div class="panel"><h3>Install stack</h3>${list(page.installStack)}</div>
        <div class="panel"><h3>Workflow</h3>${list(page.workflow)}</div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap grid">
      <div><div class="eyebrow mono">Build notes</div><h2>Checklist, integrations, and decision criteria.</h2></div>
      <div class="cols">
        <div class="panel"><h3>Implementation checklist</h3>${list(page.checklist)}</div>
        <div class="panel"><h3>Integrations</h3>${list(page.integrations)}<h3 style="margin-top:24px">Decision criteria</h3>${list(page.decisionCriteria)}</div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap grid">
      <div><div class="eyebrow mono">Controls</div><h2>Risks, security, and acceptance tests.</h2></div>
      <div class="cols">
        <div class="panel"><h3>Risks to handle before launch</h3>${list(page.risks)}<h3 style="margin-top:24px">Security notes</h3>${list(page.securityNotes)}</div>
        <div class="panel"><h3>Acceptance tests</h3>${list(page.acceptanceTests)}</div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap grid">
      <div><div class="eyebrow mono">FAQ</div><h2>Questions buyers ask before install.</h2></div>
      <div>${faqHtml(page.faq)}</div>
    </div>
  </section>

  <section>
    <div class="wrap grid">
      <div><div class="eyebrow mono">Related</div><h2>Keep researching.</h2></div>
      <div class="related">${related.map((item) => `<a href="/${item.slug}/">${escapeHtml(item.h1)}</a>`).join("")}</div>
    </div>
  </section>
</main>
<footer class="wrap">
  <p class="mono">Built from practical installation checklists, security constraints, routing decisions, and buyer qualification criteria.</p>
  <p class="mono">&copy; ${new Date().getFullYear()} ${SITE.name} / <a href="/seo/">agent install guides</a></p>
</footer>
</body>
</html>`;
}

export function renderHub(pages) {
  const grouped = Map.groupBy(pages, (page) => page.cluster);
  const groups = Array.from(grouped, ([cluster, items]) => ({ cluster, items }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "AI agent installation guides",
    "url": `${SITE.url}/seo/`,
    "description": "Browse high-ticket AI agent installation guides by use case, industry, platform, and buying decision."
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<title>AI Agent Installation Guides | Install Your Agent</title>
<meta name="description" content="A 50-page guide library for buyers planning serious AI agent installs: use cases, industries, platforms, pricing, security, and implementation checklists." />
<link rel="canonical" href="${SITE.url}/seo/" />
<meta name="robots" content="index,follow" />
<meta name="theme-color" content="#0a0a0a" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter+Tight:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<style>${css}</style>
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
</head>
<body>
<header class="wrap top">
  <a class="brand" href="/"><span class="dot" aria-hidden="true"></span><span>${SITE.name}</span></a>
  <nav class="nav mono" aria-label="Primary"><a href="/#book">Book intake</a><a href="mailto:${SITE.email}">${SITE.email}</a></nav>
</header>
<main>
  <section class="hero">
    <div class="wrap">
      <div class="eyebrow mono">50 install guides / use-case led</div>
      <h1>AI agent installation guides for serious business workflows.</h1>
      <p class="lead">Use this library to decide what to install, where it should run, how it should connect to your tools, and whether the work is worth a Pro or Operator-level build.</p>
      <div class="cta-row"><a class="btn btn-primary" href="/#book">Book a 15-min intake <span aria-hidden="true">-&gt;</span></a><a class="btn btn-ghost" href="/">Back to homepage</a></div>
    </div>
  </section>
  ${groups.map(({ cluster, items }) => `<section><div class="wrap grid"><div><div class="eyebrow mono">${escapeHtml(cluster)}</div><h2>${escapeHtml(cluster)} guides.</h2></div><div class="related">${items.map((page) => `<a href="/${page.slug}/">${escapeHtml(page.h1)}</a>`).join("")}</div></div></section>`).join("")}
</main>
<footer class="wrap"><p class="mono">Built for buyers comparing real install paths: criteria, risks, tests, and buyer-fit notes.</p></footer>
</body>
</html>`;
}

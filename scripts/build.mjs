import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { renderHub, renderSeoPage, SITE } from "../templates/seo-page.mjs";

const root = process.cwd();
const outDir = path.join(root, "dist");
const pagesPath = path.join(root, "content", "pages.json");
const checkOnly = process.argv.includes("--check");
const required = [
  "slug", "cluster", "primaryKeyword", "secondaryKeywords", "buyer", "useCase",
  "priceAnchor", "ctaVariant", "title", "description", "h1", "intro", "answer",
  "worthPayingFor", "installStack", "integrations", "workflow", "checklist",
  "risks", "securityNotes", "decisionCriteria", "acceptanceTests", "faq",
  "relatedSlugs", "lastReviewed"
];

const defaultDate = "2026-04-25";

function normalizePage(page) {
  const specific = page.specifics || [];
  const keyword = page.primaryKeyword;
  const buyer = page.buyer;
  const useCase = page.useCase;
  return {
    secondaryKeywords: page.secondaryKeywords || [
      `${keyword} help`,
      `${useCase} agent setup`,
      `${buyer} AI automation`
    ],
    priceAnchor: page.priceAnchor || "$3k-$10k+",
    ctaVariant: page.ctaVariant || "Book a 15-min install intake",
    installStack: page.installStack || [
      specific[0] || `Install the agent runtime around ${useCase}.`,
      specific[1] || `Connect the agent to the tools ${buyer} already use.`,
      "Use OpenClaw for orchestration with cloud routing through OpenRouter or local routing through Ollama.",
      "Run the gateway on a dedicated VPS, Mac mini, or locked-down local machine with restart monitoring."
    ],
    integrations: page.integrations || [
      specific[2] || "Primary chat channel for operator commands and status checks.",
      "Email, calendar, CRM, or spreadsheet system where the work is recorded.",
      "Logging destination for transcripts, tool calls, failed jobs, and handoff notes."
    ],
    workflow: page.workflow || [
      `Capture the inbound request for ${useCase} with source, owner, urgency, and missing fields.`,
      specific[3] || "Classify the task before the agent takes action so low-confidence work goes to a human.",
      "Draft or execute the next step only inside approved permissions and rate limits.",
      "Write the result back to the system of record and send a short operator summary."
    ],
    checklist: page.checklist || [
      specific[4] || `Map the exact ${useCase} workflow before installing tools.`,
      "Create allowlisted actions, forbidden actions, and escalation phrases.",
      "Test the agent with real-looking but non-sensitive samples before live credentials are added.",
      "Record a handoff Loom covering restart, credential rotation, logs, and rollback."
    ],
    risks: page.risks || [
      "The agent can create business risk if it acts without approval on payments, legal commitments, or customer promises.",
      "Messy source data can cause confident but wrong updates unless the workflow includes verification steps.",
      "Channel outages, expired tokens, and model latency need a manual fallback path."
    ],
    securityNotes: page.securityNotes || [
      "Use least-privilege API keys and separate test credentials from live credentials.",
      "Keep memory, logs, and uploaded files out of public folders and shared drives.",
      "Rotate credentials after handoff and disable installer access unless ongoing support is contracted."
    ],
    decisionCriteria: page.decisionCriteria || [
      `The workflow repeats often enough that ${buyer} can measure time saved or revenue protected.`,
      "The tools have stable APIs, inbox rules, exports, or admin access.",
      "A human can define what good, bad, and uncertain outputs look like."
    ],
    acceptanceTests: page.acceptanceTests || [
      `The agent completes a full ${useCase} test from trigger to logged outcome.`,
      "A low-confidence or risky request is escalated instead of executed.",
      "Restarting the gateway does not lose memory, credentials, routing, or scheduled work."
    ],
    faq: page.faq || [
      {
        q: `Is ${keyword} worth paying for?`,
        a: `It is usually worth it when ${useCase} affects revenue, response speed, or operational capacity and the buyer needs a maintained install rather than a weekend experiment.`
      },
      {
        q: "Can this run locally instead of in the cloud?",
        a: "Yes. The install can use a local model through Ollama or a hybrid path where sensitive tasks stay local and heavier reasoning routes through OpenRouter."
      }
    ],
    lastReviewed: page.lastReviewed || defaultDate,
    ...page
  };
}

function fail(message) {
  throw new Error(message);
}

function assertArray(page, key, min) {
  if (!Array.isArray(page[key]) || page[key].length < min) {
    fail(`${page.slug || "unknown"} needs ${key} with at least ${min} items`);
  }
}

function validatePages(pages) {
  if (!Array.isArray(pages)) fail("content/pages.json must be an array");
  if (pages.length !== 50) fail(`Expected exactly 50 pages, found ${pages.length}`);

  const seen = new Set();
  const titles = new Set();
  const descriptions = new Set();
  const h1s = new Set();
  const slugs = new Set(pages.map((page) => page.slug));

  for (const page of pages) {
    for (const key of required) {
      if (page[key] === undefined || page[key] === "" || page[key] === null) {
        fail(`${page.slug || "unknown"} is missing ${key}`);
      }
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(page.slug)) fail(`${page.slug} is not a clean slug`);
    if (seen.has(page.slug)) fail(`Duplicate slug: ${page.slug}`);
    seen.add(page.slug);
    for (const [label, value, set] of [["title", page.title, titles], ["description", page.description, descriptions], ["h1", page.h1, h1s]]) {
      if (set.has(value)) fail(`Duplicate ${label}: ${value}`);
      set.add(value);
    }
    if (page.title.length > 70) fail(`${page.slug} title is too long`);
    if (page.description.length > 170) fail(`${page.slug} description is too long`);
    assertArray(page, "specifics", 5);
    assertArray(page, "secondaryKeywords", 3);
    assertArray(page, "installStack", 4);
    assertArray(page, "integrations", 3);
    assertArray(page, "workflow", 4);
    assertArray(page, "checklist", 4);
    assertArray(page, "risks", 3);
    assertArray(page, "securityNotes", 3);
    assertArray(page, "decisionCriteria", 3);
    assertArray(page, "acceptanceTests", 3);
    assertArray(page, "relatedSlugs", 4);
    if (page.relatedSlugs.length > 6) fail(`${page.slug} has more than 6 related links`);
    for (const slug of page.relatedSlugs) {
      if (!slugs.has(slug)) fail(`${page.slug} links to missing slug ${slug}`);
      if (slug === page.slug) fail(`${page.slug} links to itself`);
    }
    if (!Array.isArray(page.faq) || page.faq.length < 2) fail(`${page.slug} needs at least 2 FAQ entries`);
    for (const item of page.faq) {
      if (!item.q || !item.a) fail(`${page.slug} has an incomplete FAQ item`);
    }
  }
}

async function parseJsonLdFromHtml(filePath) {
  const html = await readFile(filePath, "utf8");
  const blocks = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const block of blocks) JSON.parse(block[1]);
  const links = [...html.matchAll(/href="\/([a-z0-9-]+)\/"/g)].map((match) => match[1]);
  return links;
}

async function validateGenerated(pages) {
  const slugs = new Set(pages.map((page) => page.slug));
  for (const page of pages) {
    const filePath = path.join(outDir, page.slug, "index.html");
    if (!existsSync(filePath)) fail(`Missing generated page for ${page.slug}`);
    const links = await parseJsonLdFromHtml(filePath);
    for (const link of links) {
      if (["seo"].includes(link)) continue;
      if (!slugs.has(link)) fail(`${page.slug} links to ungenerated slug ${link}`);
    }
  }

  const sitemap = await readFile(path.join(outDir, "sitemap.xml"), "utf8");
  for (const page of pages) {
    if (!sitemap.includes(`${SITE.url}/${page.slug}/`)) fail(`Sitemap missing ${page.slug}`);
  }
}

async function build() {
  const pages = JSON.parse(await readFile(pagesPath, "utf8")).map(normalizePage);
  validatePages(pages);

  const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));
  if (!checkOnly) {
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });
    await copyFile(path.join(root, "index.html"), path.join(outDir, "index.html"));
    if (existsSync(path.join(root, "uploads"))) {
      await cp(path.join(root, "uploads"), path.join(outDir, "uploads"), { recursive: true });
    }

    await mkdir(path.join(outDir, "seo"), { recursive: true });
    await writeFile(path.join(outDir, "seo", "index.html"), renderHub(pages), "utf8");

    for (const page of pages) {
      const pageDir = path.join(outDir, page.slug);
      await mkdir(pageDir, { recursive: true });
      await writeFile(path.join(pageDir, "index.html"), renderSeoPage(page, pagesBySlug), "utf8");
    }

    const urls = [`${SITE.url}/`, `${SITE.url}/seo/`, ...pages.map((page) => `${SITE.url}/${page.slug}/`)];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`;
    await writeFile(path.join(outDir, "sitemap.xml"), sitemap, "utf8");
    await writeFile(path.join(outDir, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`, "utf8");
  }

  if (!checkOnly) await validateGenerated(pages);
  console.log(`${checkOnly ? "Checked" : "Built"} ${pages.length} SEO pages.`);
}

build().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

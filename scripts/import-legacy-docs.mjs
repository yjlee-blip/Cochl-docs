// One-off importer: pulls content + images from the legacy docs.cochl.ai site
// and writes MDX + meta.json into content/docs, preserving original image filenames.
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import fs from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://docs.cochl.ai';
const CONTENT_DIR = path.resolve('content/docs');
const IMAGE_DIR = path.resolve('public/images/docs');

// Legacy site uses a few fence languages Shiki doesn't recognize by id; map to
// the closest grammar it does ship.
const LANG_ALIASES = { gradle: 'groovy' };

// "section.key/folder" -> title of that folder's index page, so nested
// meta.json files can set a proper title instead of a humanized-slug guess.
const folderTitles = new Map();

// Ordered IA, mirroring the legacy sidebar exactly (see docs.cochl.ai/sense/home/introduction/).
// "---Label---" entries become meta.json separators.
const SECTIONS = [
  {
    key: 'home',
    title: 'Home',
    pages: [
      { old: '/sense/home/introduction/', slug: 'introduction' },
      { old: '/sense/home/dashboardquickstart/', slug: 'dashboard-quickstart' },
    ],
  },
  {
    key: 'cloud-api',
    title: 'Cochl.Sense Cloud API',
    pages: [
      { old: '/sense/cochl.sense-cloud-api/gettingstarted/', slug: 'getting-started' },
      { separator: 'Features' },
      { old: '/sense/cochl.sense-cloud-api/audioinsights/', slug: 'audio-insights' },
      { old: '/sense/cochl.sense-cloud-api/soundeventdetection/', slug: 'sound-event-detection/index' },
      { old: '/sense/cochl.sense-cloud-api/soundeventdetection/soundtags/', slug: 'sound-event-detection/sound-tags' },
      { old: '/sense/cochl.sense-cloud-api/speechanalysis/', slug: 'speech-analysis/index' },
      { old: '/sense/cochl.sense-cloud-api/speechanalysis/customspeakerprofile/', slug: 'speech-analysis/custom-speaker-profile' },
      { separator: 'Reference' },
      { old: '/sense/cochl.sense-cloud-api/referencerest/', slug: 'rest-api-reference' },
      { old: '/sense/cochl.sense-cloud-api/gcpmarketplace/', slug: 'self-hosting' },
      { old: '/sense/cochl.sense-cloud-api/releasenote/', slug: 'release-notes' },
    ],
  },
  {
    key: 'edge-sdk',
    title: 'Cochl.Sense Edge SDK',
    pages: [
      { old: '/sense/cochl.sense-edge-sdk/gettingstarted/', slug: 'getting-started' },
      { separator: 'Features' },
      { old: '/sense/cochl.sense-edge-sdk/soundeventdetection/', slug: 'sound-event-detection/index' },
      { old: '/sense/cochl.sense-edge-sdk/soundeventdetection/soundtags/', slug: 'sound-event-detection/sound-tags' },
      { old: '/sense/cochl.sense-edge-sdk/soundeventdetection/customsound/', slug: 'sound-event-detection/custom-sound' },
      { separator: 'Reference' },
      { old: '/sense/cochl.sense-edge-sdk/sample/', slug: 'samples' },
      { old: '/sense/cochl.sense-edge-sdk/advancedconfigurations/', slug: 'advanced-configurations' },
      { old: '/sense/cochl.sense-edge-sdk/resources/', slug: 'resources' },
      { old: '/sense/cochl.sense-edge-sdk/benchmark/', slug: 'benchmark' },
      { old: '/sense/cochl.sense-edge-sdk/releasenote/', slug: 'release-notes' },
    ],
  },
  {
    key: 'security',
    title: 'Cochl Security',
    pages: [
      { separator: 'Overview' },
      { old: '/sense/cochl-security/introduction/', slug: 'introduction' },
      { old: '/sense/cochl-security/howitworks/', slug: 'how-it-works' },
      { separator: 'Getting Started' },
      { old: '/sense/cochl-security/quickstart/', slug: 'quickstart' },
      { old: '/sense/cochl-security/trial/', slug: 'trial' },
      { separator: 'Plans' },
      { old: '/sense/cochl-security/pricing/', slug: 'pricing' },
      { separator: 'Support' },
      { old: '/sense/cochl-security/support/', slug: 'support' },
      { old: '/sense/cochl-security/constraints/', slug: 'constraints' },
    ],
  },
  {
    key: 'faqs',
    title: 'FAQs',
    pages: [{ old: '/sense/faqs/', slug: 'index' }],
  },
];

// old absolute path -> new in-site path, for rewriting cross-links
const urlMap = new Map();
for (const section of SECTIONS) {
  for (const p of section.pages) {
    if (p.separator) continue;
    const newSlug = p.slug.endsWith('/index') ? p.slug.slice(0, -'/index'.length) : p.slug;
    urlMap.set(p.old, `/docs/${section.key}/${newSlug}`);
  }
}

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
turndown.use(gfm);

async function downloadImage(srcUrl) {
  const filename = decodeURIComponent(srcUrl.split('/').pop().split('?')[0]);
  const dest = path.join(IMAGE_DIR, filename);
  try {
    await fs.access(dest);
  } catch {
    const res = await fetch(srcUrl);
    if (!res.ok) throw new Error(`Failed to fetch image ${srcUrl}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.mkdir(IMAGE_DIR, { recursive: true });
    await fs.writeFile(dest, buf);
  }
  return `/images/docs/${filename}`;
}

function mdxAttr(value) {
  return JSON.stringify(value ?? '');
}

// The legacy site serves the same static <meta name="description"> on every
// page, so it's useless as a per-page subtitle. Derive a real one-liner from
// the first plain paragraph instead (skip if the page opens with a heading
// or a component — better to show nothing than something misleading).
function deriveDescription(markdown) {
  const firstBlock = markdown.split(/\n{2,}/).find((block) => block.trim().length > 0);
  if (!firstBlock || /^[#<]/.test(firstBlock.trim())) return '';

  const plain = firstBlock
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (plain.length <= 155) return plain;
  return plain.slice(0, 155).replace(/\s+\S*$/, '') + '…';
}

// old path (with optional #fragment) -> new in-site path, falling back to the
// legacy site itself for anything outside our 27-page import.
function rewriteHref(href) {
  const hashIndex = href.indexOf('#');
  const base = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : href.slice(hashIndex);
  if (urlMap.has(base)) return urlMap.get(base) + fragment;
  if (base.startsWith('/')) return SITE + href;
  return href;
}

async function importPage(section, pageDef) {
  const url = SITE + pageDef.old;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const article = $('article.content');
  const h1 = $('article.content > h1').first();
  const title = h1.text().trim();
  h1.remove();
  article.find('nav.breadcrumb').remove();

  // rewrite internal links to point at the new IA (handles #fragments too)
  article.find('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) $(el).attr('href', rewriteHref(href));
  });

  // download + rewrite images, preserving original filenames
  const imgs = article.find('img').toArray();
  for (const el of imgs) {
    const src = $(el).attr('src');
    if (!src) continue;
    const absolute = src.startsWith('http') ? src : new URL(src, url).toString();
    const localSrc = await downloadImage(absolute);
    $(el).attr('src', localSrc);
  }

  // legacy "github-repo-card" links -> Fumadocs <Card>
  const placeholders = new Map();
  let placeholderId = 0;
  article.find('a.github-repo-card').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') ?? '';
    const repo = $el.find('.github-repo-card__repo').text().trim();
    const desc = $el.find('.github-repo-card__desc').text().trim();
    const token = `%%PLACEHOLDER-${placeholderId++}%%`;
    placeholders.set(
      token,
      `<Card title={${mdxAttr(repo)}} description={${mdxAttr(desc)}} href=${mdxAttr(href)} external />`,
    );
    $el.replaceWith(`<p>${token}</p>`);
  });

  // legacy tag/category card grids (e.g. "sed-category-grid") -> Fumadocs <Cards>
  article.find('[class$="-grid"]').each((_, el) => {
    const $grid = $(el);
    const cardLinks = $grid.find('> a').toArray();
    if (cardLinks.length === 0) return;
    const cards = cardLinks
      .map((cardEl) => {
        const $card = $(cardEl);
        const href = $card.attr('href') ?? '';
        const divs = $card.find('> div').toArray();
        const cardTitle = divs[0] ? $(divs[0]).text().trim() : $card.text().trim();
        const cardDesc = divs[1] ? $(divs[1]).text().trim() : '';
        // href is already rewritten by the earlier a[href] pass — don't double-rewrite
        return `<Card title={${mdxAttr(cardTitle)}} description={${mdxAttr(cardDesc)}} href=${mdxAttr(href)} />`;
      })
      .join('\n');
    const token = `%%PLACEHOLDER-${placeholderId++}%%`;
    placeholders.set(token, `<Cards>\n\n${cards}\n\n</Cards>`);
    $grid.replaceWith(`<p>${token}</p>`);
  });

  // legacy pymdown-style "tabbed" OS/language pickers -> Fumadocs <Tabs>
  article.find('.tabbed-container, div.tabbed').each((_, el) => {
    const $set = $(el);
    const $tabbed = $set.hasClass('tabbed') ? $set : $set.find('> .tabbed').first();
    if ($tabbed.length === 0) return;
    const labels = $tabbed
      .find('> ul.tabbed-tabs > li.tabbed-tab > label')
      .toArray()
      .map((l) => $(l).text().trim());
    const panels = $tabbed.find('> .tabbed-content').toArray();
    if (labels.length === 0 || labels.length !== panels.length) return;

    const tabsMarkdown = panels
      .map((panel, i) => {
        const innerMd = turndown.turndown($(panel).html() ?? '').trim();
        return `<Tab value={${mdxAttr(labels[i])}}>\n\n${innerMd}\n\n</Tab>`;
      })
      .join('\n');

    const token = `%%PLACEHOLDER-${placeholderId++}%%`;
    placeholders.set(
      token,
      `<Tabs items={${JSON.stringify(labels)}}>\n\n${tabsMarkdown}\n\n</Tabs>`,
    );
    $set.replaceWith(`<p>${token}</p>`);
  });

  const bodyHtml = article.html() ?? '';
  let markdown = turndown.turndown(bodyHtml).trim();

  for (const [token, mdx] of placeholders) {
    markdown = markdown.replace(token, mdx);
  }

  // undo turndown's unnecessary "N\." escaping inside headings (incl. those
  // nested in Tab panels, which is why this runs after placeholder expansion)
  markdown = markdown.replace(/^(#{1,6} \d+)\\\.(\s)/gm, '$1.$2');

  // normalize fence languages Shiki doesn't recognize (works inside list items too)
  markdown = markdown.replace(/^(\s*```)([a-zA-Z0-9_+-]+)/gm, (m, prefix, lang) =>
    LANG_ALIASES[lang] ? prefix + LANG_ALIASES[lang] : m,
  );

  const description = deriveDescription(markdown);
  const newSlug = pageDef.slug.endsWith('/index') ? pageDef.slug.slice(0, -'/index'.length) : pageDef.slug;
  if (pageDef.slug.endsWith('/index')) {
    folderTitles.set(`${section.key}/${newSlug}`, title);
  }
  const filePath = path.join(CONTENT_DIR, section.key, `${pageDef.slug}.mdx`);
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    ...(description ? [`description: ${JSON.stringify(description)}`] : []),
    '---',
    '',
  ].join('\n');

  await fs.writeFile(filePath, frontmatter + markdown + '\n');
  console.log(`✓ ${section.key}/${newSlug} <- ${pageDef.old}`);
}

async function writeMeta(section) {
  // Collapse "folder/index" + "folder/child" runs into a single top-level
  // "folder" entry — nesting itself comes from the filesystem, this array
  // only controls sibling order. Sub-pages get their own meta.json below.
  const topLevelPages = [];
  const subfolders = new Map(); // folder name -> ordered child slugs (without the folder prefix)

  for (const p of section.pages) {
    if (p.separator) {
      topLevelPages.push(`---${p.separator}---`);
      continue;
    }
    const slashIndex = p.slug.indexOf('/');
    if (slashIndex === -1) {
      topLevelPages.push(p.slug);
      continue;
    }
    const folder = p.slug.slice(0, slashIndex);
    const rest = p.slug.slice(slashIndex + 1); // "index" or a child slug
    if (!topLevelPages.includes(folder)) topLevelPages.push(folder);
    if (!subfolders.has(folder)) subfolders.set(folder, []);
    if (rest !== 'index') subfolders.get(folder).push(rest);
  }

  // "root: true" makes this section its own top nav tab (Stripe-style),
  // with its own sidebar tree instead of being stacked with the others.
  const meta = { title: section.title, root: true, pages: topLevelPages };
  const filePath = path.join(CONTENT_DIR, section.key, 'meta.json');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(meta, null, 2) + '\n');

  for (const [folder, children] of subfolders) {
    const title = folderTitles.get(`${section.key}/${folder}`);
    const subMeta = { ...(title ? { title } : {}), pages: ['index', ...children] };
    const subFilePath = path.join(CONTENT_DIR, section.key, folder, 'meta.json');
    await fs.writeFile(subFilePath, JSON.stringify(subMeta, null, 2) + '\n');
  }
}

async function writeRootMeta() {
  const meta = { pages: SECTIONS.map((s) => (s.key === 'faqs' ? 'faqs' : s.key)) };
  await fs.writeFile(path.join(CONTENT_DIR, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
}

async function main() {
  for (const section of SECTIONS) {
    for (const pageDef of section.pages) {
      if (pageDef.separator) continue;
      await importPage(section, pageDef);
    }
    await writeMeta(section);
  }
  await writeRootMeta();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

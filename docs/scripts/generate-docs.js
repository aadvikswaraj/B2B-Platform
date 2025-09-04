#!/usr/bin/env node
/**
 * Regenerates documentation markdown files from AI_RULES.md.
 * Usage:
 *   node docs/scripts/generate-docs.js       # one-off
 *   node docs/scripts/generate-docs.js --watch  # watch mode
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../');
const rulesPath = path.join(root, 'AI_RULES.md');
const docsDir = path.join(root, 'docs');

const SECTION_MAP = {
  'General Coding': 'coding-standards.md',
  'UI/UX Guidelines': 'ui-ux.md',
  'Navigation & Layout': 'components-layout.md',
  'AI Behavior': 'ai-behavior.md',
  'Testing': 'testing.md'
};

function readRules() {
  return fs.readFileSync(rulesPath, 'utf8');
}

function splitSections(md) {
  const lines = md.split(/\r?\n/);
  const sections = {};
  let current = null;
  for (const line of lines) {
    const m = /^##\s+(.+)$/.exec(line.trim());
    if (m) {
      current = m[1].trim();
      sections[current] = [];
      continue;
    }
    if (current) sections[current].push(line);
  }
  return sections;
}

function formatSection(title, bodyLines) {
  return `# ${title}\n\nSource: AI_RULES.md\n\n${bodyLines.join('\n').trim()}\n`;
}

function writeDocs(sections) {
  Object.entries(SECTION_MAP).forEach(([title, filename]) => {
    if (!sections[title]) return; // skip missing section
    const out = formatSection(title, sections[title]);
    fs.writeFileSync(path.join(docsDir, filename), out, 'utf8');
  });
}

function updateReadme() {
  const readme = `# Project Documentation\n\nAuto-generated from AI_RULES.md.\n\n## Regenerate\n\nRun: \n\n\`node docs/scripts/generate-docs.js\`\n\nWatch: \n\n\`node docs/scripts/generate-docs.js --watch\`\n\n## Sections\n- coding-standards.md\n- ui-ux.md\n- components-layout.md\n- api-guidelines.md (manually curated)\n- testing.md\n- ai-behavior.md\n`;
  fs.writeFileSync(path.join(docsDir, 'README.md'), readme, 'utf8');
}

function regenerate() {
  try {
    const md = readRules();
    const sections = splitSections(md);
    writeDocs(sections);
    updateReadme();
    console.log(`[docs] Regenerated at ${new Date().toLocaleTimeString()}`);
  } catch (e) {
    console.error('[docs] Failed to regenerate:', e.message);
  }
}

function watch() {
  console.log('[docs] Watching AI_RULES.md for changes...');
  regenerate();
  fs.watch(rulesPath, { persistent: true }, (event) => {
    if (event === 'change') regenerate();
  });
}

const isWatch = process.argv.includes('--watch');
if (isWatch) watch(); else regenerate();

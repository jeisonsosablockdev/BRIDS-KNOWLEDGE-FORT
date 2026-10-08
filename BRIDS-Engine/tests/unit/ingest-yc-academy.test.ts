import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  parseVttToCues,
  formatCuesToMarkdown,
  htmlToMarkdown,
  ingestYcAcademyClass,
} from '../../scripts/ingest/ingest-yc-academy.ts';

describe('YC Academy Ingestor (YouTube VTT & Web HTML to Markdown)', () => {
  it('deduplicates rolling WebVTT auto-captions and formats by chapter', () => {
    const sampleVtt = `WEBVTT
Kind: captions
Language: en

00:00:01.000 --> 00:00:03.000 align:start position:0%
The best way to get <00:00:02.000><c>startup</c>

00:00:03.000 --> 00:00:06.000 align:start position:0%
The best way to get startup
ideas is to notice problems you have yourself.

00:01:10.000 --> 00:01:15.000
Talk to users every single week and measure retention.
`;

    const cues = parseVttToCues(sampleVtt);
    assert.equal(cues.length, 3);
    assert.equal(cues[0]!.text, 'The best way to get startup');
    assert.equal(cues[1]!.text, 'ideas is to notice problems you have yourself.');
    assert.equal(cues[2]!.text, 'Talk to users every single week and measure retention.');

    const mdWithChapters = formatCuesToMarkdown(cues, [
      { title: 'Finding Organic Ideas', start_time: 0, end_time: 60 },
      { title: 'Talking to Users', start_time: 60, end_time: 120 },
    ]);

    assert.ok(mdWithChapters.includes('#### [00:00] Finding Organic Ideas'));
    assert.ok(mdWithChapters.includes('#### [01:00] Talking to Users'));
    assert.ok(mdWithChapters.includes('Talk to users every single week'));
  });

  it('converts HTML article content into clean Markdown', () => {
    const sampleHtml = `<!DOCTYPE html>
<html>
  <head><title>How to Get Startup Ideas — Paul Graham</title></head>
  <body>
    <nav>Menu Item</nav>
    <article>
      <h1>How to Get Startup Ideas</h1>
      <p>The way to get <strong>startup ideas</strong> is not to try to think of startup ideas.</p>
      <ul>
        <li>Live in the future</li>
        <li>Build what is missing</li>
      </ul>
    </article>
    <footer>Copyright YC</footer>
  </body>
</html>`;

    const parsed = htmlToMarkdown(sampleHtml);
    assert.equal(parsed.title, 'How to Get Startup Ideas — Paul Graham');
    assert.ok(parsed.markdown.includes('# How to Get Startup Ideas'));
    assert.ok(parsed.markdown.includes('**startup ideas**'));
    assert.ok(parsed.markdown.includes('- Live in the future'));
    assert.ok(!parsed.markdown.includes('Menu Item'));
  });

  it('scaffolds the 3 class files (datos-de-la-clase, conceptos, aplicacion-en-brids) and updates Clases/index.md', () => {
    const tmpVault = fs.mkdtempSync(path.join(os.tmpdir(), 'brids-yc-test-vault-'));
    try {
      const clasesDir = path.join(tmpVault, '03 Academy', 'Clases');
      fs.mkdirSync(clasesDir, { recursive: true });
      fs.writeFileSync(
        path.join(clasesDir, 'index.md'),
        '# Clases\n\n| # | Clase | Datos | Conceptos | Aplicación | Estado |\n|---|---|---|---|---|---|\n| `01` | *Pendiente de iniciar primera clase* | — | — | — | ⏳ |\n',
        'utf8'
      );

      const sampleFile = path.join(tmpVault, 'sample.html');
      fs.writeFileSync(
        sampleFile,
        '<title>How to Plan an MVP</title><article><h2>Launch Fast</h2><p>Build a lean MVP for your first users.</p></article>',
        'utf8'
      );

      const res = ingestYcAcademyClass({
        classSlug: '01-how-to-plan-an-mvp',
        title: 'How to Plan an MVP',
        speaker: 'Michael Seibel',
        localFilePath: sampleFile,
        vaultRoot: tmpVault,
      });

      assert.ok(fs.existsSync(res.datosPath));
      assert.ok(fs.existsSync(res.conceptosPath));
      assert.ok(fs.existsSync(res.aplicacionPath));

      const datosMd = fs.readFileSync(res.datosPath, 'utf8');
      assert.ok(datosMd.includes('Michael Seibel'));
      assert.ok(datosMd.includes('Build a lean MVP for your first users.'));

      const indexMd = fs.readFileSync(path.join(clasesDir, 'index.md'), 'utf8');
      assert.ok(indexMd.includes('01-how-to-plan-an-mvp/datos-de-la-clase.md'));
      assert.ok(!indexMd.includes('Pendiente de iniciar primera clase'));
    } finally {
      fs.rmSync(tmpVault, { recursive: true, force: true });
    }
  });
});

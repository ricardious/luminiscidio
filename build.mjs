// Genera index.html (lo que descarga el navegador) a partir de src/index.html.
// terser solo se usa aquí, en desarrollo: el juego publicado no carga ninguna librería.
import { readFileSync, writeFileSync } from 'node:fs';
import { minify } from 'terser';

const LIMIT = 32 * 1024;
const src = readFileSync('src/index.html', 'utf8');
const [before, rest] = src.split('<script>');
const [js, after] = rest.split('</script>');

const { code } = await minify(js, {
  ecma: 2020,
  compress: { passes: 3, unsafe_arrows: true },
  mangle: true,
  format: { comments: false },
});

const html = s => s.replace(/<!--[\s\S]*?-->/g, '').replace(/\n\s*/g, '');
const out = html(before) + '<script>' + code + '</script>' + html(after);
writeFileSync('index.html', out);

const bytes = Buffer.byteLength(out);
console.log(`index.html: ${bytes} bytes (${(bytes / 1024).toFixed(1)} KB de ${LIMIT / 1024} KB)`);
if (bytes > LIMIT) {
  console.error('Supera el límite de 32 KB del reto.');
  process.exit(1);
}

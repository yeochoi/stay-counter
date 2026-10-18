// Builds public/design-system/index.html from the files in design-system/.
// The folder is the one source, so the page never drifts from the tokens and guides.
// Runs before every build (see "prebuild" in package.json).
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const DS = path.join(root, 'design-system')
const OUT = path.join(root, 'public', 'design-system')
const read = (p) => fs.readFileSync(path.join(DS, p), 'utf8')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const tokens = JSON.parse(read('tokens.json'))
const readme = read('README.md')

// Tiny markdown, enough for the guides. Headings, lists, tables, bold, code.
function inline(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>')
}
function md(text) {
  const lines = text.split('\n')
  let out = ''
  let list = null
  const close = () => { if (list) { out += `</${list}>`; list = null } }
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (/^\|/.test(l)) {
      close()
      const rows = []
      while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++])
      i--
      const cells = (r) => r.split('|').slice(1, -1).map((c) => c.trim())
      const [head, , ...body] = rows
      out += '<div class="table"><table><thead><tr>' + cells(head).map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'
      out += body.map((r) => '<tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table></div>'
      continue
    }
    const h = l.match(/^(#{1,3}) (.*)/)
    if (h) { close(); out += `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`; continue }
    const ul = l.match(/^- (.*)/)
    const ol = l.match(/^\d+\. (.*)/)
    if (ul || ol) {
      const kind = ul ? 'ul' : 'ol'
      if (list !== kind) { close(); out += `<${kind}>`; list = kind }
      out += `<li>${inline((ul || ol)[1])}</li>`
      continue
    }
    close()
    if (l.trim()) out += `<p>${inline(l)}</p>`
  }
  close()
  return out
}

// Split the brand book into its ## sections.
const sections = readme.split(/\n(?=## )/)
const intro = sections[0].replace(/^# .*\n/, '').trim()
const bookSections = sections.slice(1).filter((s) => !/^## (Color|Typography|Files)\b/.test(s))

// Colour groups come from the Color table in the README, so they follow the brand book.
const colorTable = (readme.match(/## Color\n+((?:\|.*\n)+)/) || [])[1] || ''
const byName = Object.fromEntries(tokens.color.tokens.map((t) => [t.name, t]))
const groups = colorTable.split('\n').slice(2).filter(Boolean).map((r) => {
  const c = r.split('|').slice(1, -1).map((x) => x.trim())
  return { role: c[0], names: [...c[1].matchAll(/`([^`]+)`/g)].map((m) => m[1]), use: c[2] }
})
const grouped = new Set(groups.flatMap((g) => g.names))
const rest = tokens.color.tokens.filter((t) => !grouped.has(t.name)).map((t) => t.name)
if (rest.length) groups.push({ role: 'Other', names: rest, use: '' })

// tokens.css, also written to the folder for use in code.
let css = ':root {\n' + tokens.color.tokens.map((t) => `  --${t.name}: ${t.value};`).join('\n') + '\n'
for (const fam of ['spacing', 'radius', 'shadow', 'size']) css += (tokens[fam]?.tokens || []).map((t) => `  --${t.name}: ${t.value};`).join('\n') + '\n'
css += `  --font-sans: ${tokens.type.families.sans};\n}\n`
const styles = tokens.type.groups.flatMap((g) => g.styles)
for (const s of styles) {
  css += `.${s.name} { font-family: var(--font-sans); font-size: ${s.fontSize}; line-height: ${s.lineHeight}; font-weight: ${s.fontWeight};${s.letterSpacing ? ` letter-spacing: ${s.letterSpacing};` : ''}${s.textTransform ? ` text-transform: ${s.textTransform};` : ''} }\n`
}
fs.writeFileSync(path.join(DS, 'tokens.css'), '/* Stay Counter, generated from tokens.json */\n' + css)

// Components, in the order people meet them in the app.
const ORDER = ['CountdownRing', 'StayTimeline', 'ListRow', 'TaxDays', 'Warning', 'Chip', 'NoteBox', 'SheetBar', 'GroupedRows', 'SegmentedSwitch', 'Button', 'TabBar']
const compDirs = fs.readdirSync(path.join(DS, 'components')).filter((d) => d !== 'Cover')
const comps = [...ORDER.filter((c) => compDirs.includes(c)), ...compDirs.filter((c) => !ORDER.includes(c)).sort()]
const preview = (name) =>
  read(`components/${name}/preview.html`)
    .replace(/<!--\s*@dsCard[^>]*-->/, '')
    .replace(/<script><\/script>/g, '')
    .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/g, '')
const words = (name) => name.replace(/([a-z])([A-Z])/g, '$1 $2')
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const nav = [
  ['overview', 'Overview'],
  ['colour', 'Colour'],
  ['type', 'Type'],
  ['scale', 'Spacing and shape'],
  ...bookSections.map((s) => [slug(s.match(/^## (.*)/)[1]), s.match(/^## (.*)/)[1]]),
]

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Stay Counter design system</title>
<meta name="description" content="Colours, type, components and rules of the Stay Counter web app.">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap">
<style>
${css}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: 24px; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--font-sans); -webkit-font-smoothing: antialiased; }
.layout { display: grid; grid-template-columns: 240px minmax(0, 1fr); max-width: 1280px; margin: 0 auto; }
aside { position: sticky; top: 0; height: 100vh; overflow-y: auto; padding: 32px 20px 32px 28px; border-right: 1px solid var(--line); }
aside .brand { font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 18px; }
aside a { display: block; padding: 6px 10px; margin: 0 -10px; border-radius: 8px; color: var(--ink); text-decoration: none; font-size: 15px; }
aside a:hover { background: var(--surface); }
aside .label { font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin: 22px 0 6px; }
main { padding: 32px 40px 96px; min-width: 0; }
.cover { border-radius: 20px; overflow: hidden; border: 1px solid var(--line); background: var(--bg); }
.cover > .cv { width: 100% !important; }
h1 { font-size: 44px; font-weight: 600; letter-spacing: -.02em; margin: 36px 0 8px; }
h2.sec { font-size: 30px; font-weight: 600; letter-spacing: -.02em; margin: 72px 0 6px; padding-top: 8px; }
h3 { font-size: 20px; font-weight: 600; margin: 32px 0 8px; }
.lead { font-size: 17px; line-height: 1.55; color: var(--muted); max-width: 680px; margin: 0; }
.prose { max-width: 720px; font-size: 15px; line-height: 1.6; }
.prose p { margin: 0 0 10px; } .prose ul, .prose ol { margin: 0 0 14px; padding-left: 20px; } .prose li { margin: 3px 0; }
.prose h3 { font-size: 17px; margin: 22px 0 6px; } .prose b { font-weight: 600; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .86em; background: var(--surface); border: 1px solid var(--line); border-radius: 6px; padding: 1px 6px; }
.table { overflow-x: auto; margin: 6px 0 16px; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); }
table { border-collapse: collapse; width: 100%; font-size: 14px; }
th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--line); vertical-align: top; }
th { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
tr:last-child td { border-bottom: 0; }
.group { margin-top: 28px; } .group h3 { margin: 0 0 2px; } .group .use { color: var(--muted); font-size: 14px; margin: 0 0 12px; }
.swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.sw { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.sw .chip { height: 72px; border-bottom: 1px solid var(--line); }
.sw .meta { padding: 10px 12px 12px; font-size: 13px; line-height: 1.45; }
.sw .meta b { font-size: 14px; font-weight: 600; } .sw .meta span { color: var(--muted); float: right; font-family: ui-monospace, Menlo, monospace; font-size: 12px; }
.sw .meta p { color: var(--muted); margin: 6px 0 0; }
.specimens { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; }
.spec { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 20px; padding: 18px 20px; border-bottom: 1px solid var(--line); align-items: baseline; }
.spec:last-child { border-bottom: 0; }
.spec .info { font-size: 13px; color: var(--muted); line-height: 1.5; } .spec .info b { color: var(--ink); font-weight: 600; font-size: 14px; display: block; }
.spec .sample { min-width: 0; overflow-wrap: anywhere; }
.scales { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.scale { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; padding: 6px 16px; }
.scale h3 { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin: 10px 0 4px; }
.step { display: grid; grid-template-columns: 110px 60px minmax(0, 1fr); gap: 10px; align-items: center; padding: 8px 0; border-top: 1px solid var(--line); font-size: 13px; }
.step b { font-weight: 600; } .step .v { color: var(--muted); font-family: ui-monospace, Menlo, monospace; font-size: 12px; }
.bar { height: 10px; background: var(--primary); border-radius: 3px; } .box { width: 34px; height: 34px; background: var(--soft); border: 1px solid var(--current-line); }
.comp { margin-top: 28px; background: var(--surface); border: 1px solid var(--line); border-radius: 20px; overflow: hidden; }
.comp .stage { background: var(--bg); padding: 28px; border-bottom: 1px solid var(--line); overflow-x: auto; display: flex; justify-content: center; }
.comp .guide { padding: 20px 24px 22px; }
.comp .guide h3 { margin: 0 0 4px; font-size: 22px; } .comp .guide .lead { font-size: 15px; margin-bottom: 10px; }
.comp .guide ul { margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.6; color: var(--ink); } .comp .guide li { margin: 3px 0; }
footer { margin-top: 72px; padding-top: 20px; border-top: 1px solid var(--line); font-size: 14px; color: var(--muted); }
footer a, .prose a { color: var(--purple-text); }
@media (max-width: 860px) {
  .layout { display: block; }
  aside { position: sticky; z-index: 5; height: auto; display: flex; gap: 6px; overflow-x: auto; padding: 10px 16px; background: var(--bg); border-right: 0; border-bottom: 1px solid var(--line); white-space: nowrap; }
  aside .brand, aside .label { display: none; }
  aside a { margin: 0; padding: 6px 12px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); font-size: 14px; }
  main { padding: 20px 16px 72px; }
  h1 { font-size: 34px; } h2.sec { font-size: 26px; margin-top: 56px; }
  .spec { grid-template-columns: 1fr; gap: 6px; }
  .comp .stage { padding: 16px; justify-content: flex-start; }
  .cover .cv { height: 220px !important; } .cover .cv svg { display: none; } .cover .nm { font-size: 64px !important; } .cover .txt { left: 20px !important; bottom: 22px !important; }
}
</style>
</head>
<body>
<div class="layout">
<aside>
  <div class="brand">Stay Counter</div>
  ${nav.slice(0, 4).map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join('')}
  <div class="label">Components</div>
  ${comps.map((c) => `<a href="#${slug(c)}">${esc(words(c))}</a>`).join('')}
  <div class="label">Guidelines</div>
  ${nav.slice(4).map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join('')}
</aside>
<main>
  <div class="cover" id="overview">${preview('Cover')}</div>
  <h1>Stay Counter design system</h1>
  <div class="prose"><p class="lead">${inline(intro)}</p></div>

  <h2 class="sec" id="colour">Colour</h2>
  <p class="lead">Every colour has one job. Text colours pass 4.5 to 1 where they are used.</p>
  ${groups.map((g) => `<div class="group"><h3>${esc(g.role)}</h3><p class="use">${inline(g.use)}</p><div class="swatches">${g.names.filter((n) => byName[n]).map((n) => {
    const t = byName[n]
    return `<div class="sw"><div class="chip" style="background:${t.value}"></div><div class="meta"><b>${esc(t.name)}</b><span>${esc(t.value)}</span><p>${esc(t.usage || '')}</p></div></div>`
  }).join('')}</div></div>`).join('')}

  <h2 class="sec" id="type">Type</h2>
  <p class="lead">One typeface, Outfit. Sizes shown at real size.</p>
  <div class="specimens">${styles.map((s) => `<div class="spec"><div class="info"><b>${esc(s.name)}</b>${esc(s.fontSize)} · ${esc(s.fontWeight)}${s.letterSpacing ? ' · ' + esc(s.letterSpacing) : ''}<br>${esc(s.usage || '')}</div><div class="sample ${s.name}">${esc(s.sample || s.name)}</div></div>`).join('')}</div>

  <h2 class="sec" id="scale">Spacing and shape</h2>
  <div class="scales">
    <div class="scale"><h3>Spacing</h3>${tokens.spacing.tokens.map((t) => `<div class="step"><b>${esc(t.name)}</b><span class="v">${esc(t.value)}</span>${parseInt(t.value) <= 64 ? `<div class="bar" style="width:${parseInt(t.value)}px"></div>` : `<span class="v">${esc(t.usage)}</span>`}</div>`).join('')}</div>
    <div class="scale"><h3>Radius</h3>${tokens.radius.tokens.map((t) => `<div class="step"><b>${esc(t.name)}</b><span class="v">${esc(t.value)}</span><div class="box" style="border-radius:${t.value}"></div></div>`).join('')}</div>
    <div class="scale"><h3>Size</h3>${tokens.size.tokens.map((t) => `<div class="step"><b>${esc(t.name)}</b><span class="v">${esc(t.value)}</span><span class="v">${esc(t.usage)}</span></div>`).join('')}</div>
  </div>

  <h2 class="sec" id="components">Components</h2>
  <p class="lead">Each one as it appears in the app, with the rules that go with it.</p>
  ${comps.map((c) => {
    let guide = ''
    try {
      const lines = read(`components/${c}/README.md`).split('\n').filter((l) => l.trim() && !l.startsWith('#'))
      guide = `<p class="lead">${inline(lines[0])}</p><ul>${lines.slice(1).filter((l) => l.startsWith('- ')).map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`
    } catch { /* a component without a guide */ }
    return `<section class="comp" id="${slug(c)}"><div class="stage">${preview(c)}</div><div class="guide"><h3>${esc(words(c))}</h3>${guide}</div></section>`
  }).join('\n')}

  ${bookSections.map((s) => {
    const title = s.match(/^## (.*)/)[1]
    return `<h2 class="sec" id="${slug(title)}">${esc(title)}</h2><div class="prose">${md(s.replace(/^## .*\n/, ''))}</div>`
  }).join('\n')}

  <footer>Built from the design-system folder of the <a href="https://github.com/yeochoi/stay-counter">stay-counter</a> repository. <a href="../">Open the app</a>.</footer>
</main>
</div>
</body>
</html>
`
fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'index.html'), html)
console.log(`design system page: ${comps.length} components, ${tokens.color.tokens.length} colours`)

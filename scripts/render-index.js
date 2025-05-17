// scripts/render-index.js
const ejs = require('ejs');
const fs  = require('fs');
const path = require('path');

async function build() {
  // 1) Read your EJS template
  const templatePath = path.join(__dirname, '..', 'views', 'index.ejs');
  const template     = await fs.promises.readFile(templatePath, 'utf8');

  // 2) Render it (no dynamic data for now)
  const html = ejs.render(template, {});

  // 3) Write to public/index.html
  const outPath = path.join(__dirname, '..', 'public', 'index.html');
  await fs.promises.writeFile(outPath, html, 'utf8');

  console.log('✅ Rendered index.html');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});

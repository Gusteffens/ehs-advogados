const fs = require('fs');

const files = [
  "components/sections/hero-section.tsx",
  "components/layout/header.tsx",
  "components/sections/areas-section.tsx",
  "components/sections/team-section.tsx",
  "components/layout/footer.tsx",
  "components/sections/cta-section.tsx",
  "app/contato/page.tsx",
];

let output = "1. LISTA DE ARQUIVOS MODIFICADOS\n";
files.forEach(f => {
  output += `- ${f}\n`;
});
output += "\n2. CÓDIGO completo de cada arquivo alterado:\n";

files.forEach(f => {
  output += `\n--- ${f} ---\n`;
  output += "```tsx\n";
  const content = fs.readFileSync(f, 'utf8');
  output += content;
  output += "\n```\n";
});

fs.writeFileSync('resultado_alteracoes.md', output);
console.log('success');

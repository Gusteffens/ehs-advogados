const fs = require('fs');
const path = require('path');

const walk = function (dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
};

const files = [...walk('app'), ...walk('components')];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Background colors
    content = content.replace(/bg-forest-900/g, 'bg-primary');
    content = content.replace(/bg-forest-800/g, 'bg-secondary');
    content = content.replace(/bg-forest-[567]00/g, 'bg-tertiary');
    content = content.replace(/bg-forest-[1234]00/g, 'bg-tertiary/50');
    content = content.replace(/bg-forest-50/g, 'bg-cream');

    content = content.replace(/bg-champagne-[56]00/g, 'bg-gold');
    content = content.replace(/bg-champagne-[789]00/g, 'bg-gold-dark');
    content = content.replace(/bg-champagne-[1234]00/g, 'bg-gold/30');
    content = content.replace(/bg-champagne-50/g, 'bg-cream');

    content = content.replace(/bg-cream(-light|-dark)?/g, 'bg-cream');
    content = content.replace(/bg-\[\#FAF8F4\]/g, 'bg-cream');
    content = content.replace(/bg-\[\#F5F0E8\]/g, 'bg-cream');

    // Text colors
    content = content.replace(/text-forest-[789]00/g, 'text-text-dark');
    content = content.replace(/text-forest-[456]00/g, 'text-tertiary');
    content = content.replace(/text-forest-[123]00/g, 'text-tertiary/70');

    content = content.replace(/text-champagne-[56]00/g, 'text-gold');
    content = content.replace(/text-champagne-[789]00/g, 'text-gold-dark');
    content = content.replace(/text-champagne-[1234]00/g, 'text-gold-dark/70');
    content = content.replace(/text-champagne/g, 'text-gold'); // Catch-all

    content = content.replace(/text-cream/g, 'text-text-light');
    content = content.replace(/text-\[\#F5F0E8\]/g, 'text-text-light');
    content = content.replace(/text-white/g, 'text-text-light');
    content = content.replace(/text-\[\#E8D5A3\]/g, 'text-gold');

    // Border colors
    content = content.replace(/border-forest-[89]00/g, 'border-primary');
    content = content.replace(/border-forest-[567]00/g, 'border-tertiary');
    content = content.replace(/border-champagne-[56]00/g, 'border-gold');
    content = content.replace(/border-champagne-[789]00/g, 'border-gold-dark');
    content = content.replace(/border-cream/g, 'border-cream');

    // Gradients (from/to/via)
    content = content.replace(/(from|to|via)-forest-[89]00/g, '$1-primary');
    content = content.replace(/(from|to|via)-forest-[67]00/g, '$1-secondary');
    content = content.replace(/(from|to|via)-forest-[45]00/g, '$1-tertiary');

    content = content.replace(/(from|to|via)-champagne-[56]00/g, '$1-gold');
    content = content.replace(/(from|to|via)-champagne-[789]00/g, '$1-gold-dark');
    content = content.replace(/(from|to|via)-champagne-[1234]00/g, '$1-gold/50');

    // Fonts
    content = content.replace(/font-editorial/g, 'font-display');
    // UI font replacements (buttons, sub-headers, etc should be font-ui)
    // Let's replace font-sans with font-ui, font-body in ui components might be tricky to regex blindly,
    // but we can replace `font-sans` with `font-ui`. For specific components like buttons, it's safer to edit manually.

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

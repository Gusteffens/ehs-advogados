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

const mapColors = (content) => {
    // 1. Background colors (dark)
    content = content.replace(/bg-primary/g, 'bg-[#0D1812]');
    content = content.replace(/bg-secondary/g, 'bg-[#1B2D1E]');
    content = content.replace(/bg-tertiary/g, 'bg-[#3B5A3C]');

    // Opacities for dark backgrounds need special care. 
    // Let's replace the common opacity suffixes as well if needed.
    // E.g., bg-tertiary/60 -> bg-[#3B5A3C]/60

    // 2. Background colors (light/accent)
    content = content.replace(/bg-gold-dark/g, 'bg-[#877249]'); // Must come before gold
    content = content.replace(/bg-gold/g, 'bg-[#E8D49A]');
    content = content.replace(/bg-cream/g, 'bg-[#EEEDE5]');

    // 3. Text colors
    content = content.replace(/text-text-dark/g, 'text-[#0D1812]');
    content = content.replace(/text-text-light/g, 'text-[#EEEDE5]');

    content = content.replace(/text-gold-dark/g, 'text-[#877249]');
    content = content.replace(/text-gold/g, 'text-[#E8D49A]');

    content = content.replace(/text-tertiary/g, 'text-[#3B5A3C]');
    content = content.replace(/text-secondary/g, 'text-[#1B2D1E]');
    content = content.replace(/text-primary/g, 'text-[#0D1812]');

    // 4. Border colors
    content = content.replace(/border-primary/g, 'border-[#0D1812]');
    content = content.replace(/border-secondary/g, 'border-[#1B2D1E]');
    content = content.replace(/border-tertiary/g, 'border-[#3B5A3C]');
    content = content.replace(/border-gold-dark/g, 'border-[#877249]');
    content = content.replace(/border-gold/g, 'border-[#E8D49A]');
    content = content.replace(/border-cream/g, 'border-[#EEEDE5]');

    // 5. Gradients
    content = content.replace(/(from|via|to)-primary/g, '$1-[#0D1812]');
    content = content.replace(/(from|via|to)-secondary/g, '$1-[#1B2D1E]');
    content = content.replace(/(from|via|to)-tertiary/g, '$1-[#3B5A3C]');
    content = content.replace(/(from|via|to)-gold-dark/g, '$1-[#877249]');
    content = content.replace(/(from|via|to)-gold/g, '$1-[#E8D49A]');
    content = content.replace(/(from|via|to)-cream/g, '$1-[#EEEDE5]');

    // 6. Hardcoded leftovers from old variables if missed
    content = content.replace(/text-\[\#F5F0E8\]/g, 'text-[#EEEDE5]');
    return content;
};

const files = [...walk('app'), ...walk('components')];

let updatedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = mapColors(content);

    // Eliminate any dark mode prefixes completely (e.g. dark:bg-white -> nothing or explicit)
    content = content.replace(/dark:[a-z0-9-\[\]#]+/g, '');
    // normalize double spaces left by removal
    content = content.replace(/  +/g, ' ');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated HEX colors in ${file}`);
        updatedCount++;
    }
});

console.log(`\nReplacement complete. Modified ${updatedCount} files.`);

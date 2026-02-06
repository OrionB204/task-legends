// Script para converter atributos antigos para atributos Habitica
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ATTRIBUTE_MAP = {
    'agility': 'perception',
    'vitality': 'constitution',
    'endurance': 'constitution',
    'damage': 'strength',
    // hp e mana com bônus especiais continuam como estão (usados para MaxHP/MaxMana)
    // mas equipamentos que davam hp/mana diretos devem dar constitution/intelligence
};

const shopItemsPath = path.join(__dirname, '..', 'src', 'data', 'shopItems.ts');
let content = fs.readFileSync(shopItemsPath, 'utf-8');

console.log('🔄 Convertendo atributos para padrão Habitica...\n');

// Substituir cada atributo antigo
Object.entries(ATTRIBUTE_MAP).forEach(([old, novo]) => {
    const regex = new RegExp(`attribute: '${old}'`, 'g');
    const count = (content.match(regex) || []).length;
    content = content.replace(regex, `attribute: '${novo}'`);
    if (count > 0) {
        console.log(`✅ ${old} → ${novo} (${count} ocorrências)`);
    }
});

// Remover bônus xpBonus e goldBonus (manter apenas como effects especiais, não core stats)
console.log('\n⚠️  Atributos especiais mantidos: hp, mana, xpBonus, goldBonus');
console.log('   (Estes não são atributos base, mas efeitos especiais)');

fs.writeFileSync(shopItemsPath, content, 'utf-8');

console.log('\n✨ Conversão concluída!');
console.log('📄 Arquivo atualizado:', shopItemsPath);

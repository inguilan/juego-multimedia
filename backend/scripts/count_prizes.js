// backend/scripts/count_prizes.js
// Cuenta y lista las monedas (role: 'default') y finalPrize en el JSON de bloques
const fs = require('fs');
const path = require('path');

const blocksPath = path.join(__dirname, '..', '..', 'game-project', 'public', 'data', 'toy_car_blocks.json');

if (!fs.existsSync(blocksPath)) {
    console.error('No se encontró:', blocksPath);
    process.exit(1);
}

const raw = fs.readFileSync(blocksPath, 'utf8');
let blocks;
try {
    blocks = JSON.parse(raw);
} catch (err) {
    console.error('Error parseando JSON:', err.message);
    process.exit(1);
}

const stats = {};

blocks.forEach(b => {
    const lvl = b.level || 0;
    stats[lvl] = stats[lvl] || { total: 0, default: 0, finalPrize: 0, defaultNames: [], finalNames: [] };
    stats[lvl].total++;
    if (b.role === 'finalPrize') {
        stats[lvl].finalPrize++;
        stats[lvl].finalNames.push(b.name);
    } else if (b.role === 'default') {
        stats[lvl].default++;
        stats[lvl].defaultNames.push(b.name);
    }
});

console.log('Resumen de premios por nivel:');
Object.keys(stats).sort((a,b)=>a-b).forEach(lvl => {
    const s = stats[lvl];
    console.log(`\nNivel ${lvl}: total objetos=${s.total}, monedas(default)=${s.default}, finalPrize=${s.finalPrize}`);
    console.log('  Nombres default (primeros 10):', s.defaultNames.slice(0,10));
    console.log('  Nombres finalPrize:', s.finalNames);
});

console.log('\nNota: para que un objeto sea tratado como premio por el loader, su `name` suele comenzar con "coin" y debe existir el modelo en `src/Experience/sources.js`.');

process.exit(0);

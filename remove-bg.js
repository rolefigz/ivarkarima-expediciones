const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function removeBackground() {
    const imgDir = path.join(__dirname, 'assets/img');
    const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.png'));
    
    console.log(`Procesando ${files.length} imágenes...\n`);
    
    for (const file of files) {
        const inputPath = path.join(imgDir, file);
        
        try {
            // Leer metadata de la imagen
            const metadata = await sharp(inputPath).metadata();
            console.log(`${file}: ${metadata.width}x${metadata.height}, ${metadata.format}`);
            
            // Obtener datos raw
            const { data, info } = await sharp(inputPath)
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });
            
            let pixelsChanged = 0;
            
            // Procesar cada píxel - remover fondos blancos y negros
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                // Fondo blanco puro o casi blanco
                if (r > 240 && g > 240 && b > 240) {
                    data[i + 3] = 0;
                    pixelsChanged++;
                }
                // Fondo negro puro o casi negro  
                else if (r < 20 && g < 20 && b < 20) {
                    data[i + 3] = 0;
                    pixelsChanged++;
                }
            }
            
            // Guardar imagen con fondo removido
            await sharp(data, {
                raw: {
                    width: info.width,
                    height: info.height,
                    channels: 4
                }
            })
                .png()
                .toFile(inputPath);
            
            console.log(`✓ Fondos removidos (${pixelsChanged} píxeles transparentes)\n`);
            
        } catch (err) {
            console.error(`✗ Error: ${err.message}\n`);
        }
    }
    
    console.log('✓ ¡Proceso completado!');
}

removeBackground().catch(console.error);
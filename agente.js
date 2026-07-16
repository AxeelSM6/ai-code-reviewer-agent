const { execSync } = require('child_process');

function obtenerCambios() {
    try {
        const diferencias = execSync('git diff HEAD~1 HEAD').toString();
        if (!diferencias) return null;
        return diferencias;
    } catch (error) {
        console.error('Error al intentar leer Git:', error.message);
        return null;
    }
}

async function solicitarRevisionClaude(diferencias) {
    // 1. Extraemos la nueva llave de la bóveda
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
        console.error("🚨 ERROR FATAL: No se encontró la API Key de Anthropic.");
        process.exit(1); 
    }

    console.log('\n--- 1. PREPARANDO EL PAYLOAD PARA CLAUDE ---');
    
    // Estructura oficial requerida por la API de Anthropic (Messages API)
    const payload = {
        model: "claude-3-haiku-20240307",
        max_tokens: 150, // Límite corto para ahorrar saldo
        temperature: 0.2,
        system: "Eres un Lead Security Engineer revisando código. Detecta vulnerabilidades críticas en este diff y responde en 1 o 2 oraciones máximo. Si no hay riesgo, di 'El código parece seguro'.",
        messages: [
            {
                role: "user",
                content: `Código modificado:\n${diferencias}`
            }
        ]
    };

    console.log('\n--- 2. ENVIANDO A LA API DE ANTHROPIC ---');
    
    try {
        const respuesta = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: { 
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json' 
            },
            body: JSON.stringify(payload)
        });

        const datos = await respuesta.json();

        // Manejo de errores si la API rechaza la petición
        if (datos.error) {
             console.error("❌ Error de Claude:", datos.error.message);
             return;
        }
        
        console.log('\n✅ RESPUESTA DE CLAUDE RECIBIDA:');
        // Anthropic devuelve el texto dentro de un arreglo de contenido
        console.log(datos.content[0].text);
        
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}

const cambiosPendientes = obtenerCambios();
if (cambiosPendientes) {
    solicitarRevisionClaude(cambiosPendientes);
} else {
    console.log("No hay cambios para revisar.");
}
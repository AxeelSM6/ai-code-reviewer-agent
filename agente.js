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

async function solicitarRevisionIA(diferencias) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("🚨 ERROR FATAL: No se encontró la API Key en el entorno.");
        process.exit(1);
    }

    console.log('\n--- 1. CONSTRUYENDO EL PROMPT ---');
    const prompt = `Eres un Lead Security Engineer revisando código. Detecta vulnerabilidades críticas en este diff y responde en 1 o 2 oraciones máximo. Si no hay riesgo, di "El código parece seguro". \n\nCódigo modificado:\n${diferencias}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    console.log('\n--- 2. ENVIANDO A LA API DE GEMINI ---');
    
    try {
        const respuesta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const datos = await respuesta.json();
        
        console.log('\n✅ RESPUESTA DE LA IA RECIBIDA:');
        console.log(datos.candidates[0].content.parts[0].text);
        
    } catch (error) {
        console.error("Error al conectar con la API:", error);
    }
}

const cambiosPendientes = obtenerCambios();
if (cambiosPendientes) {
    solicitarRevisionIA(cambiosPendientes);
} else {
    console.log("No hay cambios para revisar.");
}
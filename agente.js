const { execSync } = require('child_process');

// 1. Mantenemos intacto nuestro motor de extracción
function obtenerCambios() {
    try {
// HEAD~1 HEAD significa: "Compara el último commit contra el anterior"
const diferencias = execSync('git diff HEAD~1 HEAD').toString();
        if (!diferencias) {
            console.log('No hay cambios nuevos para revisar.');
            return null;
        }
        return diferencias;
    } catch (error) {
        console.error('Error al intentar leer Git:', error.message);
        return null;
    }
}

// 2. NUEVO: El motor de conexión con la IA
async function solicitarRevisionIA(diferencias) {
    console.log('\n--- 1. CONSTRUYENDO EL PROMPT ---');
    
    // Aquí inyectamos dinámicamente los cambios de código en las instrucciones
    const promptDefinitivo = `Eres un Lead Security Engineer. Revisa este código y detecta vulnerabilidades críticas en 1 sola oración. Código modificado:\n${diferencias}`;

    // Armamos el JSON con el estándar de la industria (funciona igual para OpenAI, Anthropic o para mí, Gemini)
    const payload = {
        model: "llm-agente-revisor", 
        messages: [
            { role: "system", content: "Eres un revisor de código estricto." },
            { role: "user", content: promptDefinitivo }
        ],
        temperature: 0.2 // Nivel bajo para respuestas técnicas y precisas
    };

    console.log(JSON.stringify(payload, null, 2));

    console.log('\n--- 2. ENVIANDO A LA API (POST) ---');
    console.log('Esperando respuesta del servidor...');
    
    // Simulamos el tiempo que tarda la IA en procesar (la latencia de red)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Esta es la respuesta que nos devolvería el LLM en la vida real
    console.log('\n✅ RESPUESTA DE LA IA RECIBIDA:');
    console.log('"🚨 ALERTA CRÍTICA: Se ha detectado una credencial en texto plano (contrasena = 12345) expuesta en el código fuente. Acción requerida inmediata."');
}

// 3. Orquestador: Ejecutamos el flujo completo
const cambiosPendientes = obtenerCambios();
if (cambiosPendientes) {
    solicitarRevisionIA(cambiosPendientes);
}
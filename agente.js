async function listarModelosDisponibles() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.error("🚨 ERROR FATAL: No se encontró la API Key en el entorno.");
        process.exit(1);
    }

    console.log('\n--- INTERROGANDO A LOS SERVIDORES DE GOOGLE ---');
    console.log('Obteniendo catálogo de modelos permitidos para esta API Key...\n');
    
    try {
        // Hacemos una petición GET al endpoint que lista los modelos
        const respuesta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const datos = await respuesta.json();
        
        if (datos.error) {
            console.error("❌ La API rechazó la consulta. Motivo:");
            console.error(JSON.stringify(datos.error, null, 2));
            return;
        }
        
        console.log('✅ ESTOS SON LOS MODELOS QUE TU LLAVE PUEDE USAR EXACTAMENTE:');
        
        // Filtramos e imprimimos la lista limpia para leerla en la consola
        datos.models.forEach(modelo => {
            // Solo imprimimos los que soportan "generateContent" (que es el método que necesitamos)
            if (modelo.supportedGenerationMethods && modelo.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- Nombre exacto: ${modelo.name}`);
            }
        });
        
    } catch (error) {
        console.error("Error crítico de red:", error);
    }
}

listarModelosDisponibles();
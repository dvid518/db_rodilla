import { PG_CONFIG } from './db-config.js';

let client = null;

async function getNeonClient() {
    if (client) return client;
    
    // Importar dinámicamente desde CDN
    const module = await import('https://unpkg.com/@neondatabase/serverless@0.9.0/index.js');
    client = module.neon(PG_CONFIG.apiKey);
    return client;
}

export async function queryPG(sql) {
    try {
        const c = await getNeonClient();
        const result = await c(sql);
        return result.rows || [];
    } catch (error) {
        console.error('Error en queryPG:', error);
        return [];
    }
}

export async function insertPG(sql) {
    try {
        const c = await getNeonClient();
        const result = await c(sql);
        return result;
    } catch (error) {
        console.error('Error en insertPG:', error);
        return { rows: [] };
    }
}
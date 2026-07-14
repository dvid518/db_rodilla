async function queryPG(sql) {
    const res = await fetch(NEON_API_URL, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ query: sql })
    });
    const data = await res.json();
    return data.rows || [];
}

async function insertPG(sql) {
    const res = await fetch(NEON_API_URL, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ query: sql })
    });
    return await res.json();
}
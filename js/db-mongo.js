async function findMongo(filter) {
    const res = await fetch(`${MONGO_API_URL}/find`, {
        method: 'POST',
        headers: mongoHeaders(),
        body: JSON.stringify({
            dataSource: MONGO_CONFIG.cluster,
            database: MONGO_CONFIG.database,
            collection: MONGO_CONFIG.collection,
            filter: filter || {}
        })
    });
    return await res.json();
}

async function insertMongo(doc) {
    const res = await fetch(`${MONGO_API_URL}/insertOne`, {
        method: 'POST',
        headers: mongoHeaders(),
        body: JSON.stringify({
            dataSource: MONGO_CONFIG.cluster,
            database: MONGO_CONFIG.database,
            collection: MONGO_CONFIG.collection,
            document: doc
        })
    });
    return await res.json();
}

async function updateMongo(filter, update) {
    const res = await fetch(`${MONGO_API_URL}/updateOne`, {
        method: 'POST',
        headers: mongoHeaders(),
        body: JSON.stringify({
            dataSource: MONGO_CONFIG.cluster,
            database: MONGO_CONFIG.database,
            collection: MONGO_CONFIG.collection,
            filter: filter,
            update: update
        })
    });
    return await res.json();
}
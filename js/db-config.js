const PG_CONFIG = {
    host: 'ep-jolly-bonus-acspto8k-pooler.sa-east-1.aws.neon.tech',
    database: 'neondb',
    user: 'neondb_owner',
    password: 'npg_GTF7rjpsf0IS',
    apiKey: 'napi_tey4sxhq05bgzj65fm4z362mpr1x9a1lmqc53y85dnzuuboay7qruaxesxb653sc'
};
const MONGO_CONFIG = {
    appId: 'ygmrtbnc',
    apiKey: 'faae8203-c9d9-45e9-b472-b3a9ea37ce38',
    cluster: 'RodillaCluster',
    database: 'Rodilla',
    collection: 'clientes_info'
};
const NEON_API_URL = `https://${PG_CONFIG.host}/sql`;
const MONGO_API_URL = `https://data.mongodb-api.com/app/${MONGO_CONFIG.appId}/endpoint/data/v1/action`;
function authHeaders() {
    return {
        'Authorization': `Bearer ${PG_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
    };
}
function mongoHeaders() {
    return {
        'api-key': MONGO_CONFIG.apiKey,
        'Content-Type': 'application/json'
    };
}
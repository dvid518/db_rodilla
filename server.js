const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ============================================================
// 1. CONEXIÓN A NEON (POSTGRESQL)
// ============================================================
const pgPool = new Pool({
    host: 'ep-jolly-bonus-acspto8k-pooler.sa-east-1.aws.neon.tech',
    database: 'neondb',
    user: 'neondb_owner',
    password: 'npg_GTF7rjpsf0IS',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

// ============================================================
// 2. CONEXIÓN A MONGODB ATLAS
// ============================================================
const MONGO_URI = 'mongodb+srv://ygmrtbnc:faae8203-c9d9-45e9-b472-b3a9ea37ce38@rodillacluster.fyl02.mongodb.net/';
const mongoClient = new MongoClient(MONGO_URI);
let mongoDB;

async function conectarMongo() {
    try {
        await mongoClient.connect();
        mongoDB = mongoClient.db('Rodilla');
        console.log('✅ Conectado a MongoDB Atlas');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
    }
}
conectarMongo();

// ============================================================
// 3. ENDPOINTS
// ============================================================

// 3.1. Obtener productos
app.get('/api/productos', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT * FROM productos WHERE activo = true ORDER BY nombre');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// 3.2. Obtener resumen (stats)
app.get('/api/resumen', async (req, res) => {
    try {
        const ingresos = await pgPool.query('SELECT COALESCE(SUM(total), 0) as total FROM pedidos');
        const pedidos = await pgPool.query('SELECT COUNT(*) as count FROM pedidos');
        const clientes = await pgPool.query('SELECT COUNT(*) as count FROM clientes');
        const productos = await pgPool.query('SELECT COUNT(*) as count FROM productos');
        const comentarios = await mongoDB.collection('clientes_info').find({}).toArray();
        const totalComentarios = comentarios.reduce((acc, doc) => acc + (doc.comentarios ? doc.comentarios.length : 0), 0);
        res.json({
            ingresos: ingresos.rows[0].total,
            pedidos: pedidos.rows[0].count,
            clientes: clientes.rows[0].count,
            productos: productos.rows[0].count,
            comentarios: totalComentarios
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener resumen' });
    }
});

// 3.3. Obtener pedidos recientes
app.get('/api/pedidos-recientes', async (req, res) => {
    try {
        const result = await pgPool.query(`
            SELECT p.id_pedido, c.nombre, p.total, p.fecha_pedido
            FROM pedidos p JOIN clientes c ON p.id_cliente = c.id_cliente
            ORDER BY p.fecha_pedido DESC LIMIT 5
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pedidos recientes' });
    }
});

// 3.4. Obtener clientes con comentarios (vista integrada)
app.get('/api/clientes-integrado', async (req, res) => {
    try {
        const clientes = await pgPool.query('SELECT id_cliente, nombre, email, telefono FROM clientes ORDER BY id_cliente LIMIT 20');
        const resultado = [];
        for (const cliente of clientes.rows) {
            const mongoDoc = await mongoDB.collection('clientes_info').findOne({ id_cliente: cliente.id_cliente });
            resultado.push({
                ...cliente,
                comentarios_count: mongoDoc?.comentarios?.length || 0,
                preferencias: mongoDoc?.preferencias || null
            });
        }
        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener clientes integrados' });
    }
});

// 3.5. Obtener cliente específico con detalles
app.get('/api/cliente/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const cliente = await pgPool.query('SELECT * FROM clientes WHERE id_cliente = $1', [id]);
        if (cliente.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        const mongoDoc = await mongoDB.collection('clientes_info').findOne({ id_cliente: id });
        res.json({
            ...cliente.rows[0],
            preferencias: mongoDoc?.preferencias || null,
            comentarios: mongoDoc?.comentarios || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener cliente' });
    }
});

// 3.6. Obtener todos los pedidos (admin)
app.get('/api/pedidos', async (req, res) => {
    try {
        const result = await pgPool.query(`
            SELECT p.id_pedido, c.nombre, p.total, p.fecha_pedido, p.estado
            FROM pedidos p JOIN clientes c ON p.id_cliente = c.id_cliente
            ORDER BY p.fecha_pedido DESC LIMIT 20
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

// 3.7. Obtener todos los clientes (admin)
app.get('/api/clientes', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT id_cliente, nombre, email, telefono FROM clientes ORDER BY id_cliente LIMIT 20');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

// 3.8. Obtener todos los productos (admin)
app.get('/api/productos-admin', async (req, res) => {
    try {
        const result = await pgPool.query('SELECT * FROM productos ORDER BY id_producto');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// 3.9. Agregar comentario
app.post('/api/comentario', async (req, res) => {
    try {
        const { id_cliente, texto } = req.body;
        if (!id_cliente || !texto) return res.status(400).json({ error: 'Faltan datos' });
        const mongoDoc = await mongoDB.collection('clientes_info').findOne({ id_cliente });
        if (mongoDoc) {
            await mongoDB.collection('clientes_info').updateOne(
                { id_cliente },
                { $push: { comentarios: { texto, fecha: new Date().toISOString() } } }
            );
        } else {
            await mongoDB.collection('clientes_info').insertOne({
                id_cliente,
                comentarios: [{ texto, fecha: new Date().toISOString() }]
            });
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar comentario' });
    }
});

// 3.10. Guardar preferencias
app.post('/api/preferencias', async (req, res) => {
    try {
        const { id_cliente, preferencias } = req.body;
        if (!id_cliente) return res.status(400).json({ error: 'Falta id_cliente' });
        await mongoDB.collection('clientes_info').updateOne(
            { id_cliente },
            { $set: { preferencias } },
            { upsert: true }
        );
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al guardar preferencias' });
    }
});

// 3.11. Login
app.post('/api/login', async (req, res) => {
    try {
        const { email } = req.body;
        const result = await pgPool.query('SELECT id_cliente, nombre, email FROM clientes WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en login' });
    }
});

// 3.12. Registro
app.post('/api/registro', async (req, res) => {
    try {
        const { nombre, email, telefono } = req.body;
        const result = await pgPool.query(
            'INSERT INTO clientes (nombre, email, telefono) VALUES ($1, $2, $3) RETURNING id_cliente, nombre, email',
            [nombre, email, telefono]
        );
        await mongoDB.collection('clientes_info').insertOne({
            id_cliente: result.rows[0].id_cliente,
            comentarios: [],
            preferencias: { idioma: 'es', metodo_pago: '', notificaciones: { email: true, sms: false, promo: false } }
        });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar cliente' });
    }
});

// 3.13. Crear pedido
app.post('/api/pedido', async (req, res) => {
    try {
        const { id_cliente, items } = req.body;
        if (!id_cliente || !items || items.length === 0) return res.status(400).json({ error: 'Faltan datos' });
        const pedidoResult = await pgPool.query(
            'INSERT INTO pedidos (id_cliente) VALUES ($1) RETURNING id_pedido',
            [id_cliente]
        );
        const id_pedido = pedidoResult.rows[0].id_pedido;
        for (const item of items) {
            await pgPool.query(
                'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad) VALUES ($1, $2, $3)',
                [id_pedido, item.id, item.cantidad]
            );
        }
        const totalResult = await pgPool.query('SELECT total FROM pedidos WHERE id_pedido = $1', [id_pedido]);
        res.json({ success: true, id_pedido, total: totalResult.rows[0].total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear pedido' });
    }
});

// 3.14. Obtener pedidos de un cliente
app.get('/api/mis-pedidos/:id_cliente', async (req, res) => {
    try {
        const id_cliente = parseInt(req.params.id_cliente);
        const result = await pgPool.query(
            'SELECT id_pedido, fecha_pedido, total FROM pedidos WHERE id_cliente = $1 ORDER BY fecha_pedido DESC',
            [id_cliente]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

// 3.15. Obtener perfil del cliente
app.get('/api/perfil/:id_cliente', async (req, res) => {
    try {
        const id_cliente = parseInt(req.params.id_cliente);
        const result = await pgPool.query(
            'SELECT nombre, email, telefono, fecha_registro FROM clientes WHERE id_cliente = $1',
            [id_cliente]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
});

// 3.16. Obtener comentarios de un cliente
app.get('/api/mis-comentarios/:id_cliente', async (req, res) => {
    try {
        const id_cliente = parseInt(req.params.id_cliente);
        const mongoDoc = await mongoDB.collection('clientes_info').findOne({ id_cliente });
        res.json(mongoDoc?.comentarios || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener comentarios' });
    }
});

// 3.17. Obtener preferencias de un cliente
app.get('/api/mis-preferencias/:id_cliente', async (req, res) => {
    try {
        const id_cliente = parseInt(req.params.id_cliente);
        const mongoDoc = await mongoDB.collection('clientes_info').findOne({ id_cliente });
        res.json(mongoDoc?.preferencias || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener preferencias' });
    }
});

// ============================================================
// 4. INICIAR SERVIDOR
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
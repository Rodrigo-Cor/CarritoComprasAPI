const { connectDB, isBase64 } = require('../globalFunctions.js');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const { nombre, descripcion, precio, cantidad, foto } = req.body && req.body.articulo;
    // Verificar que los campos no estén vacíos y sean cadenas de texto
    if (!nombre || !descripcion || typeof nombre !== 'string' || typeof descripcion !== 'string' || nombre.trim() === '' || descripcion.trim() === '') {
        context.res = {
            status: 400,
            body: 'El nombre y la descripción son obligatorios y deben ser cadenas de texto'
        };
        return;
    }

    // Verificar que el precio sea un número válido
    if (typeof precio !== 'number' && isNaN(Number(precio))) {
        context.res = {
            status: 400,
            body: 'El precio debe ser un número válido'
        };
        return;
    }

    // Verificar que la cantidad sea un número entero
    if (!Number.isInteger(Number(cantidad))) {
        context.res = {
            status: 400,
            body: 'La cantidad debe ser un número entero'
        };
        return;
    }

    if (!isBase64(foto)) {
        context.res = {
            status: 400,
            body: 'La foto debe estar en formato Base64'
        };
        return;
    }

    try {
        const connection = await connectDB();

        // Aquí puedes realizar tus operaciones de base de datos
        // Insertar el artículo en una tabla "articulos"
        const sql = 'INSERT INTO articulos (nombre, descripcion, precio, cantidad, foto) VALUES (?, ?, ?, ?, ?)';
        const values = [nombre, descripcion, precio, cantidad, foto];
        await connection.query(sql, values);

        await connection.end(); // Cerrar la conexión al finalizar las operaciones

        context.res = {
            status: 201,
            body: 'Articulo insertado correctamente'
        };

    } catch (error) {
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            context.res = {
                status: 503,
                body: 'Error al conectar con la base de datos: Acceso denegado'
            };
        } else if (error.code === 'ENOTFOUND') {
            context.res = {
                status: 503,
                body: 'Error al conectar con la base de datos: No se encontró el host'
            };
        } else {
            context.res = {
                status: 500,
                body: `Error al insertar el artículo en la base de datos: ${error.message}`
            };
        }
    }
};

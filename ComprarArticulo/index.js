const { connectDB } = require('../globalFunctions.js');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    let connection;

    try {
        connection = await connectDB();
        await connection.beginTransaction();

        const { id, cantidad } = req.body;

        const query = 'SELECT cantidad, nombre FROM articulos WHERE id = ?';
        const [rows] = await connection.query(query, [id]);

        if (rows.length === 0) {
            context.res = {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 404,
                body: {
                    message: 'No se encontró el artículo solicitado'
                }
            };
            await connection.rollback();
            connection.end();
            return;
        }

        const cantidadEnBaseDatos = rows[0].cantidad;
        const nombre = rows[0].nombre;

        const query2 = 'SELECT cantidad FROM carrito_compra WHERE id_articulo = ?';
        const [rows2] = await connection.query(query2, [id]);

        let cantidadEnCarrito = 0;
        if (rows2.length > 0) {
            cantidadEnCarrito = rows2[0].cantidad;
        }

        const cantidadNueva = cantidad - cantidadEnCarrito;
        if (cantidadNueva > cantidadEnBaseDatos) {
            context.res = {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 404,
                body: {
                    message: `No hay suficiente stock para ${nombre}. Se encuentra disponible ${cantidadEnBaseDatos}`
                }
            };
            await connection.rollback();
            connection.end();
            return;
        }

        let query3;
        let values3;

        if (cantidadEnCarrito === 0) {
            query3 = 'INSERT INTO carrito_compra (id_articulo, cantidad) VALUES (?, ?)';
            values3 = [id, cantidad];
        } else {
            query3 = 'UPDATE carrito_compra SET cantidad = ? WHERE id_articulo = ?';
            values3 = [cantidad, id];
        }

        await connection.query(query3, values3);

        const cantidadDiferencia = cantidad - cantidadEnCarrito;
        const query4 = 'UPDATE articulos SET cantidad = cantidad - ? WHERE id = ?';
        const values4 = [cantidadDiferencia, id];
        await connection.query(query4, values4);

        await connection.commit();
        connection.end();

        context.res = {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200,
            body: {
                message: 'Artículo agregado al carrito de compras'
            }
        };

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.end();
        }
        context.res = {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 500,
            body: {
                message: `Error en la transacción: ${error.message}`
            }
        };
    }
};

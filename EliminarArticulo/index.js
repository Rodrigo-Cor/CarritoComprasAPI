const { connectDB } = require('../globalFunctions.js');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {
        const { id } = req.body;

        const connection = await connectDB();

        await connection.beginTransaction();

        // Buscar el artículo en la tabla de artículos
        const query = 'SELECT id, cantidad FROM articulos WHERE id = ?';
        const [rows] = await connection.query(query, [id]);

        // Si no se encuentra el artículo, regresar un mensaje de error
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

        // Obtener el ID del artículo en la base de datos
        const idArticulo = rows[0].id;

        // Buscar el artículo en la tabla de carrito_compra
        const query2 = 'SELECT cantidad FROM carrito_compra WHERE id_articulo = ?';
        const [rows2] = await connection.query(query2, [idArticulo]);

        // Si no se encuentra el artículo en el carrito de compras, regresar un mensaje de error
        if (rows2.length === 0) {
            context.res = {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 404,
                body: {
                    message: 'El artículo no está en el carrito de compras'
                }
            };
            await connection.rollback();
            connection.end();
            return;
        }

        // Obtener la cantidad del artículo en el carrito de compras
        const cantidadEnCarrito = rows2[0].cantidad;

        // Eliminar el artículo de la tabla de carrito_compra
        const query3 = 'DELETE FROM carrito_compra WHERE id_articulo = ?';
        await connection.query(query3, [idArticulo]);

        // Devolver la cantidad del artículo a la tabla de artículos
        const query4 = 'UPDATE articulos SET cantidad = cantidad + ? WHERE id = ?';
        await connection.query(query4, [cantidadEnCarrito, idArticulo]);

        await connection.commit();
        connection.end();

        context.res = {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200,
            body: {
                message: 'Artículo eliminado del carrito de compras'
            }
        };
    } catch (error) {
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

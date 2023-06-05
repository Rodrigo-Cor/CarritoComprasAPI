const { connectDB } = require('../globalFunctions.js');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {
        const connection = await connectDB();

        await connection.beginTransaction();

        const { id, cantidad } = req.body;

        const query = 'SELECT cantidad FROM articulos WHERE id = ?';
        const [rows] = await connection.query(query, [id]);

        if (rows.length === 0) {
            context.res = {
                status: 404,
                body: 'No se encontró el artículo solicitado'
            };
            await connection.rollback();
            connection.end();
            return;
        }

        const cantidadEnBaseDatos = rows[0].cantidad;

        const query2 = 'SELECT cantidad FROM carrito_compra WHERE id_articulo = ?';
        const [rows2] = await connection.query(query2, [id]);

        let cantidadEnCarrito = 0;
        if (rows2.length > 0) {
            cantidadEnCarrito = rows2[0].cantidad;
        }

        const cantidadNueva = cantidad - cantidadEnCarrito;

        if (cantidadNueva > cantidadEnBaseDatos) {
            context.res = {
                status: 404,
                body: 'No hay suficiente stock para el artículo solicitado'
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
            status: 200,
            body: 'Artículo agregado al carrito de compras'
        };

    } catch (error) {
        context.res = {
            status: 500,
            body: `Error en la transacción: ${error.message}`
        };
    }
};

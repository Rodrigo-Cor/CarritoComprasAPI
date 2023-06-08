const { connectDB } = require('../globalFunctions.js');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {
        const connection = await connectDB();
        await connection.beginTransaction();

        // Obtener todos los registros del carrito de compras
        const query = 'SELECT id_articulo, cantidad FROM carrito_compra';
        const [rows] = await connection.query(query);

        // Iterar sobre los registros y devolver la cantidad a la tabla de articulos
        for (const row of rows) {
            const idArticulo = row.id_articulo;
            const cantidad = row.cantidad;
            const updateQuery = 'UPDATE articulos SET cantidad = cantidad + ? WHERE id = ?';
            await connection.query(updateQuery, [cantidad, idArticulo]);
        }

        // Eliminar todos los registros del carrito de compras
        const deleteQuery = 'DELETE FROM carrito_compra';
        await connection.query(deleteQuery);

        await connection.commit();
        connection.end();

        context.res = {
            status: 200,
            body: 'El carrito de compras se ha vaciado correctamente'
        };
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.end();
        }
        context.res = {
            status: 500,
            body: `Error en la transacción: ${error.message}`
        };
    }
};

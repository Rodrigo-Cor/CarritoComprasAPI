const { connectDB } = require('../globalFunctions.js');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {
        const connection = await connectDB();

        const query = "SELECT a.id,  a.nombre, a.precio, a.foto, cc.cantidad "
            + "FROM articulos a "
            + "JOIN carrito_compra cc ON a.id = cc.id_articulo";

        const [rows] = await connection.query(query);

        if (rows.length === 0) {
            context.res = {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200,
                body: []
            };
        } else {
            const articulosCarrito = rows.map((row) => ({
                id: row.id,
                nombre: row.nombre,
                precio: row.precio,
                foto: Buffer.from(row.foto).toString('utf-8'),
                cantidad: row.cantidad
            }));

            context.res = {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200,
                body: articulosCarrito
            };
        }

        connection.end();
    } catch (error) {
        context.res = {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 500,
            body: {
                message: `Error al realizar la búsqueda en la base de datos: ${error.message}`
            }
        };
    }
};

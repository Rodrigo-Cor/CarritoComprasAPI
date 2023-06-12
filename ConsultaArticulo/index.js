const { connectDB } = require('../globalFunctions.js');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    try {
        const connection = await connectDB();

        const busqueda = req.body && req.body.busqueda;

        if (!busqueda) {
            context.res = {
                status: 400,
                body: JSON.stringify({ message: 'La consulta de búsqueda es requerida' })
            };
            return;
        }

        const sql =
            'SELECT id, nombre, descripcion, precio, foto FROM articulos WHERE nombre LIKE ? OR descripcion LIKE ?';
        const searchTerm = `%${busqueda}%`;

        const [results] = await connection.query(sql, [searchTerm, searchTerm]);

        await connection.end(); // Cerrar la conexión al finalizar las operaciones

        const articulos = results.map((row) => ({
            id: row.id,
            nombre: row.nombre,
            descripcion: row.descripcion,
            precio: row.precio,
            foto: Buffer.from(row.foto).toString('utf-8')
        }));

        context.res = {
            body: JSON.stringify(articulos)
        };
    } catch (error) {
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            context.res = {
                status: 503,
                body: JSON.stringify({ message: 'Acceso denegado' })
            };
        } else if (error.code === 'ENOTFOUND') {
            context.res = {
                status: 503,
                body: JSON.stringify({ message: 'Error al conectar con la base de datos' })
            };
        } else {
            console.log(error.message);
            context.res = {
                status: 500,
                body: JSON.stringify({ message: 'Error al realizar la búsqueda' })
            };
        }
    }
};

const { connectDB } = require('../globalFunctions.js'); // Importa la función de conexión

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const busqueda = req.body && req.body.busqueda;

    if (!busqueda) {
        context.res = {
            status: 400,
            body: 'La consulta de búsqueda es requerida'
        };
        return;
    }

    const connection = connectDB(); // Conectarse a la base de datos
    connection.connect((error) => {
        if (error) {
            console.error('Error de conexión:', error);
            context.res = {
                status: 503,
                body: 'Error de conexión a la base de datos'
            };
            connection.end(); // Cerrar la conexión en caso de error
            return;
        }

        console.log('Conexión exitosa!');
        // Aquí puedes realizar tus operaciones de base de datos

        // Realizar la búsqueda en la tabla "articulos"
        const sql = 'SELECT id, nombre, descripcion, precio, foto FROM articulos WHERE nombre LIKE ? OR descripcion LIKE ?';
        const searchTerm = `%${busqueda}%`;

        connection.query(sql, [searchTerm, searchTerm], (err, results) => {
            if (err) {
                console.error('Error al realizar la búsqueda:', err);
                context.res = {
                    status: 500,
                    body: 'Error al realizar la búsqueda en la base de datos'
                };
            } else {
                console.log('Búsqueda realizada correctamente');
                const articulos = results.map((row) => ({
                    id: row.id,
                    nombre: row.nombre,
                    descripcion: row.descripcion,
                    precio: row.precio,
                    foto: row.foto
                }));
                context.res = {
                    body: articulos
                };
            }
            connection.end(); // Cerrar la conexión al finalizar las operaciones
        });
    });
};

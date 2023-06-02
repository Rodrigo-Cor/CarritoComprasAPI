const { connectDB, isBase64 } = require('../globalFunctions.js'); // Importa la función de conexión

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

        // Insertar el artículo en una tabla "articulos"
        const sql = 'INSERT INTO articulos (nombre, descripcion, precio, cantidad, foto) VALUES (?, ?, ?, ?, ?)';
        const values = [nombre, descripcion, precio, cantidad, foto];

        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error al insertar el artículo:', err);
                context.res = {
                    status: 500,
                    body: 'Error al insertar el artículo en la base de datos'
                };
            } else {
                console.log('Articulo insertado correctamente');
                context.res = {
                    body: 'Articulo insertado correctamente'
                };
            }
            connection.end(); // Cerrar la conexión al finalizar las operaciones
        });
    });
};

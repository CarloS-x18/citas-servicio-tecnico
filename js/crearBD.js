function crearDB() {
    const abrirConexion = window.indexedDB.open('crm', 1); // crea la base de datos

    abrirConexion.onerror = function() { // en caso de error
        console.log('Error al conectar con base de datos')
    }

    abrirConexion.onsuccess = function() { // en caso de exito
        DB = abrirConexion.result; // manda el resultado de la conexion a la variable para utilizarla globalmente en el documento
    }

    abrirConexion.onupgradeneeded = function(e) { // Crea las tablas
        const db = e.target.result; // extrae el resultado de la conexion
        
        const objectStore = db.createObjectStore('crm', { keyPath: 'id', autoIncrement: true }); // Crea la tabla general de la bd

        objectStore.createIndex('nombre', 'nombre', { unique: false }); // crea subtablas en el object store
        objectStore.createIndex('tipo', 'tipo', { unique: false });
        objectStore.createIndex('telefono', 'telefono', { unique: false });
        objectStore.createIndex('correo', 'correo', { unique: false });
        objectStore.createIndex('descripcion', 'descripcion', { unique: false });

        console.log('BD lista y creada');
    }

}
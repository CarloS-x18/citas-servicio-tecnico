const formulario = document.querySelector('#formulario');
const tituloCitas = document.querySelector('#titulo-citas');
const contenedorCitas = document.querySelector('#contenedor-citas');
const titulo = document.querySelector('#titulo');

let DB;
let contadorCitas = 0;


document.addEventListener('DOMContentLoaded', () => {
    // Inicia la conexion con la base de datos
    crearDB();

    // Mostrar el HTML
    if(window.indexedDB.open('crm', 1)) {
        setTimeout(() => {
            obtenerClientes();
        }, 100);
    }

    // Valida los datos del formulario 
    formulario.addEventListener('submit', validarCita);
});

function validarCita(e) {
    e.preventDefault();

    const nombre = document.querySelector('#nombre').value;
    const tipo = document.querySelector('#tipo').value;
    const telefono = document.querySelector('#telefono').value;
    const email = document.querySelector('#email').value;
    const descripcion = document.querySelector('#descripcion').value;
    
    if( nombre === '' || tipo === '' || telefono === '' || email === '' || descripcion === '' ) {
        imprimirAlerta('Todos los campos son obligatorios', 'error');

        return;
    }

    const cita = {
        nombre, 
        tipo,
        telefono,
        email,
        descripcion
    }

    cita.id = Date.now();

    agregarCita(cita);

    formulario.reset();

    obtenerClientes();
}

function agregarCita(cita) {
    const transaction = DB.transaction(['crm'], 'readwrite');
    const objectStore = transaction.objectStore('crm');

    objectStore.add(cita);

    transaction.onerror = function() {
        imprimirAlerta('Hubo un error', 'error');
    } 

    transaction.oncomplete = function() {
        imprimirAlerta('Cita generada correctamente');
    }
}

function obtenerClientes() {
    // Se reabre la conexion a la base de datos
    const abrirConexion = window.indexedDB.open('crm', 1);

    abrirConexion.onerror = function() {
        console.log('Hubo un error');
    }

    abrirConexion.onsuccess = function() {
        DB = abrirConexion.result; // Se inserta el resultado a la variable

        const objectStore = DB.transaction('crm').objectStore('crm'); // abrimos el objectstore

        objectStore.openCursor().onsuccess = function(e) {
            const cursor = e.target.result;

            if(cursor) {
                const { id, nombre, tipo, telefono, email, descripcion } = cursor.value;

                contenedorCitas.innerHTML += `
                    <div class="cita">
                    <p class="title-cita">Servicio: ${tipo}</p>
                    <div class="dato">
                        <p class="f-n">Nombre:</p> 
                        <p>${nombre}</p>
                    </div>
                    <div class="dato">
                        <p class="f-n">Teléfono:</p> 
                        <p>${telefono}</p>
                    </div>
                    <div class="dato">
                        <p class="f-n">Correo:</p> 
                        <p>${email}</p>
                    </div>
                    <div class="dato">
                        <p class="f-n" >Descripción:</p> 
                        <p>${descripcion}</p>
                    </div>
                    <div class="botones">
                        <button class="btn-b btn">Editar </button>
                        <button class="btn-r btn">Borrar</button>
                    </div>
                `;

                contadorCitas++;

                cursor.continue();
            }

            if(contadorCitas > 0) {
                titulo.innerText = 'Administrar Citas';
            }
        }
    }
}

function imprimirAlerta(mensaje, tipo) { 
    const alerta = document.querySelector('.alerta');

    if(!alerta) {
        const alerta = document.createElement('div');
        alerta.innerText = mensaje;
        alerta.classList.add('alerta');

        if(tipo === 'error') {
            alerta.classList.add('error');
        } else {
            alerta.classList.add('success')
        }

        formulario.appendChild(alerta);

        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }
}
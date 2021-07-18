const formulario = document.querySelector('#formulario');
const tituloCitas = document.querySelector('#titulo-citas');
const contenedorCitas = document.querySelector('#contenedor-citas');
const titulo = document.querySelector('#titulo');
const btnAgregar = document.querySelector('.button');

// Inputs
const nombreInput = document.querySelector('#nombre');
const tipoInput = document.querySelector('#tipo');
const telefonoInput = document.querySelector('#telefono');
const emailInput = document.querySelector('#email');
const descripcionInput = document.querySelector('#descripcion');

let DB;
let contadorCitas = 0;
let editar = false;
let idEditar;


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

    // Eliminar cita
    contenedorCitas.addEventListener('click', eliminarCita);

    // Editar cit
    contenedorCitas.addEventListener('click', editarCita);
});

function validarCita(e) {
    e.preventDefault();

    const nombre = nombreInput.value;
    const tipo = tipoInput.value;
    const telefono = telefonoInput.value;
    const email = emailInput.value;
    const descripcion = descripcionInput.value;
    
    if( nombre === '' || tipo === '' || telefono === '' || email === '' || descripcion === '' ) {
        imprimirAlerta('Todos los campos son obligatorios', 'error');

        return;
    }

    if(editar) {
        const citaActializada = { 
            nombre, 
            tipo,
            telefono,
            email,
            descripcion,
            id: idEditar
        }

        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        objectStore.put(citaActializada);

        transaction.oncomplete = function() {
            imprimirAlerta('Se actualizo con exito');
            editar = false;
            idEditar = '';
            btnAgregar.textContent = 'Agregar Cita';
        }

        transaction.onerror = function() {
            imprimirAlerta('Hubo un error', 'error');
        }
    } else {
        const cita = { // se agregan los datos al objeto
            nombre, 
            tipo,
            telefono,
            email,
            descripcion
        }
    
        cita.id = Date.now();
    
        agregarCita(cita);
    }

    formulario.reset();
    obtenerClientes();
}

function agregarCita(cita) {
    const transaction = DB.transaction(['crm'], 'readwrite'); // se abre la transaccion 
    const objectStore = transaction.objectStore('crm'); // se ingresa al contenedor de tablas

    objectStore.add(cita); // se agrega la cita(objeto de cita)

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

        limpiarHTML();

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
                            <button data-cita="${id}" class="btn-b btn editar">Editar </button>
                            <button data-cita="${id}" class="btn-r btn eliminar">Borrar</button>
                        </div>
                    </div>
                `;

                contadorCitas++;
                cambiarTitulo();

                cursor.continue();
            }
        }
    }
}

function eliminarCita(e) {
    if(e.target.classList.contains('eliminar')) { // solo si se selecciona el boton de eliminar
        const idCita = Number(e.target.dataset.cita); // toma el id

        const confirmar = confirm('¿Realmente deseas eliminar la cita?'); 

        if(confirmar) {
            const transaction = DB.transaction(['crm'], 'readwrite');
            const objectStore = transaction.objectStore('crm');

            objectStore.delete(idCita);

            transaction.oncomplete = function() {
                e.target.parentElement.parentElement.remove(); // Elimina el elemento del HTML

                contadorCitas--; // resta en el contador para variar el titulo del contenedor citas
                cambiarTitulo(); // Cambai el titulo en caso de ser requerido
            }
        }
    }
}

function editarCita(e) {
    if(e.target.classList.contains('editar')) {

        document.querySelector('.logo').scrollIntoView({
            behavior: "smooth"
        });

        const idCita = Number(e.target.dataset.cita);
        editar = true;

        // Traer el objeto que se editara
        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        const cita = objectStore.openCursor();
        cita.onsuccess = function(e) {
            const cursor = e.target.result;
            
            if(cursor) {
                if(cursor.value.id === idCita) {
                    llenarFormulario(cursor.value);
                    idEditar = idCita;

                    return;
                }
                cursor.continue();
            }
        }
    }
}

function llenarFormulario(cita) {
    const { nombre, telefono, tipo, email, descripcion } = cita;

    nombreInput.value = nombre;
    tipoInput.value = tipo;
    telefonoInput.value = telefono;
    emailInput.value = email;
    descripcionInput.value = descripcion;

    btnAgregar.textContent = 'Editar Cita';

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

function limpiarHTML() {
    while(contenedorCitas.firstChild) {
        contenedorCitas.removeChild(contenedorCitas.firstChild);
    }
}

function cambiarTitulo() {
    if(contadorCitas > 0) {
        titulo.innerText = 'Administrar Citas';
    } else {
        titulo.innerText = 'No hay citas para mostrar, inicia creando una';
    }
}
const formulario = document.querySelector('#formulario');
const tituloCitas = document.querySelector('#titulo-citas');
const contenedorCitas = document.querySelector('#contenedor-citas');

document.addEventListener('DOMContentLoaded', () => {
    formulario.addEventListener('submit', agregarCita);
});

function agregarCita(e) {
    e.preventDefault();

    const nombreInput = document.querySelector('#nombre').value;
    const tipoInput = document.querySelector('#tipo').value;
    const telefonoInput = document.querySelector('#telefono').value;
    const emailInput = document.querySelector('#email').value;
    const descripcionInput = document.querySelector('#descripcion').value;
    
    if( nombreInput === '' || tipoInput === '' || telefonoInput === '' || emailInput === '' || descripcionInput === '' ) {
        imprimirAlerta('Todos los campos son obligatorios', 'error');

        return;
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
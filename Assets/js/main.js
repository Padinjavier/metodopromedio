document.addEventListener('DOMContentLoaded', function() {
    let totalCantidadCompras = 0;
    let totalCostoCompras = 0;
    let totalCantidadVentas = 0;
    let totalCostoVentas = 0;

    
    const tabla = document.getElementById('tablaInventario').getElementsByTagName('tbody')[0];
    const costoVentaTotalElement = document.getElementById('costoVentaTotal');
    // Elementos para los totales de compras y saldos
    const totalComprasElement = document.getElementById('totalCompras');
    const totalSaldoElement = document.getElementById('totalSaldo');

    const formulario = document.getElementById('formularioInventario');
    const botonAgregarProducto = document.getElementById('agregarProducto');
    const entradasProductos = document.getElementById('entradasProductos');
    
    botonAgregarProducto.addEventListener('click', function() {
        const nuevoProducto = entradasProductos.children[0].cloneNode(true);
        nuevoProducto.querySelector('.eliminarProducto').addEventListener('click', function() {
            // Solo permite eliminar si hay más de un conjunto de campos de producto
            if (entradasProductos.children.length > 1) {
                this.parentNode.remove();
            } else {
                alert('Debe haber al menos un producto.');
            }
        });
        entradasProductos.appendChild(nuevoProducto);
    });

    // Agrega eventos de eliminación a los productos existentes
    document.querySelectorAll('.eliminarProducto').forEach(function(eliminarBoton) {
        eliminarBoton.addEventListener('click', function() {
            // Solo permite eliminar si hay más de un conjunto de campos de producto
            if (entradasProductos.children.length > 1) {
                this.parentNode.remove();
            } else {
                alert('Debe haber al menos un producto.');
            }
        });
    });

    formulario.addEventListener('submit', function(e) {
        e.preventDefault();

        const fecha = document.getElementById('fecha').value;
        const tipoMovimiento = document.getElementById('tipoMovimiento').value;
        const cantidades = document.querySelectorAll('.cantidad');
        const preciosUnitarios = document.querySelectorAll('.precioUnitario');

        cantidades.forEach((cantidadElement, index) => {
            const cantidad = parseInt(cantidadElement.value, 10);
            const precioUnitario = parseFloat(preciosUnitarios[index].value);
            const costoTotal = cantidad * precioUnitario;

            if (tipoMovimiento === 'compra') {
                totalCantidadCompras += cantidad;
                totalCostoCompras += costoTotal;
            } else {
                totalCantidadVentas += cantidad;
                totalCostoVentas += costoTotal;
            }

            const nuevaFila = tabla.insertRow();
            nuevaFila.innerHTML = `
                <td>${fecha}</td>
                <td>${tipoMovimiento === 'compra' ? cantidad : ''}</td>
                <td>${tipoMovimiento === 'compra' ? precioUnitario.toFixed(2) : ''}</td>
                <td>${tipoMovimiento === 'compra' ? costoTotal.toFixed(2) : ''}</td>
                <td>${tipoMovimiento === 'venta' ? cantidad : ''}</td>
                <td>${tipoMovimiento === 'venta' ? precioUnitario.toFixed(2) : ''}</td>
                <td>${tipoMovimiento === 'venta' ? costoTotal.toFixed(2) : ''}</td>
            `;

            // Solo calculamos el inventario promedio si hay compras
            if (totalCantidadCompras > 0) {
                const inventarioPromedio = totalCostoCompras / totalCantidadCompras;
                const saldoCantidad = totalCantidadCompras - totalCantidadVentas;
                const saldoCostoTotal = saldoCantidad * inventarioPromedio;

                nuevaFila.innerHTML += `
                    <td>${saldoCantidad.toFixed(2)}</td>
                    <td>${inventarioPromedio.toFixed(2)}</td>
                    <td>${saldoCostoTotal.toFixed(2)}</td>
                `;
            } else {
                nuevaFila.innerHTML += `<td colspan="3">No hay compras registradas</td>`;
            }
        });

        if (tipoMovimiento === 'venta') {
            let costoVentaTotal = parseFloat(costoVentaTotalElement.textContent) || 0;
            costoVentaTotal += totalCostoVentas;
            costoVentaTotalElement.textContent = costoVentaTotal.toFixed(2);
        }

        // Actualizamos los totales de compras y saldos
        totalComprasElement.textContent = totalCostoCompras.toFixed(2);
        totalSaldoElement.textContent = (totalCostoCompras - totalCostoVentas).toFixed(2);
        // formulario.reset();
    });

    


    const exportarBoton = document.getElementById('exportarDatos');
    const importarBoton = document.getElementById('importarDatos');

    
    
    exportarBoton.addEventListener('click', function () {
        const data = obtenerDatos();
        const jsonData = JSON.stringify(data);
    
        // Obtener la fecha y hora actual
        const fechaHoraActual = new Date();
        const fechaHoraFormato = `${fechaHoraActual.getFullYear()}-${padZero(fechaHoraActual.getMonth() + 1)}-${padZero(fechaHoraActual.getDate())}_${padZero(fechaHoraActual.getHours())}-${padZero(fechaHoraActual.getMinutes())}-${padZero(fechaHoraActual.getSeconds())}`;
    
        // Nombre del archivo con la fecha y hora
        const nombreArchivo = `datos_inventario_${fechaHoraFormato}.json`;
    
        descargarArchivo(jsonData, nombreArchivo);
    });
    
    // Función para agregar ceros a la izquierda para asegurar dos dígitos
    function padZero(numero) {
        return numero < 10 ? `0${numero}` : numero;
    }






    importarBoton.addEventListener('click', function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', function (event) {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const jsonData = e.target.result;
                    importarDatos(jsonData);
                };
                reader.readAsText(file);
            }
        });

        input.click();
    });

    // Función para obtener los datos del formulario
    function obtenerDatos() {
        const datos = {
            totalCantidadCompras,
            totalCostoCompras,
            totalCantidadVentas,
            totalCostoVentas,
            filas: []
        };

        const filas = tabla.getElementsByTagName('tr');
        for (let i = 0; i < filas.length; i++) {
            const celdas = filas[i].getElementsByTagName('td');
            const filaDatos = {
                fecha: celdas[0].textContent,
                compras: {
                    cantidad: celdas[1].textContent,
                    costoUnitario: celdas[2].textContent,
                    costoTotal: celdas[3].textContent
                },
                ventas: {
                    cantidad: celdas[4].textContent,
                    costoUnitario: celdas[5].textContent,
                    costoTotal: celdas[6].textContent
                },
                saldos: {
                    cantidad: celdas[7].textContent,
                    costoPromedio: celdas[8].textContent,
                    costoTotal: celdas[9].textContent
                }
            };
            datos.filas.push(filaDatos);
        }

        return datos;
    }

    // Función para descargar un archivo con datos
    function descargarArchivo(contenido, nombreArchivo) {
        const blob = new Blob([contenido], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
    }

    // Función para importar datos y actualizar la tabla
    function importarDatos(jsonData) {
        const datosImportados = JSON.parse(jsonData);

        // Actualizar variables globales con los datos importados
        totalCantidadCompras = datosImportados.totalCantidadCompras;
        totalCostoCompras = datosImportados.totalCostoCompras;
        totalCantidadVentas = datosImportados.totalCantidadVentas;
        totalCostoVentas = datosImportados.totalCostoVentas;

        // Limpiar la tabla actual
        while (tabla.firstChild) {
            tabla.removeChild(tabla.firstChild);
        }

        // Insertar las filas importadas en la tabla
        datosImportados.filas.forEach((fila) => {
            const nuevaFila = tabla.insertRow();
            nuevaFila.innerHTML = `
                <td>${fila.fecha}</td>
                <td>${fila.compras.cantidad}</td>
                <td>${fila.compras.costoUnitario}</td>
                <td>${fila.compras.costoTotal}</td>
                <td>${fila.ventas.cantidad}</td>
                <td>${fila.ventas.costoUnitario}</td>
                <td>${fila.ventas.costoTotal}</td>
                <td>${fila.saldos.cantidad}</td>
                <td>${fila.saldos.costoPromedio}</td>
                <td>${fila.saldos.costoTotal}</td>
            `;
        });

        // Actualizar totales en la página
        totalComprasElement.textContent = totalCostoCompras.toFixed(2);
        totalSaldoElement.textContent = (totalCostoCompras - totalCostoVentas).toFixed(2);
        costoVentaTotalElement.textContent = totalCostoVentas.toFixed(2);

        // Notificar al usuario que la importación fue exitosa
        alert('Datos importados exitosamente.');
    }
});


let exportarAntesDeCerrar = false;

window.addEventListener('beforeunload', function (event) {
    if (!exportarAntesDeCerrar) {
        const confirmacion = confirm("Estás a punto de cerrar la página y perder los datos. ¿Deseas exportarlos antes de salir?");
        
        if (!confirmacion) {
            event.preventDefault();
        }
    }
});

const exportarBoton = document.getElementById('exportarDatos');

const importarBoton = document.getElementById('importarDatos');




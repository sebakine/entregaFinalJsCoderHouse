const STORAGE_CARRITO = "coffeelink_carrito";
const STORAGE_CLIENTE = "coffeelink_cliente";

let productos = [];
let carrito = JSON.parse(localStorage.getItem(STORAGE_CARRITO)) || [];
let cliente = localStorage.getItem(STORAGE_CLIENTE) || "Sebastián Felipe Muñoz Rivera";

const listaProductos = document.querySelector("#listaProductos");
const listaCarrito = document.querySelector("#listaCarrito");
const totalSpan = document.querySelector("#total");
const totalFinalSpan = document.querySelector("#totalFinal");
const contadorItems = document.querySelector("#contadorItems");
const checkDescuento = document.querySelector("#checkDescuento");
const formCliente = document.querySelector("#formCliente");
const inputCliente = document.querySelector("#inputCliente");
const clienteActual = document.querySelector("#clienteActual");
const btnVaciar = document.querySelector("#btnVaciar");
const btnFinalizar = document.querySelector("#btnFinalizar");

const inicializarApp = async () => {
    inputCliente.value = cliente;
    clienteActual.textContent = cliente;
    
    try {
        const respuesta = await fetch("productos.json");
        productos = await respuesta.json();
        renderProductos();
        actualizarUI();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo cargar el catálogo de productos.',
            background: '#18181b',
            color: '#f4f4f5'
        });
    }
};

const guardarDatos = () => {
    localStorage.setItem(STORAGE_CARRITO, JSON.stringify(carrito));
    localStorage.setItem(STORAGE_CLIENTE, cliente);
};

const mostrarToast = (mensaje, color) => {
    Toastify({
        text: mensaje,
        duration: 2000,
        gravity: "bottom",
        position: "right",
        style: { background: color, color: "#09090b", borderRadius: "8px", fontWeight: "600" }
    }).showToast();
};

const agregarAlCarrito = (idProducto) => {
    const producto = productos.find(p => p.id === idProducto);
    const existe = carrito.find(item => item.id === idProducto);

    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    mostrarToast(`${producto.nombre} agregado`, "#fbbf24");
    actualizarUI();
};

const eliminarDelCarrito = (idProducto) => {
    carrito = carrito.filter(item => item.id !== idProducto);
    mostrarToast("Producto eliminado", "#f43f5e");
    actualizarUI();
};

const modificarCantidad = (idProducto, delta) => {
    const item = carrito.find(i => i.id === idProducto);
    if (item) {
        item.cantidad += delta;
        if (item.cantidad < 1) {
            eliminarDelCarrito(idProducto);
        } else {
            actualizarUI();
        }
    }
};

const calcularTotales = () => {
    const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const totalFinal = checkDescuento.checked ? subtotal * 0.9 : subtotal;
    const cantidadItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    return { subtotal, totalFinal, cantidadItems };
};

const actualizarUI = () => {
    guardarDatos();
    renderCarrito();
    
    const totales = calcularTotales();
    totalSpan.textContent = totales.subtotal;
    totalFinalSpan.textContent = Math.round(totales.totalFinal);
    contadorItems.textContent = totales.cantidadItems;
};

const renderProductos = () => {
    listaProductos.innerHTML = "";
    productos.forEach(p => {
        const div = document.createElement("div");
        div.className = "rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden flex flex-col";
        div.innerHTML = `
            <img src="${p.img}" alt="${p.nombre}" class="h-44 w-full object-cover" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+Imagen'"/>
            <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="text-lg font-semibold">${p.nombre}</h3>
                    <p class="text-sm text-zinc-400 mt-1">${p.desc}</p>
                </div>
                <div class="mt-4 flex items-center justify-between">
                    <span class="font-semibold text-lg">$${p.precio}</span>
                    <button id="add_${p.id}" class="rounded-xl bg-amber-400 text-zinc-950 font-semibold px-4 py-2 hover:bg-amber-300 transition-colors">
                        Agregar
                    </button>
                </div>
            </div>
        `;
        listaProductos.appendChild(div);
        document.querySelector(`#add_${p.id}`).addEventListener("click", () => agregarAlCarrito(p.id));
    });
};

const renderCarrito = () => {
    listaCarrito.innerHTML = "";
    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<p class="text-sm text-zinc-400 py-4">La orden está vacía.</p>';
        return;
    }

    carrito.forEach(item => {
        const div = document.createElement("div");
        div.className = "rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 flex justify-between items-center";
        div.innerHTML = `
            <div class="flex-1">
                <p class="font-semibold text-sm leading-5">${item.nombre}</p>
                <p class="text-xs text-zinc-400 mt-1">$${item.precio} x ${item.cantidad} = <span class="text-zinc-200 font-medium">$${item.precio * item.cantidad}</span></p>
            </div>
            <div class="flex items-center gap-2 ml-2">
                <button id="dec_${item.id}" class="h-8 w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-zinc-300">-</button>
                <span class="w-4 text-center text-sm font-semibold">${item.cantidad}</span>
                <button id="inc_${item.id}" class="h-8 w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-bold text-zinc-300">+</button>
                <button id="del_${item.id}" class="h-8 w-8 rounded-lg bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center ml-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        listaCarrito.appendChild(div);

        document.querySelector(`#dec_${item.id}`).addEventListener("click", () => modificarCantidad(item.id, -1));
        document.querySelector(`#inc_${item.id}`).addEventListener("click", () => modificarCantidad(item.id, 1));
        document.querySelector(`#del_${item.id}`).addEventListener("click", () => eliminarDelCarrito(item.id));
    });
};

formCliente.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = inputCliente.value.trim();
    if (nombre.length >= 2) {
        cliente = nombre;
        clienteActual.textContent = cliente;
        guardarDatos();
        mostrarToast("Cliente actualizado", "#34d399");
    }
});

checkDescuento.addEventListener("change", actualizarUI);

btnVaciar.addEventListener("click", () => {
    if (carrito.length === 0) return;
    
    Swal.fire({
        title: '¿Cancelar orden?',
        text: "Se eliminarán todos los productos del carrito.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f43f5e',
        cancelButtonColor: '#3f3f46',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'Volver',
        background: '#18181b',
        color: '#f4f4f5'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            checkDescuento.checked = false;
            actualizarUI();
            mostrarToast("Orden cancelada", "#f43f5e");
        }
    });
});

btnFinalizar.addEventListener("click", () => {
    if (carrito.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Orden vacía',
            text: 'Agrega productos al carrito antes de finalizar la venta.',
            background: '#18181b',
            color: '#f4f4f5',
            confirmButtonColor: '#fbbf24'
        });
        return;
    }

    const totales = calcularTotales();
    let resumenHtml = `<div class="text-left text-sm space-y-2 mt-4"><p><strong>Cliente:</strong> ${cliente}</p><ul class="list-disc pl-5">`;
    carrito.forEach(item => resumenHtml += `<li>${item.cantidad}x ${item.nombre} ($${item.precio * item.cantidad})</li>`);
    resumenHtml += `</ul><hr class="border-zinc-700 my-2"><p class="text-lg"><strong>Total a pagar: $${Math.round(totales.totalFinal)}</strong></p></div>`;

    Swal.fire({
        title: 'Confirmar Venta',
        html: resumenHtml,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#fbbf24',
        cancelButtonColor: '#3f3f46',
        confirmButtonText: 'Aprobar Pago',
        cancelButtonText: 'Modificar',
        background: '#18181b',
        color: '#f4f4f5'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Procesando pago...',
                html: 'Por favor espere un momento.',
                allowOutsideClick: false,
                background: '#18181b',
                color: '#f4f4f5',
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            setTimeout(() => {
                Swal.fire({
                    title: '¡Venta Exitosa!',
                    text: 'La orden ha sido procesada correctamente.',
                    icon: 'success',
                    background: '#18181b',
                    color: '#f4f4f5',
                    confirmButtonColor: '#fbbf24'
                });
                carrito = [];
                checkDescuento.checked = false;
                actualizarUI();
            }, 2000);
        }
    });
});

document.addEventListener("DOMContentLoaded", inicializarApp);
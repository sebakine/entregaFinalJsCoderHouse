var STORAGE_CARRITO = "carrito_cafeteria_v2";
var STORAGE_CLIENTE = "cliente_cafeteria_v2";

var productos = [
  { id: 1, nombre: "Café Americano", precio: 2000, img: "img/close-up-view-brown-coffee-seeds-with-coffee-dark.jpg", desc: "Tu café clásico, suave y directo." },
  { id: 2, nombre: "Café Latte", precio: 2500, img: "img/cup-cappuccino-with-latte-art-cinnamon-sticks-rustic-surface.jpg", desc: "Cremoso, con leche vaporizada." },
  { id: 3, nombre: "Brownie", precio: 1800, img: "img/chocolate-brownie-cake-piece-stack-plate-homemade-pastries.jpg", desc: "Chocolate intenso, perfecto con café." }
];

var carrito = [];
var cliente = "";

// DOM
var listaProductos = document.querySelector("#listaProductos");
var listaCarrito = document.querySelector("#listaCarrito");

var totalSpan = document.querySelector("#total");
var totalFinalSpan = document.querySelector("#totalFinal");
var contadorItems = document.querySelector("#contadorItems");

var checkDescuento = document.querySelector("#checkDescuento");
var msg = document.querySelector("#msg");
var resumen = document.querySelector("#resumen");

var formCliente = document.querySelector("#formCliente");
var inputCliente = document.querySelector("#inputCliente");
var msgCliente = document.querySelector("#msgCliente");
var clienteActual = document.querySelector("#clienteActual");

var btnGuardar = document.querySelector("#btnGuardar");
var btnVaciar = document.querySelector("#btnVaciar");
var btnFinalizar = document.querySelector("#btnFinalizar");

// mensajes
function setMsg(texto) {
  msg.textContent = texto;
  if (texto !== "") {
    setTimeout(function () { msg.textContent = ""; }, 2200);
  }
}

function setMsgCliente(texto) {
  msgCliente.textContent = texto;
  if (texto !== "") {
    setTimeout(function () { msgCliente.textContent = ""; }, 2200);
  }
}

// lógica
function buscarEnCarrito(idProducto) {
  var encontrado = null;
  for (var item of carrito) {
    if (item.id === idProducto) {
      encontrado = item;
    }
  }
  return encontrado;
}

function agregarAlCarrito(producto) {
  var existe = buscarEnCarrito(producto.id);

  if (existe !== null) {
    existe.cantidad = existe.cantidad + 1;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1
    });
  }
}

function eliminarDelCarrito(idProducto) {
  carrito = carrito.filter(function (item) {
    return item.id !== idProducto;
  });
}

function cambiarCantidad(idProducto, delta) {
  var item = buscarEnCarrito(idProducto);
  if (item === null) return;

  item.cantidad = item.cantidad + delta;
  if (item.cantidad < 1) item.cantidad = 1;
}

function calcularTotalCarrito() {
  var total = carrito.reduce(function (acum, item) {
    return acum + (item.precio * item.cantidad);
  }, 0);

  return total;
}

function aplicarDescuento(total, activo) {
  if (activo === true) return total * 0.9;
  return total;
}

// render
function renderProductos() {
  listaProductos.innerHTML = "";

  productos.forEach(function (p) {
    var card = document.createElement("div");
    card.className = "rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden";

    card.innerHTML =
      '<img src="' + p.img + '" alt="' + p.nombre + '" class="h-44 w-full object-cover" />' +
      '<div class="p-4">' +
        '<h3 class="text-lg font-semibold">' + p.nombre + '</h3>' +
        '<p class="text-sm text-zinc-400 mt-1">' + p.desc + '</p>' +
        '<div class="mt-4 flex items-center justify-between">' +
          '<span class="font-semibold">$' + p.precio + '</span>' +
          '<button type="button" id="add_' + p.id + '" class="rounded-xl bg-amber-400 text-zinc-950 font-semibold px-4 py-2 hover:bg-amber-300">Agregar</button>' +
        '</div>' +
      '</div>';

    listaProductos.appendChild(card);
  });

  productos.forEach(function (p) {
    var btn = document.querySelector("#add_" + p.id);
    btn.addEventListener("click", function () {
      agregarAlCarrito(p);
      renderCarrito();
      renderTotales();
      guardarCarrito();
      setMsg("Agregado al carrito.");
    });
  });
}

function renderCarrito() {
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    listaCarrito.innerHTML = '<p class="text-sm text-zinc-400">Tu carrito está vacío.</p>';
    contadorItems.textContent = "0";
    return;
  }

  var count = 0;

  carrito.forEach(function (item) {
    count = count + item.cantidad;

    var row = document.createElement("div");
    row.className = "rounded-xl border border-zinc-800 bg-zinc-950/40 p-3";

    row.innerHTML =
      '<div class="flex items-start justify-between gap-3">' +
        '<div>' +
          '<p class="font-semibold leading-5">' + item.nombre + '</p>' +
          '<p class="text-xs text-zinc-400 mt-1">$' + item.precio + ' · Cantidad: ' + item.cantidad + '</p>' +
          '<p class="text-xs text-zinc-400 mt-1">Subtotal: $' + (item.precio * item.cantidad) + '</p>' +
        '</div>' +
        '<button type="button" id="del_' + item.id + '" class="text-xs rounded-lg bg-rose-500 px-3 py-2 font-semibold hover:bg-rose-400">Eliminar</button>' +
      '</div>' +
      '<div class="mt-3 flex gap-2">' +
        '<button type="button" id="dec_' + item.id + '" class="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">-</button>' +
        '<button type="button" id="inc_' + item.id + '" class="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">+</button>' +
      '</div>';

    listaCarrito.appendChild(row);
  });

  contadorItems.textContent = String(count);

  carrito.forEach(function (item) {
    var btnInc = document.querySelector("#inc_" + item.id);
    var btnDec = document.querySelector("#dec_" + item.id);
    var btnDel = document.querySelector("#del_" + item.id);

    btnInc.addEventListener("click", function () {
      cambiarCantidad(item.id, 1);
      renderCarrito();
      renderTotales();
      guardarCarrito();
    });

    btnDec.addEventListener("click", function () {
      cambiarCantidad(item.id, -1);
      renderCarrito();
      renderTotales();
      guardarCarrito();
    });

    btnDel.addEventListener("click", function () {
      eliminarDelCarrito(item.id);
      renderCarrito();
      renderTotales();
      guardarCarrito();
      setMsg("Producto eliminado.");
    });
  });
}

function renderTotales() {
  var total = calcularTotalCarrito();
  totalSpan.textContent = String(total);

  var totalFinal = aplicarDescuento(total, checkDescuento.checked);
  totalFinalSpan.textContent = String(Math.round(totalFinal));
}

function renderResumen() {
  if (carrito.length === 0) {
    resumen.textContent = "No hay productos para finalizar.";
    return;
  }

  var total = calcularTotalCarrito();
  var totalFinal = aplicarDescuento(total, checkDescuento.checked);

  var html = "";
  html += "<strong>Resumen de compra</strong><br>";
  html += "Cliente: " + (cliente === "" ? "Sin nombre" : cliente) + "<br><br>";

  carrito.forEach(function (item) {
    html += "- " + item.nombre + " (" + item.cantidad + "u) = $" + (item.precio * item.cantidad) + "<br>";
  });

  html += "<br>Total: $" + total + "<br>";
  html += "Descuento: " + (checkDescuento.checked ? "Sí (10%)" : "No") + "<br>";
  html += "<strong>Total final: $" + String(Math.round(totalFinal)) + "</strong>";

  resumen.innerHTML = html;
}

// storage
function guardarCarrito() {
  localStorage.setItem(STORAGE_CARRITO, JSON.stringify(carrito));
}

function cargarCarrito() {
  var data = localStorage.getItem(STORAGE_CARRITO);
  if (data === null) {
    carrito = [];
    return;
  }
  carrito = JSON.parse(data);
}

function guardarCliente() {
  localStorage.setItem(STORAGE_CLIENTE, cliente);
}

function cargarCliente() {
  var data = localStorage.getItem(STORAGE_CLIENTE);
  if (data === null) {
    cliente = "";
    return;
  }
  cliente = data;
}

// eventos
formCliente.addEventListener("submit", function (e) {
  e.preventDefault();

  var nombre = inputCliente.value.trim();

  if (nombre === "" || nombre.length < 2) {
    setMsgCliente("Nombre inválido (mínimo 2 caracteres).");
    return;
  }

  cliente = nombre;
  guardarCliente();
  clienteActual.textContent = cliente;
  inputCliente.value = "";
  setMsgCliente("Nombre guardado.");
});

checkDescuento.addEventListener("change", function () {
  renderTotales();
});

btnGuardar.addEventListener("click", function () {
  guardarCarrito();
  setMsg("Carrito guardado.");
});

btnVaciar.addEventListener("click", function () {
  carrito = [];
  guardarCarrito();
  resumen.textContent = "";
  renderCarrito();
  renderTotales();
  setMsg("Carrito vaciado.");
});

btnFinalizar.addEventListener("click", function () {
  renderResumen();
});

// init
cargarCliente();
cargarCarrito();

clienteActual.textContent = (cliente === "" ? "Sin nombre" : cliente);

renderProductos();
renderCarrito();
renderTotales();

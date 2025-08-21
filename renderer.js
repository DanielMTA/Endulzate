const lista = document.getElementById("productos-lista");
const btnAgregar = document.getElementById("agregar-btn");

let editId = null;           // id que estamos editando (o null si agregamos)
let productosData = [];      // cache local de productos

// Cargar al inicio
refrescarTabla();

// Click en Agregar / Guardar
btnAgregar.addEventListener("click", () => {
  const nombre = document.getElementById("nombre").value.trim();
  const stock = parseInt(document.getElementById("stock").value, 10);
  const precioCompra = parseFloat(document.getElementById("precioCompra").value);
  const precioVenta = parseFloat(document.getElementById("precioVenta").value);

  if (!nombre || isNaN(stock) || isNaN(precioCompra) || isNaN(precioVenta)) {
    alert("Completa todos los campos con números válidos.");
    return;
  }

  if (editId === null) {
    // Nuevo
    window.api.agregarProducto(nombre, precioCompra, precioVenta, stock);
  } else {
    // Editar
    window.api.editarProducto(editId, nombre, precioCompra, precioVenta, stock);
    editId = null;
    btnAgregar.innerText = "➕ Agregar Producto";
  }

  // Después de guardar, refrescar y limpiar
  setTimeout(() => {
    refrescarTabla();
    limpiarFormulario();
  }, 300);
});

// Render de tabla
function renderTabla(productos) {
  lista.innerHTML = "";
  productos.forEach(p => {
    const compra = p.precioCompra ?? 0;
    const venta  = p.precioVenta  ?? 0;

    lista.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.nombre}</td>
        <td>${p.stock}</td>
        <td>${compra}</td>
        <td>${venta}</td>
        <td><button onclick="editar(${p.id})">✏️ Editar</button></td>
        <td><button onclick="eliminar(${p.id})">❌</button></td>
      </tr>
    `;
  });
}

// Cargar datos de un producto en el formulario
function editar(id) {
  const p = productosData.find(x => x.id === id);
  if (!p) return;

  document.getElementById("nombre").value = p.nombre ?? "";
  document.getElementById("stock").value = p.stock ?? 0;
  document.getElementById("precioCompra").value = p.precioCompra ?? 0;
  document.getElementById("precioVenta").value = p.precioVenta ?? 0;

  editId = id;
  btnAgregar.innerText = "💾 Guardar cambios";
}

// Eliminar
function eliminar(id) {
  window.api.eliminarProducto(id);
  setTimeout(refrescarTabla, 300);
}

// Helpers
function refrescarTabla() {
  window.api.obtenerProductos().then(data => {
    productosData = data || [];
    renderTabla(productosData);
  });
}

function limpiarFormulario() {
  document.getElementById("nombre").value = "";
  document.getElementById("stock").value = "";
  document.getElementById("precioCompra").value = "";
  document.getElementById("precioVenta").value = "";
}

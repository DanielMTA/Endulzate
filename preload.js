const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  obtenerProductos: () => ipcRenderer.invoke("obtener-productos"),
  agregarProducto: (nombre, precioCompra, precioVenta, stock) =>
    ipcRenderer.send("agregar-producto", { nombre, precioCompra, precioVenta, stock }),
  editarProducto: (id, nombre, precioCompra, precioVenta, stock) =>
    ipcRenderer.send("editar-producto", { id, nombre, precioCompra, precioVenta, stock }),
  eliminarProducto: (id) => ipcRenderer.send("eliminar-producto", id),
});

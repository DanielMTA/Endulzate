const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

let db;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  db = new sqlite3.Database("./db/database.sqlite", (err) => {
    if (err) {
      console.error("Error abriendo DB", err.message);
      return;
    }
    console.log("DB conectada correctamente ✅");

    // Crear tabla si no existe (con las columnas nuevas)
    db.run(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        stock INTEGER,
        precioCompra REAL,
        precioVenta REAL
      )
    `, (e) => {
      if (e) console.error("Error creando tabla:", e.message);
      // Migración: agregar columnas si la tabla vieja no las tenía
      db.all(`PRAGMA table_info(productos)`, (err2, rows) => {
        if (err2) return console.error("PRAGMA error:", err2.message);
        const cols = rows.map(r => r.name);
        if (!cols.includes("precioCompra")) {
          db.run(`ALTER TABLE productos ADD COLUMN precioCompra REAL DEFAULT 0`);
        }
        if (!cols.includes("precioVenta")) {
          db.run(`ALTER TABLE productos ADD COLUMN precioVenta REAL DEFAULT 0`);
        }
      });
    });
  });

  // INSERTAR
  ipcMain.on("agregar-producto", (event, p) => {
    db.run(
      `INSERT INTO productos (nombre, stock, precioCompra, precioVenta) VALUES (?, ?, ?, ?)`,
      [p.nombre, p.stock, p.precioCompra, p.precioVenta],
      (err) => {
        if (err) console.error("Error insertando producto:", err.message);
        else console.log("Producto agregado ✅");
      }
    );
  });

  // EDITAR
  ipcMain.on("editar-producto", (event, p) => {
    db.run(
      `UPDATE productos SET nombre = ?, stock = ?, precioCompra = ?, precioVenta = ? WHERE id = ?`,
      [p.nombre, p.stock, p.precioCompra, p.precioVenta, p.id],
      (err) => {
        if (err) console.error("Error editando producto:", err.message);
        else console.log(`Producto id=${p.id} editado ✅`);
      }
    );
  });

  // ELIMINAR
  ipcMain.on("eliminar-producto", (event, id) => {
    db.run(`DELETE FROM productos WHERE id = ?`, [id], (err) => {
      if (err) console.error("Error eliminando producto:", err.message);
      else console.log(`Producto id=${id} eliminado ✅`);
    });
  });

  // LISTAR
  ipcMain.handle("obtener-productos", () => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM productos`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  });

  createWindow();
});

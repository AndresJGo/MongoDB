const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");

// URI de conexión al servidor de MongoDB
const uri =
  "mongodb+srv://andres:hola123@cluster0.hfn0b5m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Nombre de la base de datos y colección
const dbName = "TecnologiasDisruptivas";
const collectionName = "TiendaElectronica";

const app = express();
const client = new MongoClient(uri);

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173", // Permite solicitudes desde el frontend
  })
);

// Abrir la conexión al cliente una vez
client
  .connect()
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1);
  });

app.get("/componentes", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Ejecutar la agregación
    const dbRes = await collection
      .aggregate([
        {
          $group: {
            _id: "$Componente", // Agrupa por el campo 'Componente'
            count: { $sum: 1 }, // Cuenta los documentos de cada grupo
          },
        },
      ])
      .toArray(); // Convierte el cursor en un arreglo

    // Responder con los datos al cliente
    res.json(dbRes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ocurrió un error al consultar la base de datos.");
  }
});

// Endpoint para visualizar componentes.
app.get("/componente/:componente", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const componente = req.params.componente;
    const result = await collection.find({ Componente: componente }).toArray();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ocurrió un error al consultar la base de datos.");
  }
});

const PORT = 3000;
app.listen(PORT, "192.168.100.220", () => {
  console.log(`Servidor funcionando en http://192.168.100.220:${PORT}`);
});

// Endpoint para crear componente
app.post("/crearComponente", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const newComponent = req.body; // Extrae los datos enviados desde el frontend

    console.log("Nuevo componente recibido:", newComponent);

    // Verificar si ya existe un componente con el mismo nombre y modelo
    const existingComponent = await collection.findOne({
      Componente: newComponent.Component,
      Modelo: newComponent.Model,
    });

    if (existingComponent) {
      return res.status(400).json({
        message: "El componente con este nombre y modelo ya está registrado.",
      });
    }

    // Extraccion del cuerpo de la peticion
    componentAppend = {
      Componente: req.body.Component,
      Modelo: req.body.Model,
      Costo: req.body.Price,
      Piezas: req.body.Number,
    };

    // Insertar el nuevo componente si no existe duplicado
    const result = await collection.insertOne(componentAppend);

    return res.status(200).json({
      message: "El componente se ha registrado",
    });
  } catch (error) {
    console.error("Error al insertar el componente:", error);
    res.status(500).send("Ocurrió un error al consultar la base de datos.");
  }
});

// Endpoint para borrar los datos
app.delete("/borrarComponente/:componente", async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const [componente, modelo] = req.params.componente.split("_");

    collection.deleteOne({ Componente: componente, Modelo: modelo });
    res.status(200).json({
      message: "Se ha eliminado el componente",
    });
  } catch (error) {
    console.error("Error al borrar componente:", error);
    res.status(500).send("Ocurrió un error al consultar la base de datos.");
  }
});

// Cierra la conexión al cliente al cerrar la aplicación
process.on("SIGINT", async () => {
  console.log("Cerrando conexión con MongoDB...");
  await client.close();
  process.exit(0);
});

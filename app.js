// Carregando modulos/dependencias
const express = require("express");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");

// CONFIGURAÇÕES
//body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
  })
);
app.set("view engine", "handlebars");

// Mongoose
mongoose
  .connect("mongodb://localhost/blogapp")
  .then(() => console.log("Connected!"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));
// Configuração da Public
app.use(express.static(path.join(__dirname, "public")));

// Rotas admin
app.use("/admin", admin);

// rotas principais
app.get("/", (req, res) => {
  res.send("rota principal");
});
app.get("/listadeposts", (req, res) => {
  res.send("lista de posts!");
});

// Outros
const PORT = 8081;
app.listen(PORT, () => {
  console.log("Servidor rodando!");
});

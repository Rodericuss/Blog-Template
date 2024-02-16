const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");

// Definindo as rotas
router.get("/", (req, res) => {
  res.render("admin/index");
});
router.get("/posts", (req, res) => {
  res.send("Paginas de cadastro de posts!");
});
router.get("/categorias", (req, res) => {
  res.render("admin/categorias");
});
router.get("/categorias/add", (req, res) => {
  res.render("admin/addcategorias");
});
router.post("/categorias/nova", (req, res) => {
  const novaCategoria = {
    nome: req.body.nome,
    slug: req.body.slug,
  };
console.log(novaCategoria)
  new Categoria(novaCategoria).save().then(() => {
    console.log("Categoria salva com sucesso!")
  }).catch((err) => {
    console.log(`Erro ao criar categoria: ${err}`)
  });

});
// exportando as rotas para o projeto
module.exports = router;

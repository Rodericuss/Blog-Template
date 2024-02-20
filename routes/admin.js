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
  // **logica para verificar e criar avisos de erro de cadastro de categoria
  var erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome da categoria é invalido!" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug da categoria é invalido!" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria é muito pequeno!" });
  }
  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    // criando uma nova categoria no banco
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };
    console.log(novaCategoria);
    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Sucesso ao salvar a nova categoria!");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash("error_msg","Erro ao salvar a nova categoria!")
        console.log(`Erro ao criar categoria: ${err}`);
      });
  }
});
// exportando as rotas para o projeto
module.exports = router;

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem")
const Postagem = mongoose.model("postagens")

// Definindo as rotas
router.get("/", (req, res) => {
  res.render("admin/index");
});
// listar as postagens
router.get("/postagens", (req, res) => {
  res.render("admin/postagens");
});
// formulario de postagem
router.get("/postagens/add", (req, res) => {
  Categoria.find().lean().then((categorias) => {
    res.render("admin/addpostagens", { categorias: categorias });
  })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin");
    });
});
// postar a postagem
router.post("/postagem/nova", (req, res) => {
  // **logica para verificar e criar avisos de erro de cadastro de categoria
  var erros = [];
  if (
    !req.body.titulo ||
    typeof req.body.titulo == undefined ||
    req.body.titulo == null
  ) {
    erros.push({ texto: "Título é invalido!" });
  }
  if (req.body.titulo.length < 2) {
    erros.push({ texto: "Título é muito pequeno!" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug da categoria é invalido!" });
  } if (
    !req.body.descricao ||
    typeof req.body.descricao == undefined ||
    req.body.descricao == null
  ) {
    erros.push({ texto: "Descrição é invalida!" });
  } if (
    !req.body.conteudo ||
    typeof req.body.conteudo == undefined ||
    req.body.conteudo == null
  ) {
    erros.push({ texto: "Conteudo é invalido!" });
  } if (
    req.body.categoria == "0"
  ) {
    erros.push({ texto: "Categoria inválida, registre uma categoria" })
  }
  if (erros.length > 0) {
    res.render("admin/addpostagens", { erros: erros });
  } else {

    // criando uma nova postagem no banco
    const novaPostagem = {
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria
    };
    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Sucesso ao salvar a nova postagem!");
        res.redirect("/admin/addpostagens");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao salvar a nova postagem!");
        res.redirect("/admin/addpostagens");
        console.log(`Erro ao criar postagem: ${err}`);
      });
  }
});
// lista categorias
router.get("/categorias", (req, res) => {
  Categoria.find().sort({ date: "desc" })
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
      console.log(categorias);
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias");
      res.redirect("/admin");
    });
});
// formulario para adicionar categoria
router.get("/categorias/add", (req, res) => {
  res.render("admin/addcategorias");
});
// posta a categoria nova
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
        req.flash("error_msg", "Erro ao salvar a nova categoria!");
        console.log(`Erro ao criar categoria: ${err}`);
      });
  }
});

router.get("/categorias/edit/:id", (req, res) => {
  Categoria.findOne({ _id: req.params.id }).then((categoria) => {
    res.render("admin/editcategorias", { categoria: categoria });
  }).catch((err) => {
    req.flash("error_msg", "esta caegoria não existe");
    res.redirect("/admin/categorias");
  })
}
);


router.post("/categorias/edit", (req, res) => {
  // **logica para verificar e criar avisos de erro de edição de categoria
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
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
      categoria.nome = req.body.nome
      categoria.slug = req.body.slug

      categoria.save()
        .then(() => {
          req.flash("success_msg", "Sucesso ao salvar a edição categoria!");
          res.redirect("/admin/categorias");
        })
        .catch((err) => {
          req.flash("error_msg", "Erro ao salvar a edição categoria!");
          console.log(`Erro ao criar categoria: ${err}`);
        });

    })
      .catch((err) => {
        req.flash("error_msg", "Erro ao salvar a edição categoria!");
        console.log(`Erro ao criar categoria: ${err}`);
      })
  }
})

router.post("/categorias/deletar", (req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Sucesso ao deletar a categoria!");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao deletar a categoria!");
      res.redirect("/admin/categorias");
    });
})

// exportando as rotas para o projeto
module.exports = router;

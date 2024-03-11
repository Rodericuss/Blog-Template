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
  Postagem.find().lean().populate("categoria").sort({ date: "desc" }).then((postagens) => {
    res.render("admin/postagens", { postagens: postagens })
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as postagens")
    res.redirect("/admin")
  })
})
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
  // **logica para verificar e criar avisos de erro de cadastro de postagem
  var errosPost = [];
  if (
    !req.body.titulo ||
    typeof req.body.titulo == undefined ||
    req.body.titulo == null
  ) {
    errosPost.push({ texto: "Título é invalido!" });
  }
  if (req.body.titulo.length < 2) {
    errosPost.push({ texto: "Título é muito pequeno!" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    errosPost.push({ texto: "Slug da postagem é invalido!" });
  } if (
    !req.body.descricao ||
    typeof req.body.descricao == undefined ||
    req.body.descricao == null
  ) {
    errosPost.push({ texto: "Descrição é invalida!" });
  } if (
    !req.body.conteudo ||
    typeof req.body.conteudo == undefined ||
    req.body.conteudo == null
  ) {
    errosPost.push({ texto: "Conteudo é invalido!" });
  } if (
    req.body.categoria == "0"
  ) {
    errosPost.push({ texto: "Categoria inválida, registre uma categoria" })
  }
  if (errosPost.length > 0) {
    Categoria.find().lean().then((categorias) => {
      res.render("admin/addpostagens", { errosPost: errosPost, categorias: categorias });
    })
  } else {

    // criando uma nova postagem no banco
    const novaPostagem = {
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      date: new Date
    };
    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Sucesso ao salvar a nova postagem!");
        res.redirect("/admin/postagens");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao salvar a nova postagem!");
        res.redirect("/admin/postagens/add");
        console.log(`Erro ao criar postagem: ${err}`);
      });
  }
});
// Formulario de edição de postagem 
router.get("/postagens/edit/:id", (req, res) => {
  Postagem.findOne({ _id: req.params.id }).then((postagem) => {
    Categoria.find().lean().then((categorias) => {
      res.render("admin/editpostagens", { postagem: postagem, categorias: categorias });
    })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário");
        res.redirect("/admin/postagens");
      })
  })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin/postagens");
    })
})
// Rota para editar a postagem
router.post("/postagens/edit", (req, res) => {
  // **logica para verificar e criar avisos de erro de edição de postagens
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
    erros.push({ texto: "Slug da postagem é invalido!" });
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
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {
      Categoria.find().lean().then((categorias) => {
        res.render("admin/editpostagens", { erros: erros, postagem: postagem, categorias: categorias });
      })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao carregar o formulário");
          res.redirect("/admin/postagens");
        })
    })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário");
        res.redirect("/admin/postagens");
      })
  } else {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {
      console.log(postagem)
      postagem.titulo = req.body.titulo
      postagem.slug = req.body.slug
      postagem.descricao = req.body.descricao
      postagem.conteudo = req.body.conteudo
      postagem.categoria = req.body.categoria
      postagem.date = new Date
      postagem.save()
        .then(() => {
          req.flash("success_msg", "Sucesso ao salvar a edição da postagem!");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          req.flash("error_msg", "Erro ao salvar a edição postagem!");
          console.log(`Erro ao criar postagem: ${err}`);
        });

    })
      .catch((err) => {
        req.flash("error_msg", "Erro ao salvar a edição postagem!");
        console.log(`Erro ao editar postagem: ${err}`);
      })
  }
})
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
    req.flash("error_msg", "esta categoria não existe");
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
    res.render("admin/editcategorias", { erros: erros });
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
          console.log(`Erro ao editar categoria: ${err}`);
        });

    })
      .catch((err) => {
        req.flash("error_msg", "Erro ao salvar a edição categoria!");
        console.log(`Erro ao editar categoria: ${err}`);
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

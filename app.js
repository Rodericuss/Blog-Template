// Carregando modulos/dependencias
const express = require("express");
const bodyParser = require("body-parser");
const handlebars = require("express-handlebars");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)
// CONFIGURAÇÕES

// Criando Sessão
app.use(
  session({
    secret: "blogApp",
    resave: true,
    saveUninitialized: true,
  })
);
// passport criando sessao
app.use(passport.initialize())
app.use(passport.session())

// configurando flash
app.use(flash());

// criando MiddleWare
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
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
// Rotas usuarios
app.use("/usuario", usuarios);


// rotas principais
app.get("/", (req, res) => {
  Postagem.find().lean().populate("categoria").sort({ data: "desc" }).then((postagens) => {
    res.render("index", { postagens: postagens });
  })
    .catch((err) => {
      console.log(`erro acontecendo: ${err}`)
      req.flash("error_msg", "Houve um erro ao carregar a pagina!");
      res.redirect("/404");
    });
});
// rota de postagem
app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug }).then((postagem) => {
    if (postagem) {
      res.render("postagem/index", { postagem: postagem })
    } else {
      res.flash("error_msg", "Esta postagem não existe")
      res.redirect("/")
    }
  }).catch((err) => {
    req.flash("error_msg", "Esta postagem não existe")
    res.redirect("/")
  })
})
// rosta de categorias
app.get("/categorias", (req, res) => {
  Categoria.find().lean().then((categorias) => {
    res.render("categorias/index", { categorias: categorias })
  })
    .catch(() => {
      req.flash("error_msg", "Houve um erro ao listar as categorias")
      res.redirect("/");
    })
});
// rota de acesso à alguma categoria
app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
    if (categoria) {
      Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {
        res.render("categorias/postagens", { postagens: postagens, categoria: categoria })
      }).catch((err) => {
        req.flash("error_msg", `houve um erro ao buscar a categoria!${err}`)
        res.redirect("/")
      })
    } else {
      req.flash("error_msg", "Esta categoria não existe")
      res.redirect("/")
    }
  }).catch((err) => {
    req.flash("error_msg", "Esta categoria não existe")
    res.redirect("/")
  })
});
// rota de erro
app.get("/404", (req, res) => {
  res.send("Erro 404! :D");
});

// Outros
const PORT = 8081;
app.listen(PORT, () => {
  console.log("Servidor rodando!");
});

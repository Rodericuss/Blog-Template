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
const { Console } = require("console");
require("./models/Postagem")
const Postagem = mongoose.model("postagens")

// CONFIGURAÇÕES

// Criando Sessão
app.use(
  session({
    secret: "blogApp",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// criando MiddleWare
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
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
app.get("/404", (req, res) => {
  res.send("Erro 404! :D");
});

// Outros
const PORT = 8081;
app.listen(PORT, () => {
  console.log("Servidor rodando!");
});

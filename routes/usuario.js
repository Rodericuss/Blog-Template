const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios')
const bcrypt = require("bcryptjs")
const passport = require('passport')

// NOTE: Função para renderizar a pagina de registro
router.get('/registro', (req, res) => {
  res.render("usuarios/registro")
})

// NOTE: Função para registrar um usuario
router.post('/registro', (req, res) => {
  var erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome é invalido!" });
  }
  if (
    !req.body.email ||
    typeof req.body.email == undefined ||
    req.body.email == null
  ) {
    erros.push({ texto: "Email é invalido!" });
  }
  if (
    !req.body.senha ||
    typeof req.body.senha == undefined ||
    req.body.senha == null
  ) {
    erros.push({ texto: "Senha é invalida!" });
  }
  if (
    req.body.senha.length < 6
  ) {
    erros.push({ texto: "Senha é muito curta, digite ao menos seis digitos!" });
  }
  if (
    req.body.senha !== req.body.senha2
  ) {
    erros.push({ texto: "Senha não estão iguais!" });
  } if (erros.length > 0) {
    res.render("usuarios/registro", { erros: erros });
  } else {
    Usuario.findOne({ email: req.body.email }).then((usuarios) => {
      if (usuarios) {
        req.flash("error_msg", "Já existe uma conta com esse email no nosso sistema!")
        res.redirect("/usuario/registro")
      } else {
        // criando novo usuario
        const novoUsuario = new Usuario({
          nome: req.body.nome,
          email: req.body.email,
          senha: req.body.senha,
        });
        bcrypt.genSalt(10, (erro, salt) => {
          bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
            if (erro) {
              req.flash("error_msg", "Houve um erro interno")
              res.redirect("/")
            }
            novoUsuario.senha = hash
            novoUsuario
              .save()
              .then(() => {
                req.flash("success_msg", "Sucesso ao salvar o novo usuario!");
                res.redirect("/");
              })
              .catch((err) => {
                req.flash("error_msg", "Erro ao salvar o novo usuario!");
                res.redirect("/usuario/registro");
                console.log(`Erro ao criar postagem: ${err}`);
              });
          })
        })
      }
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno")
      res.redirect("/")
    })
  }
})
// NOTE: Função para renderizar a pagina de login
router.get("/login", (req, res) => {
  res.render("usuarios/login")
})
// NOTE: Função para logar o usuario em uma sessão
router.post("/login", (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/usuario/login',
    failureFlash: true
  })(req, res, next)
})
// NOTE: Função para deslogar o usuario de uma sessão
router.get("/logout", (req, res) => {
  req.logout((err) => {
    req.flash('success_msg', "Deslogado com sucesso!")
    res.redirect("/")
  })
})
module.exports = router;

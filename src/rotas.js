const express = require('express')
const { cadastrarUsuario, detalharUsuarioLogado, atualizarUsuarioLogado } = require('./controladores/usuario')
const { loginUsuario } = require('./controladores/login')
const { listarCategorias } = require('./controladores/categoria')
const { listarTransacoes, detalharTransacao, cadastrarTransacao, atualizarTransacao, deletarTransacao, extratoTransacoes } = require('./controladores/transacao')
const { validarAutenticacao } = require('./intermediarios/autenticacao')

const rotas = express()


rotas.post('/usuario', cadastrarUsuario)

rotas.post('/login', loginUsuario)

rotas.use(validarAutenticacao)

rotas.get('/usuario', detalharUsuarioLogado)
rotas.put('/usuario', atualizarUsuarioLogado)

rotas.get('/categoria', listarCategorias)

rotas.get('/transacao', listarTransacoes)
rotas.get('/transacao/extrato', extratoTransacoes)
rotas.get('/transacao/:id', detalharTransacao)
rotas.post('/transacao', cadastrarTransacao)
rotas.put('/transacao/:id', atualizarTransacao)
rotas.delete('/transacao/:id', deletarTransacao)


module.exports = rotas
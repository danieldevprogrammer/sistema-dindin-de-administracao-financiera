const express = require('express')
const rotas = require('./rotas')
require('dotenv').config()

const app = express()

app.use(express.json())

app.use(rotas)

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${process.env.PORT}`)
})
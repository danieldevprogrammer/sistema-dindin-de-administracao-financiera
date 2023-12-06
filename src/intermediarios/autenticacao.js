const jwt = require('jsonwebtoken')
const chaveJwt = require('../chaveJwt')

const validarAutenticacao = (req, res, next) => {
    const { authorization } = req.headers

    try {
        //Validar se o token foi enviado no header da requisição (Bearer Token)
        if (!authorization) {
            return res.status(400).json({ mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.' })
        }

        const token = authorization.split(' ')[1]

        //Verificar se o token é válido
        const verificacaoToken = jwt.verify(token, chaveJwt)

        //Consultar usuário no banco de dados pelo id contido no token informado
        const { iat, exp, ...usuarioLogado } = verificacaoToken
        req.usuario = usuarioLogado

        next()
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro na autenticação do usuário.' })
    }
}

module.exports = {
    validarAutenticacao
}
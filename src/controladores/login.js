const bcrypt = require('bcrypt')
const conexao = require('../bancodedados/conexao')
const jwt = require('jsonwebtoken')
const chaveJwt = require('../chaveJwt')

const loginUsuario = async (req, res) => {
    const { email, senha } = req.body

    try {
        //Validar os campos obrigatórios: email, senha.
        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' })
        }

        //Verificar se o e-mail existe
        const usuarioExistente = await conexao.query(
            'select * from usuarios where email = $1',
            [email]
        )

        if (usuarioExistente.rowCount === 0) {
            return res.status(400).json({ mensagem: '"Usuário e/ou senha inválido(s).' })
        }

        //Validar e-mail e senha
        const senhaValida = await bcrypt.compare(senha, usuarioExistente.rows[0].senha)

        if (!senhaValida) {
            return res.status(400).json({ mensagem: '"Usuário e/ou senha inválido(s).' })
        }

        const { senha: senhaCriptografada, ...usuarioLogado } = usuarioExistente.rows[0]

        //Criar token de autenticação com id do usuário
        const token = jwt.sign(usuarioLogado, chaveJwt, {
            expiresIn: '8h',
        })

        return res.status(200).json({ usuario: usuarioLogado, token })
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao efetuar login do usuário.' })
    }
}


module.exports = {
    loginUsuario
}
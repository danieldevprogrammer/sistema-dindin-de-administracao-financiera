const bcrypt = require('bcrypt')
const conexao = require('../bancodedados/conexao')

const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body

    try {
        //Validar os campos obrigatórios: nome, email, senha.
        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' })
        }

        //Validar se o e-mail informado já existe
        const usuarioExistente = await conexao.query(
            'select * from usuarios where email = $1',
            [email]
        )

        if (usuarioExistente.rowCount > 0) {
            return res.status(400).json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado..' })
        }

        //Criptografar a senha antes de persistir no banco de dados
        const senhaCriptografada = await bcrypt.hash(senha, 10)

        //Cadastrar o usuário no banco de dados
        const novoUsuario = await conexao.query(
            'insert into usuarios (nome, email, senha) values ($1, $2, $3) returning id, nome, email',
            [nome, email, senhaCriptografada]
        )

        return res.status(201).json(novoUsuario.rows[0])
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário.' })
    }
}


const detalharUsuarioLogado = (req, res) => {

    try {
        const usuario = req.usuario

        return res.status(200).json(usuario)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao detalhar dados do usuário logado.' })
    }

}

const atualizarUsuarioLogado = async (req, res) => {
    const { nome, email, senha } = req.body
    const usuario_id = req.usuario.id

    try {
        //Validar os campos obrigatórios: nome, email, senha
        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' })
        }

        //Validar se o novo e-mail já existe no banco de dados para outro usuário
        const usuarioExistente = await conexao.query(
            'select * from usuarios where email = $1',
            [email]
        )

        if (usuarioExistente.rowCount > 0) {
            return res.status(400).json({ mensagem: 'O e-mail informado já está sendo utilizado por outro usuário.' })
        }

        //Criptografar a senha antes de salvar no banco de dados
        const senhaCriptografada = await bcrypt.hash(senha, 10)

        //Atualizar as informações do usuário no banco de dados
        const atualizarUsuario = await conexao.query(
            'update usuarios set nome = $1, email = $2, senha = $3 where id = $4',
            [nome, email, senhaCriptografada, usuario_id]
        )

        if (atualizarUsuario.rowCount === 1) {
            return res.status(204).json();
        } else {
            return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
        }
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao atualizar os dados do usúario logado.' })
    }
}







module.exports = {
    cadastrarUsuario,
    detalharUsuarioLogado,
    atualizarUsuarioLogado
}
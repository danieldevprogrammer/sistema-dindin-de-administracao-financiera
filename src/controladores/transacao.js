const conexao = require('../bancodedados/conexao')

const listarTransacoes = async (req, res) => {
    //O usuário deverá ser identificado através do ID presente no token de validação.
    const usuario_id = req.usuario.id

    try {
        //Buscaando todas as transações associadas ao usuário logado.
        const buscarTransacoes = await conexao.query(
            'select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome ' +
            'from transacoes t ' +
            'join categorias c on t.categoria_id = c.id ' +
            'where t.usuario_id = $1',
            [usuario_id]
        )

        //O endpoint deverá responder com um array de todas as transações associadas ao usuário.
        //Caso não exista nenhuma transação associada ao usuário deverá responder com array vazio.
        const listaDeTransacoes = buscarTransacoes.rows

        return res.status(200).json(listaDeTransacoes)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao listar as transações.' })
    }
}

const detalharTransacao = async (req, res) => {
    const { id } = req.params
    const usuario_id = req.usuario.id

    try {
        //Validar se existe transação para o id enviado como parâmetro na rota e se esta transação pertence ao usuário logado.
        const buscarTransacao = await conexao.query(
            'select t.id, t.tipo, t.descricao, t.valor, t.data, t.usuario_id, t.categoria_id, c.descricao as categoria_nome ' +
            'from transacoes t ' +
            'join categorias c on t.categoria_id = c.id ' +
            'where t.id = $1 and t.usuario_id = $2',
            [id, usuario_id]
        )

        if (buscarTransacao.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada.' })
        }

        const transacaoDetalhada = buscarTransacao.rows[0]

        return res.status(200).json(transacaoDetalhada)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao detalhar as transações.' })
    }
}

const cadastrarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body
    const usuario_id = req.usuario.id

    try {
        //Validar os campos obrigatórios: descricao, valor, data, categoria_id, tipo.
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Preencha todos os campos obrigatórios.' })
        }

        //Validar se existe categoria para o id enviado no corpo (body) da requisição.
        const categoriaExistente = await conexao.query(
            'select * from categorias where id = $1',
            [categoria_id]
        )

        if (categoriaExistente.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada.' })
        }

        //Validar se o tipo enviado no corpo (body) da requisição corresponde a palavra entrada ou saida, exatamente como descrito.
        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({ mensagem: 'O tipo deve ser "entrada" ou "saida".' })
        }

        //Cadastrar a transação associada ao usuário logado.
        const cadastroDaTransacao = await conexao.query(
            'insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo)' +
            'values ($1, $2, $3, $4, $5, $6) returning *',
            [descricao, valor, data, categoria_id, usuario_id, tipo]
        )

        const transacaoCadastrada = cadastroDaTransacao.rows[0]

        //Obter o nome da categoria.
        const nomeCategoria = categoriaExistente.rows[0].descricao

        const respostaTransacaoCadastrada = {
            id: transacaoCadastrada.id,
            tipo: transacaoCadastrada.tipo,
            descricao: transacaoCadastrada.descricao,
            valor: transacaoCadastrada.valor,
            data: transacaoCadastrada.data,
            usuario_id: transacaoCadastrada.usuario_id,
            categoria_id: transacaoCadastrada.categoria_id,
            categoria_nome: nomeCategoria,
        }

        return res.status(201).json(respostaTransacaoCadastrada)
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao cadastrar transação.' })
    }
}

const atualizarTransacao = async (req, res) => {
    const { id } = req.params
    const { descricao, valor, data, categoria_id, tipo } = req.body
    const usuario_id = req.usuario.id

    try {
        //Validar os campos obrigatórios: descricao, valor, data, categoria_id, tipo.
        if (!descricao || !valor || !data || !categoria_id || !tipo) {
            return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
        }

        //Validar se existe transação para o id enviado como parâmetro na rota e se esta transação pertence ao usuário logado.
        const buscarTransacaoExistente = await conexao.query(
            'select * from transacoes where id = $1 and usuario_id = $2',
            [id, usuario_id]
        )

        if (buscarTransacaoExistente.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Transação não encontrada ou não pertence ao usuário logado.' })
        }

        //Validar se existe categoria para o id enviado no corpo (body) da requisição.
        const categoriaExistente = await conexao.query(
            'select * from categorias where id = $1',
            [categoria_id]
        )

        if (categoriaExistente.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Categoria não encontrada.' })
        }

        //Validar se o tipo enviado no corpo (body) da requisição corresponde a palavra entrada ou saida, exatamente como descrito.
        if (tipo !== 'entrada' && tipo !== 'saida') {
            return res.status(400).json({ mensagem: 'O tipo deve ser "entrada" ou "saida".' })
        }

        //Atualizar a transação no banco de dados.
        const atualizandoTransacao = await conexao.query(
            'update transacoes set descricao = $1, valor = $2, data = $3,' +
            'categoria_id = $4, tipo = $5 where id=$6' +
            'and usuario_id = $7 returning *',
            [descricao, valor, data, categoria_id, tipo, id, usuario_id]
        )

        return res.status(200).json()
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao atualizar a trasação.' })
    }
}

const deletarTransacao = async (req, res) => {
    const { id } = req.params
    const usuario_id = req.usuario.id

    try {
        //Validar se existe transação para o id enviado como parâmetro na rota e se esta transação pertence ao usuário logado.
        const buscarTransacaoExistente = await conexao.query(
            'select * from transacoes where id = $1 and usuario_id = $2',
            [id, usuario_id]
        )

        if (buscarTransacaoExistente.rowCount === 0) {
            return res.status(400).json({ mensagem: 'Transação não encontrada ou não pertence ao usuário logado.' })
        }

        //Excluir a transação no banco de dados.
        const deletandoTransacao = await conexao.query(
            'delete from transacoes where id = $1 and usuario_id = $2',
            [id, usuario_id]
        )

        return res.status(204).json()
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao deletar a trasação.' })
    }
}

const extratoTransacoes = async (req, res) => {
    const usuario_id = req.usuario.id

    try {
        //Soma de todas as transações do tipo entrada.
        const somaTotalEntradas = await conexao.query(
            'select coalesce(sum(valor), 0) from transacoes where usuario_id = $1 and tipo = $2',
            [usuario_id, 'entrada']
        )

        //Soma de todas as transações do tipo saida.
        const somaTotalSaidas = await conexao.query(
            'select coalesce(sum(valor), 0) from transacoes where usuario_id = $1 and tipo = $2',
            [usuario_id, 'saida']
        )

        //Resultado da soma de todas entradas e toda as saídas.
        const somaEntradas = somaTotalEntradas.rows[0].coalesce
        const somaSaidas = somaTotalSaidas.rows[0].coalesce

        return res.status(200).json({ entrada: Number(somaEntradas), saida: Number(somaSaidas) })
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao obter o extrato das transações.' })
    }
}

module.exports = {
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    atualizarTransacao,
    deletarTransacao,
    extratoTransacoes
}
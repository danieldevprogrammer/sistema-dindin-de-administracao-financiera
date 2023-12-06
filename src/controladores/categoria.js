const conexao = require('../bancodedados/conexao')

const listarCategorias = async (req, res) => {
    //O endpoint deverá responder com um array de todas as categorias cadastradas.
    try {
        //Listar todas as categorias cadastradas.
        const listarCategorias = await conexao.query(
            'select * from categorias'
        );
        const categorias = listarCategorias.rows;


        res.status(200).json(categorias);
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao listar categorias.' })
    }
}

module.exports = {
    listarCategorias
}
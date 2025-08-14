const PagamentoAvulsoModel = require('../model/pagamentoAvulsoModel');

class PagamentoAvulsoController {

    async listar(req, res) {
        let pagamentoAvulso = new PagamentoAvulsoModel();
        let lista = await pagamentoAvulso.listar();
        let listaRetorno = [];
        for (let i = 0; i < lista.length; i++) {
            listaRetorno.push(lista[i].toJSON());
        }
        res.status(200).json(listaRetorno);
    }

    async obter(req, res) {
        if (req.params.idPagamentoAvulso > 0) {
            let pagamentoAvulso = new PagamentoAvulsoModel();
            pagamentoAvulso = await pagamentoAvulso.obter(req.params.idPagamentoAvulso);
            if (pagamentoAvulso != null) {
                res.status(200).json(pagamentoAvulso);
            } else {
                res.status(500).json({ message: "Erro ao obter pagamentoAvulso." });
            }
        } else {
            res.status(400).json({ message: "Parâmetros inválidos." });
        }
    }

    async obterPorContrato(req, res) {
        if (req.params.idContrato > 0) {
            let pagamentoAvulso = new PagamentoAvulsoModel();
            pagamentoAvulso = await pagamentoAvulso.obterPorContrato(req.params.idContrato);
            if (pagamentoAvulso != null) {
                res.status(200).json(pagamentoAvulso);
            } else {
                res.status(500).json({ message: "Erro ao obter pagamentoAvulso." });
            }
        } else {
            res.status(400).json({ message: "Parâmetros inválidos." });
        }
    }

    async gravar(req, res) {
        if (Object.keys(req.body).length > 0) {
            let pagamentoAvulso = new PagamentoAvulsoModel();

            pagamentoAvulso.idPagamento = 0;
            pagamentoAvulso.valorPagamento = req.body.valorPagamento;
            pagamentoAvulso.dataPagamento = req.body.dataPagamento;
            pagamentoAvulso.pago = req.body.pago;
            pagamentoAvulso.idContrato = req.body.idContrato;
            let ok = await pagamentoAvulso.gravar();
            if(ok){
                res.status(200).json({ msg: "PagamentoAvulso gravado com sucesso." });
            }else{
                res.status(500).json({ msg: "Erro ao gravar pagamentoAvulso." });
            }
        }else{
            res.status(400).json({ msg: "Parâmetros inválidos." });
        }
    }

    async marcarPago(req,res){
        if(req.body.idPagamento > 0){
            let pagamentoAvulso = new PagamentoAvulsoModel();
            let ok = await pagamentoAvulso.marcarPago(req.body.idPagamento);
            if(ok){
                res.status(200).json({ msg: "PagamentoAvulso quitado com sucesso." });
            }else{
                res.status(500).json({ msg: "Erro ao marcar quitado." });
            }
        }else{
            res.status(400).json({ msg: "Parâmetros inválidos." });
        }
    }

    async excluir(req,res){
        if(req.params.idPagamentoAvulso > 0){
            let pagamentoAvulso = new PagamentoAvulsoModel();
            let ok = await pagamentoAvulso.excluir(req.params.idPagamentoAvulso);
            if(ok){
                res.status(200).json({ msg: "PagamentoAvulso excluido com sucesso." });
            }else{
                res.status(500).json({ msg: "Erro ao excluir pagamentoAvulso." });
            }
        }else{
            res.status(400).json({ msg: "Parâmetros inválidos." });
        }
    }

}

module.exports = PagamentoAvulsoController;
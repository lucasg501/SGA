const PagamentoAvulsoModel = require('../model/pagamentoAvulsoModel');

class PagamentoAvulsoController {

    async listar(req, res) {
        let pagamentoAvulso = new PagamentoAvulsoModel();
        let lista = await pagamentoAvulso.listar();
        let listaRetorno = lista.map(p => p.toJSON());
        res.status(200).json(listaRetorno);
    }

    async obter(req, res) {
        if (req.params.idPagamentoAvulso > 0) {
            let pagamentoAvulso = new PagamentoAvulsoModel();
            pagamentoAvulso = await pagamentoAvulso.obter(req.params.idPagamentoAvulso);
            if (pagamentoAvulso != null) {
                res.status(200).json(pagamentoAvulso.toJSON());
            } else {
                res.status(404).json({ message: "Pagamento avulso não encontrado." });
            }
        } else {
            res.status(400).json({ message: "Parâmetros inválidos." });
        }
    }

    async obterPorContrato(req, res) {
        if (req.params.idContrato > 0) {
            let pagamentoAvulso = new PagamentoAvulsoModel();
            let lista = await pagamentoAvulso.obterPorContrato(req.params.idContrato);
            res.status(200).json(lista); // já retorna objetos com descricao
        } else {
            res.status(400).json({ message: "Parâmetros inválidos." });
        }
    }

    async gravar(req, res) {
        if (Object.keys(req.body).length > 0) {
            let pagamentoAvulso = new PagamentoAvulsoModel(
                0,
                req.body.valorPagamento,
                req.body.dataPagamento,
                req.body.pago,
                req.body.idContrato,
                req.body.descricao // novo campo
            );

            let ok = await pagamentoAvulso.gravar();
            if (ok) {
                res.status(200).json({ msg: "Pagamento avulso gravado com sucesso." });
            } else {
                res.status(500).json({ msg: "Erro ao gravar pagamento avulso." });
            }
        } else {
            res.status(400).json({ msg: "Parâmetros inválidos." });
        }
    }

    async marcarPago(req, res) {
        if (req.body.idPagamento > 0) {
            let pagamentoAvulso = new PagamentoAvulsoModel();
            let ok = await pagamentoAvulso.marcarPago(req.body.idPagamento);
            if (ok) {
                res.status(200).json({ msg: "Pagamento avulso quitado com sucesso." });
            } else {
                res.status(500).json({ msg: "Erro ao marcar quitado." });
            }
        } else {
            res.status(400).json({ msg: "Parâmetros inválidos." });
        }
    }

    async excluir(req, res) {
        if (req.params.idPagamentoAvulso > 0) {
            let pagamentoAvulso = new PagamentoAvulsoModel();
            let ok = await pagamentoAvulso.excluir(req.params.idPagamentoAvulso);
            if (ok) {
                res.status(200).json({ msg: "Pagamento avulso excluído com sucesso." });
            } else {
                res.status(500).json({ msg: "Erro ao excluir pagamento avulso." });
            }
        } else {
            res.status(400).json({ msg: "Parâmetros inválidos." });
        }
    }

    async buscarPorImovel(req, res) {
        if (req.params.refImovel.length > 0) {
            let pagamentoAvulso = new PagamentoAvulsoModel();
            let lista = await pagamentoAvulso.buscaPorImovel(req.params.refImovel);
            let listaRetorno = lista.map(p => p.toJSON());
            res.status(200).json(listaRetorno);
        } else {
            res.status(400).json({ msg: "Parâmetros inválidos." });
        }
    }

}

module.exports = PagamentoAvulsoController;

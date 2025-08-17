const PagamentoAvulsoModel = require('../model/pagamentoAvulsoModel');

class PagamentoAvulsoController {

    async listar(req, res) {
        try {
            let pagamentoAvulso = new PagamentoAvulsoModel();
            let lista = await pagamentoAvulso.listar();
            let listaRetorno = lista.map(p => p.toJSON());
            res.status(200).json(listaRetorno);
        } catch (e) {
            console.error("Erro ao listar pagamentos avulsos:", e);
            res.status(500).json({ msg: "Erro ao listar pagamentos avulsos." });
        }
    }

    async obter(req, res) {
        try {
            if (req.params.idPagamentoAvulso > 0) {
                let pagamentoAvulso = new PagamentoAvulsoModel();
                pagamentoAvulso = await pagamentoAvulso.obter(req.params.idPagamentoAvulso);
                if (pagamentoAvulso != null) {
                    res.status(200).json(pagamentoAvulso.toJSON());
                } else {
                    res.status(404).json({ msg: "Pagamento avulso não encontrado." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro ao obter pagamento avulso:", e);
            res.status(500).json({ msg: "Erro ao obter pagamento avulso." });
        }
    }

    async obterPorContrato(req, res) {
        try {
            if (req.params.idContrato > 0) {
                let pagamentoAvulso = new PagamentoAvulsoModel();
                let lista = await pagamentoAvulso.obterPorContrato(req.params.idContrato);
                res.status(200).json(lista);
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro ao obter pagamentos por contrato:", e);
            res.status(500).json({ msg: "Erro ao obter pagamentos por contrato." });
        }
    }

    async gravar(req, res) {
        try {
            if (Object.keys(req.body).length > 0) {
                let pagamentoAvulso = new PagamentoAvulsoModel(
                    0,
                    req.body.valorPagamento,
                    req.body.dataPagamento,
                    req.body.pago,
                    req.body.idContrato,
                    req.body.descricao
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
        } catch (e) {
            console.error("Erro ao gravar pagamento avulso:", e);
            res.status(500).json({ msg: "Erro ao gravar pagamento avulso." });
        }
    }

    async marcarPago(req, res) {
        try {
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
        } catch (e) {
            console.error("Erro ao marcar pagamento avulso como pago:", e);
            res.status(500).json({ msg: "Erro ao marcar pagamento avulso como pago." });
        }
    }

    async excluir(req, res) {
        try {
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
        } catch (e) {
            console.error("Erro ao excluir pagamento avulso:", e);
            res.status(500).json({ msg: "Erro ao excluir pagamento avulso." });
        }
    }

    async buscarPorImovel(req, res) {
        try {
            if (req.params.refImovel.length > 0) {
                let pagamentoAvulso = new PagamentoAvulsoModel();
                let lista = await pagamentoAvulso.buscaPorImovel(req.params.refImovel);
                let listaRetorno = lista.map(p => p.toJSON());
                res.status(200).json(listaRetorno);
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro ao buscar pagamentos por imóvel:", e);
            res.status(500).json({ msg: "Erro ao buscar pagamentos por imóvel." });
        }
    }
}

module.exports = PagamentoAvulsoController;

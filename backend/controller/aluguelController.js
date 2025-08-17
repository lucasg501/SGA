const AluguelModel = require('../model/aluguelModel');

class AluguelController {

    async listar(req, res) {
        try {
            let aluguel = new AluguelModel();
            let lista = await aluguel.listar();
            let listaRetorno = [];
            for (let i = 0; i < lista.length; i++) {
                let aluguelItem = new AluguelModel(
                    lista[i].idAluguel,
                    lista[i].valorAluguel,
                    lista[i].quitada,
                    lista[i].idContrato,
                    lista[i].idLocador,
                    lista[i].idLocatario,
                    lista[i].dataVencimento
                );
                listaRetorno.push(aluguelItem);
            }
            res.status(200).json({ alugueis: listaRetorno });
        } catch (e) {
            console.error("Erro ao listar aluguéis:", e);
            res.status(500).json({ msg: "Erro ao listar aluguéis." });
        }
    }

    async obter(req, res) {
        try {
            if (req.params.idAluguel > 0) {
                let aluguel = new AluguelModel();
                aluguel = await aluguel.obter(req.params.idAluguel);
                if (aluguel != null) {
                    res.status(200).json(aluguel);
                } else {
                    res.status(500).json({ msg: "Erro ao obter aluguel." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em obter aluguel:", e);
            res.status(500).json({ msg: "Erro ao obter aluguel." });
        }
    }

    async obterPorContrato(req, res) {
        try {
            if (req.params.idContrato > 0) {
                let aluguel = new AluguelModel();
                aluguel = await aluguel.obterPorContrato(req.params.idContrato);
                if (aluguel != null) {
                    res.status(200).json(aluguel);
                } else {
                    res.status(500).json({ msg: "Erro ao obter aluguel." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em obterPorContrato:", e);
            res.status(500).json({ msg: "Erro ao obter aluguel." });
        }
    }

    async obterAlugueis(req, res) {
        try {
            if (req.params.cpfLocatario != null) {
                let aluguel = new AluguelModel();
                aluguel = await aluguel.obterAlugueis(req.params.cpfLocatario);
                if (aluguel != null) {
                    res.status(200).json(aluguel);
                } else {
                    res.status(500).json({ msg: "Erro ao obter aluguel." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em obterAlugueis:", e);
            res.status(500).json({ msg: "Erro ao obter aluguel." });
        }
    }

    async marcarPago(req, res) {
        try {
            if (req.body.idAluguel > 0) {
                let aluguel = new AluguelModel();
                let ok = await aluguel.marcarQuitada(req.body.idAluguel);
                if (ok) {
                    res.status(200).json({ msg: "Aluguel quitado com sucesso." });
                } else {
                    res.status(500).json({ msg: "Erro ao marcar quitado." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em marcarPago:", e);
            res.status(500).json({ msg: "Erro ao marcar quitado." });
        }
    }

    async gravar(req, res) {
        try {
            if (Object.keys(req.body).length > 0) {
                let aluguel = new AluguelModel();
                aluguel.idAluguel = 0;
                aluguel.idContrato = req.body.idContrato;
                aluguel.valorAluguel = req.body.valorAluguel;
                aluguel.quitada = 'N';
                aluguel.idLocatario = req.body.idLocatario;
                aluguel.idLocador = req.body.idLocador;
                aluguel.dataVencimento = req.body.dataVencimento;
                let ok = await aluguel.gravar();
                if (ok === true) {
                    res.status(200).json({ msg: "Aluguel gravado com sucesso." });
                } else if (ok === false) {
                    res.status(400).json({ msg: "Aluguel ja existente ou contrato inativo." });
                } else {
                    res.status(500).json({ msg: "Erro ao gravar aluguel." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em gravar:", e);
            res.status(500).json({ msg: "Erro ao gravar aluguel." });
        }
    }

    async alterar(req, res) {
        try {
            if (Object.keys(req.body).length > 0) {
                let aluguel = new AluguelModel();
                aluguel.idAluguel = req.body.idAluguel;
                aluguel.idContrato = req.body.idContrato;
                aluguel.valorAluguel = req.body.valorAluguel;
                aluguel.quitada = req.body.quitada;
                aluguel.idLocador = req.body.idLocador;
                aluguel.idLocatario = req.body.idLocatario;
                aluguel.dataVencimento = req.body.dataVencimento;
                let ok = await aluguel.gravar();
                if (ok) {
                    res.status(200).json({ msg: "Aluguel alterado com sucesso." });
                } else {
                    res.status(500).json({ msg: "Erro ao alterar aluguel." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em alterar:", e);
            res.status(500).json({ msg: "Erro ao alterar aluguel." });
        }
    }

    async excluir(req, res) {
        try {
            if (req.params.idContrato != null) {
                let aluguel = new AluguelModel();
                let ok = await aluguel.excluir(req.params.idContrato);
                if (ok) {
                    res.status(200).json({ msg: "Aluguel excluido com sucesso." });
                } else {
                    res.status(500).json({ msg: "Erro ao excluir aluguel." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em excluir:", e);
            res.status(500).json({ msg: "Erro ao excluir aluguel." });
        }
    }

}

module.exports = AluguelController;

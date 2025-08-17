const ContratoModel = require('../model/contratoModel');

class ContratoController {

    async listar(req, res) {
        try {
            let contrato = new ContratoModel();
            let lista = await contrato.listar();
            let listaRetorno = [];
            for (let i = 0; i < lista.length; i++) {
                listaRetorno.push(lista[i].toJSON());
            }
            res.status(200).json(listaRetorno);
        } catch (e) {
            console.error("Erro ao listar contratos:", e);
            res.status(500).json({ msg: "Erro ao listar contratos." });
        }
    }

    async obter(req, res) {
        try {
            if (req.params.idContrato > 0) {
                let contrato = new ContratoModel();
                contrato = await contrato.obter(req.params.idContrato);
                if (contrato != null) {
                    res.status(200).json(contrato.toJSON());
                } else {
                    res.status(500).json({ msg: "Erro ao obter contrato." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em obter contrato:", e);
            res.status(500).json({ msg: "Erro ao obter contrato." });
        }
    }

    async gravar(req, res) {
        try {
            if (Object.keys(req.body).length > 0) {
                let contrato = new ContratoModel();
                contrato.idContrato = 0;
                contrato.idImovel = req.body.idImovel;
                contrato.idLocatario = req.body.idLocatario;
                contrato.idLocador = req.body.idLocador;
                contrato.qtdParcelas = req.body.qtdParcelas;
                contrato.valorParcela = req.body.valorParcela;
                contrato.dataVencimento = req.body.dataVencimento;
                contrato.inicioVigenciaContrato = req.body.inicioVigenciaContrato;
                contrato.fimVigenciaContrato = req.body.fimVigenciaContrato;
                contrato.multa = req.body.multa;
                contrato.juros = req.body.juros;
                contrato.ativo = req.body.ativo;

                let ok = await contrato.gravar();
                if (ok === true) {
                    res.status(200).json({ msg: "Contrato gravado com sucesso." });
                } else if (ok === false) {
                    res.status(400).json({ msg: "Contrato já existente." });
                } else {
                    res.status(500).json({ msg: "Erro ao gravar contrato." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em gravar contrato:", e);
            res.status(500).json({ msg: "Erro ao gravar contrato." });
        }
    }

    async alterar(req, res) {
        try {
            if (Object.keys(req.body).length > 0) {
                let contrato = new ContratoModel();
                contrato.idContrato = req.body.idContrato;
                contrato.idImovel = req.body.idImovel;
                contrato.idLocatario = req.body.idLocatario;
                contrato.idLocador = req.body.idLocador;
                contrato.qtdParcelas = req.body.qtdParcelas;
                contrato.valorParcela = req.body.valorParcela;
                contrato.dataVencimento = req.body.dataVencimento;
                contrato.inicioVigenciaContrato = req.body.inicioVigenciaContrato;
                contrato.fimVigenciaContrato = req.body.fimVigenciaContrato;
                contrato.multa = req.body.multa;
                contrato.juros = req.body.juros;
                contrato.ativo = req.body.ativo;

                let ok = await contrato.gravar();
                if (ok) {
                    res.status(200).json({ msg: "Contrato alterado com sucesso." });
                } else {
                    res.status(500).json({ msg: "Erro ao alterar contrato." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em alterar contrato:", e);
            res.status(500).json({ msg: "Erro ao alterar contrato." });
        }
    }

    async excluir(req, res) {
        try {
            if (req.params.idContrato != null) {
                let contrato = new ContratoModel();
                let ok = await contrato.excluir(req.params.idContrato);
                if (ok) {
                    res.status(200).json({ msg: "Contrato excluído com sucesso." });
                } else {
                    res.status(500).json({ msg: "Erro ao excluir contrato." });
                }
            } else {
                res.status(400).json({ msg: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em excluir contrato:", e);
            res.status(500).json({ msg: "Erro ao excluir contrato." });
        }
    }

}

module.exports = ContratoController;

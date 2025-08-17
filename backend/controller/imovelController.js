const ImovelModel = require('../model/imovelModel');
const ContratoModel = require('../model/contratoModel');

class ImovelController {
    async listar(req, res) {
        try {
            let imovel = new ImovelModel();
            let lista = await imovel.listar();
            let listaRetorno = [];
            for (let i = 0; i < lista.length; i++) {
                listaRetorno.push(lista[i].toJSON());
            }
            res.status(200).json(listaRetorno);
        } catch (e) {
            console.error("Erro ao listar imóveis:", e);
            res.status(500).json({ message: "Erro ao listar imóveis." });
        }
    }

    async obter(req, res) {
        try {
            if (req.params.idImovel > 0) {
                let imovel = new ImovelModel();
                imovel = await imovel.obter(req.params.idImovel);
                if (imovel != null) {
                    res.status(200).json(imovel.toJSON ? imovel.toJSON() : imovel);
                } else {
                    res.status(500).json({ message: "Erro ao obter imóvel." });
                }
            } else {
                res.status(400).json({ message: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em obter imóvel:", e);
            res.status(500).json({ message: "Erro ao obter imóvel." });
        }
    }

    async gravar(req, res) {
        try {
            if (Object.keys(req.body).length > 0) {
                let imovel = new ImovelModel();
                imovel.idImovel = req.body.idImovel;
                imovel.refImovel = req.body.refImovel;
                imovel.valorAluguel = req.body.valorAluguel;
                imovel.idLocatario = req.body.idLocatario;
                imovel.idLocador = req.body.idLocador;

                let ok = await imovel.gravar(imovel.idLocador, imovel.idLocatario, imovel.idImovel);
                if (ok) {
                    res.status(200).json({ message: "Imóvel gravado com sucesso." });
                } else {
                    res.status(500).json({ message: "Erro ao gravar imóvel." });
                }
            } else {
                res.status(400).json({ message: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em gravar imóvel:", e);
            res.status(500).json({ message: "Erro ao gravar imóvel." });
        }
    }

    async buscarPorImovel(req, res) {
        try {
            if (req.params.refImovel && req.params.refImovel.length > 0) {
                let imovel = new ContratoModel();
                let lista = await imovel.buscaPorImovel(req.params.refImovel);
                let listaRetorno = [];
                for (let i = 0; i < lista.length; i++) {
                    listaRetorno.push(lista[i].toJSON ? lista[i].toJSON() : lista[i]);
                }
                res.status(200).json(listaRetorno);
            } else {
                res.status(400).json({ message: "Parâmetro refImovel inválido." });
            }
        } catch (e) {
            console.error("Erro em buscar por imóvel:", e);
            res.status(500).json({ message: "Erro ao buscar por imóvel." });
        }
    }
}

module.exports = ImovelController;

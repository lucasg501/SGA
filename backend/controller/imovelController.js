const ImovelModel = require('../model/imovelModel');
const ContratoModel = require('../model/contratoModel');

class ImovelController {
    async listar(req, res) {
        let imovel = new ImovelModel();
        let lista = await imovel.listar();
        let listaRetorno = [];
        for (let i = 0; i < lista.length; i++) {
            listaRetorno.push(lista[i].toJSON());
        }
        res.status(200).json(listaRetorno);
    }

    async obter(req, res) {
        if (req.params.idImovel > 0) {
            let imovel = new ImovelModel();
            imovel = await imovel.obter(req.params.idImovel);
            if (imovel != null) {
                res.status(200).json(imovel);
            } else {
                res.status(500).json({ message: "Erro ao obter imovel." });
            }
        } else {
            res.status(400).json({ message: "Parâmetros inválidos." });
        }
    }

    async gravar(req, res) {
        if (Object.keys(req.body).length > 0) {
            let imovel = new ImovelModel();

            imovel.idImovel = req.body.idImovel;
            imovel.refImovel = req.body.refImovel;
            imovel.valorAluguel = req.body.valorAluguel;
            imovel.idLocatario = req.body.idLocatario;
            imovel.idLocador = req.body.idLocador;
            let ok = await imovel.gravar(imovel.idLocador, imovel.idLocatario, imovel.idImovel);
            if (ok) {
                res.status(200).json({ message: "Imovel gravado com sucesso." });
            } else {
                res.status(500).json({ message: "Erro ao gravar imovel." });
            }
        } else {
            res.status(400).json({ message: "Parâmetros inválidos." });
        }
    }

    async buscarPorImovel(req, res) {
        if (req.params.refImovel.length > 0) {
            let imovel = new ContratoModel();
            let lista = await imovel.buscaPorImovel(req.params.refImovel);
            let listaRetorno = [];
            for (let i = 0; i < lista.length; i++) {
                listaRetorno.push(lista[i].toJSON());
            }
            res.status(200).json(listaRetorno);
        }
    }
}

module.exports = ImovelController;
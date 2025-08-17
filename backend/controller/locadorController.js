const LocadorModel = require('../model/locadorModel');

class LocadorController {
    async listar(req, res) {
        try {
            let locador = new LocadorModel();
            let lista = await locador.listar();
            let listaRetorno = [];
            for (let i = 0; i < lista.length; i++) {
                listaRetorno.push(lista[i].toJSON());
            }
            res.status(200).json(listaRetorno);
        } catch (e) {
            console.error("Erro ao listar locadores:", e);
            res.status(500).json({ message: "Erro ao listar locadores." });
        }
    }

    async obter(req, res) {
        try {
            if (req.params.idLocador > 0) {
                let locador = new LocadorModel();
                locador = await locador.obter(req.params.idLocador);
                if (locador != null) {
                    res.status(200).json(locador.toJSON ? locador.toJSON() : locador);
                } else {
                    res.status(500).json({ message: "Erro ao obter locador." });
                }
            } else {
                res.status(400).json({ message: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em obter locador:", e);
            res.status(500).json({ message: "Erro ao obter locador." });
        }
    }

    async obterPorId(req, res) {
        try {
            if (req.params.idLocador > 0) {
                let locador = new LocadorModel();
                locador = await locador.obterPorId(req.params.idLocador);
                if (locador != null) {
                    res.status(200).json(locador.toJSON ? locador.toJSON() : locador);
                } else {
                    res.status(500).json({ message: "Erro ao obter locador." });
                }
            } else {
                res.status(400).json({ message: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro em obter locador por ID:", e);
            res.status(500).json({ message: "Erro ao obter locador." });
        }
    }
}

module.exports = LocadorController;

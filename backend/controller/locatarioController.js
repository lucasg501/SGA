const LocatarioModel = require('../model/locatarioModel');

class LocatarioController {

    async listar(req, res) {
        try {
            let locatario = new LocatarioModel();
            let lista = await locatario.listar();
            let listaRetorno = [];
            for (let i = 0; i < lista.length; i++) {
                listaRetorno.push(lista[i].toJSON());
            }
            res.status(200).json(listaRetorno);
        } catch (e) {
            console.error("Erro ao listar locatarios:", e);
            res.status(500).json({ message: "Erro ao listar locatarios." });
        }
    }

    async obter(req, res) {
        try {
            if (req.params.idLocatario > 0) {
                let locatario = new LocatarioModel();
                locatario = await locatario.obter(req.params.idLocatario);
                if (locatario != null) {
                    res.status(200).json(locatario);
                } else {
                    res.status(500).json({ message: "Erro ao obter locatario." });
                }
            } else {
                res.status(400).json({ message: "Par\u00E2metros inv\u00E1lidos." });
            }
        } catch (e) {
            console.error("Erro em obter locatario:", e);
            res.status(500).json({ message: "Erro ao obter locatario." });
        }
    }
}

module.exports = LocatarioController;
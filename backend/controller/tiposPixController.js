const TiposPixModel = require('../model/tiposPixModel');

class TiposPixController {

    async listar(req, res) {
        try {
            let tiposPix = new TiposPixModel();
            let lista = await tiposPix.listar();
            let listaRetorno = [];
            for (let i = 0; i < lista.length; i++) {
                listaRetorno.push(lista[i].toJSON());
            }
            res.status(200).json(listaRetorno);
        } catch (e) {
            console.error("Erro ao listar tiposPix:", e);
            res.status(500).json({ message: "Erro ao listar tiposPix." });
        }
    }

    async obter(req, res) {
        try {
            if (req.params.idTipo > 0) {
                let tiposPix = new TiposPixModel();
                tiposPix = await tiposPix.obter(req.params.idTipo);
                if (tiposPix != null) {
                    res.status(200).json(tiposPix);
                } else {
                    res.status(500).json({ message: "Erro ao obter tiposPix." });
                }
            } else {
                res.status(400).json({ message: "Par\u00E2metros inv\u00E1lidos." });
            }
        } catch (e) {
            console.error("Erro em obter tiposPix:", e);
            res.status(500).json({ message: "Erro ao obter tiposPix." });
        }
    }

}

module.exports = TiposPixController;
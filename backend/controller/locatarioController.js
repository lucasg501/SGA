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

    async gravar(req, res) {
        try {
            if (Object.keys(req.body).length > 0) {
                let locatario = new LocatarioModel();

                locatario.idLocatario = 0;
                locatario.nomeLocatario = req.body.nomeLocatario;
                locatario.cpfLocatario = req.body.cpfLocatario;
                let ok = await locatario.gravar();
                if (ok) {
                    res.status(200).json({ message: "Locatario gravado com sucesso." });
                } else {
                    res.status(500).json({ message: "Erro ao gravar locatario." });
                }
            } else {
                res.status(400).json({ message: "Parâmetros Inválidos" });
            }
        } catch (e) {
            console.error("Erro ao gravar locatario:", e);
            res.status(500).json({ message: "Erro ao gravar locatario." });
        }
    }

    async alterar(req, res) {
        try {
            if (Object.keys(req.body).length > 0) {
                let locatario = new LocatarioModel();

                locatario.idLocatario = req.body.idLocatario;
                locatario.nomeLocatario = req.body.nomeLocatario;
                locatario.cpfLocatario = req.body.cpfLocatario;
                let ok = await locatario.alterar();
                if (ok) {
                    res.status(200).json({ message: "Locatario alterado com sucesso." });
                } else {
                    res.status(500).json({ message: "Erro ao alterar locatario." });
                }
            } else {
                res.status(400).json({ message: "Parâmetros Inválidos" });
            }
        } catch (e) {
            console.error("Erro ao alterar locatario:", e);
            res.status(500).json({ message: "Erro ao alterar locatario." });
        }
    }

    async excluir(req, res) {
        try {
            if (req.params.idLocatario > 0) {
                let locatario = new LocatarioModel();
                locatario.idLocatario = req.params.idLocatario;
                let ok = await locatario.excluir();
                if (ok) {
                    res.status(200).json({ message: "Locatario excluido com sucesso." });
                } else {
                    res.status(500).json({ message: "Erro ao excluir locatario." });
                }
            } else {
                res.status(400).json({ message: "Par\u00E2metros inv\u00E1lidos." });
            }
        } catch (e) {
            console.error("Erro ao excluir locatario:", e);
            res.status(500).json({ message: "Erro ao excluir locatario." });
        }
    }
}

module.exports = LocatarioController;
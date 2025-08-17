const Database = require('../utils/database');
const banco = new Database();

class tiposPixModel {
    #idTipo;
    #nomeTipo;

    get idTipo() { return this.#idTipo } set idTipo(idTipo) { this.#idTipo = idTipo }
    get nomeTipo() { return this.#nomeTipo } set nomeTipo(nomeTipo) { this.#nomeTipo = nomeTipo }

    constructor(idTipo, nomeTipo) {
        this.#idTipo = idTipo;
        this.#nomeTipo = nomeTipo;
    }

    toJSON() {
        return {
            'idTipo': this.#idTipo,
            'nomeTipo': this.#nomeTipo
        }
    }

    async listar() {
        try {
            let sql = "select * from tiposPix";
            let rows = await banco.ExecutaComando(sql);
            let lista = [];
            for (let i = 0; i < rows.length; i++) {
                lista.push(new tiposPixModel(rows[i]['idTipoPix'], rows[i]['nomeTipo']));
            }
            return lista;
        } catch (e) {
            console.error("Erro ao listar tiposPix:", e);
            return [];
        }
    }

    async obter(idTipo) {
        try {
            let sql = "select * from tiposPix where idTipoPix = ?";
            let valores = [idTipo];
            let rows = await banco.ExecutaComando(sql, valores);
            if (rows.length > 0) {
                return new tiposPixModel(rows[0]['idTipoPix'], rows[0]['nomeTipo']);
            } else {
                return null;
            }
        } catch (e) {
            console.error(`Erro ao obter tiposPix com ID ${idTipo}:`, e);
            return null;
        }
    }

}

module.exports = tiposPixModel;
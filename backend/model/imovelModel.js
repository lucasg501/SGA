const Database = require('../utils/database');
const banco = new Database();

class ImovelModel {
    #idImovel;
    #refImovel;
    #valorAluguel;
    #idLocatario;
    #idLocador;

    get idImovel() { return this.#idImovel } set idImovel(idImovel) { this.#idImovel = idImovel }
    get refImovel() { return this.#refImovel } set refImovel(refImovel) { this.#refImovel = refImovel }
    get valorAluguel() { return this.#valorAluguel } set valorAluguel(valorAluguel) { this.#valorAluguel = valorAluguel }
    get idLocatario() { return this.#idLocatario } set idLocatario(idLocatario) { this.#idLocatario = idLocatario }
    get idLocador() { return this.#idLocador } set idLocador(idLocador) { this.#idLocador = idLocador }

    constructor(idImovel, refImovel, valorAluguel, idLocatario, idLocador) {
        this.#idImovel = idImovel;
        this.#refImovel = refImovel;
        this.#valorAluguel = valorAluguel;
        this.#idLocatario = idLocatario;
        this.#idLocador = idLocador;
    }

    toJSON() {
        return {
            'idImovel': this.#idImovel,
            'refImovel': this.#refImovel,
            'valorAluguel': this.#valorAluguel,
            'idLocatario': this.#idLocatario,
            'idLocador': this.#idLocador
        }
    }

    async listar() {
        try {
            let sql = "select * from imovel";
            let rows = await banco.ExecutaComando(sql);
            let lista = [];
            for (let i = 0; i < rows.length; i++) {
                lista.push(new ImovelModel(
                    rows[i]['idImovel'],
                    rows[i]['refImovel'],
                    rows[i]['valorAluguel'],
                    rows[i]['idLocatario'],
                    rows[i]['idLocador']
                ));
            }
            return lista;
        } catch (e) {
            console.error("Erro ao listar imóveis:", e);
            return null;
        }
    }

    async obter(idImovel) {
        try {
            let sql = "select * from imovel where idImovel = ?";
            let valores = [idImovel];
            let rows = await banco.ExecutaComando(sql, valores);
            if (rows.length > 0) {
                let imovel = new ImovelModel(
                    rows[0]['idImovel'],
                    rows[0]['refImovel'],
                    rows[0]['valorAluguel'],
                    rows[0]['idLocatario'],
                    rows[0]['idLocador']
                );
                return imovel;
            } else {
                return null;
            }
        } catch (e) {
            console.error(`Erro ao obter imóvel id=${idImovel}:`, e);
            return null;
        }
    }

    async gravar(idLocador, idLocatario, idImovel) {
        try {
            let sql = 'update imovel set idLocador = ?, idLocatario = ? where idImovel = ?';
            let valores = [idLocador, idLocatario, idImovel];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        } catch (e) {
            console.error(`Erro ao gravar imóvel id=${idImovel}:`, e);
            return false;
        }
    }

}

module.exports = ImovelModel;
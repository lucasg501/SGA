const Database = require('../utils/database');
const banco = new Database();

class LocatarioModel {
    #idLocatario;
    #nomeLocatario;
    #cpfLocatario;

    get idLocatario() { return this.#idLocatario } set idLocatario(idLocatario) { this.#idLocatario = idLocatario }
    get nomeLocatario() { return this.#nomeLocatario } set nomeLocatario(nomeLocatario) { this.#nomeLocatario = nomeLocatario }
    get cpfLocatario() { return this.#cpfLocatario } set cpfLocatario(cpfLocatario) { this.#cpfLocatario = cpfLocatario }

    constructor(idLocatario, nomeLocatario, cpfLocatario) {
        this.#idLocatario = idLocatario;
        this.#nomeLocatario = nomeLocatario;
        this.#cpfLocatario = cpfLocatario;
    }

    toJSON() {
        return {
            'idLocatario': this.#idLocatario,
            'nomeLocatario': this.#nomeLocatario,
            'cpfLocatario': this.#cpfLocatario
        }
    }

    async listar() {
        try {
            let sql = "select * from locatario";
            let rows = await banco.ExecutaComando(sql);
            let lista = [];
            for (let i = 0; i < rows.length; i++) {
                lista.push(new LocatarioModel(
                    rows[i]['idLocatario'],
                    rows[i]['nomeLocatario'],
                    rows[i]['cpfLocatario']
                ));
            }
            return lista;
        } catch (e) {
            console.error("Erro ao listar locatários:", e);
            return null;
        }
    }

    async obter(idLocatario) {
        try {
            let sql = "select * from locatario where idLocatario = ?";
            let valores = [idLocatario];
            let rows = await banco.ExecutaComando(sql, valores);
            if (rows.length > 0) {
                let locatario = new LocatarioModel(
                    rows[0]['idLocatario'],
                    rows[0]['nomeLocatario'],
                    rows[0]['cpfLocatario']
                );
                return locatario;
            } else {
                return null;
            }
        } catch (e) {
            console.error(`Erro ao obter locatário com ID ${idLocatario}:`, e);
            return null;
        }
    }

    async obterPorCpf(cpfLocatario) {
        try {
            let sql = "select * from locatario where cpfLocatario = ?";
            let valores = [cpfLocatario];
            let rows = await banco.ExecutaComando(sql, valores);
            if (rows.length > 0) {
                let locatario = new LocatarioModel(
                    rows[0]['idLocatario'],
                    rows[0]['nomeLocatario'],
                    rows[0]['cpfLocatario']
                );
                return locatario;
            } else {
                return null;
            }
        } catch (e) {
            console.error(`Erro ao obter locatário com CPF ${cpfLocatario}:`, e);
            return null;
        }
    }

    async gravar() {
        try {
            let sql = "select * from locatario where cpfLocatario = ?";
            let valores = [this.#cpfLocatario];
            let rows = await banco.ExecutaComando(sql, valores);
            if (rows.length > 0) {
                return false;
            } else {
                if (this.#idLocatario == 0) {
                    let sql = "insert into locatario (nomeLocatario, cpfLocatario) values (?, ?)";
                    let valores = [this.#nomeLocatario, this.#cpfLocatario];
                    let ok = await banco.ExecutaComandoNonQuery(sql, valores);
                    return ok;
                } else {
                    let sql = "update locatario set nomeLocatario = ?, cpfLocatario = ? where idLocatario = ?";
                    let valores = [this.#nomeLocatario, this.#cpfLocatario, this.#idLocatario];
                    let ok = await banco.ExecutaComandoNonQuery(sql, valores);
                    return ok;
                }
            }
        } catch (e) {
            console.error("Erro ao gravar locatário:", e);
            return false;
        }
    }

    async excluir(idLocatario) {
        try {
            let sql = "delete from locatario where idLocatario = ?";
            let valores = [idLocatario];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        } catch (e) {
            console.error(`Erro ao excluir locatário ${idLocatario}:`, e);
            return false;
        }
    }

}

module.exports = LocatarioModel;
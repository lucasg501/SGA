const Database = require('../utils/database');
const banco = new Database();

class UsuarioModel {
    #idUsuario;
    #login;
    #senha;
    #chavePix;
    #nomePix;
    #cidade;
    #tipoPix;

    get idUsuario() { return this.#idUsuario } set idUsuario(idUsuario) { this.#idUsuario = idUsuario }
    get login() { return this.#login } set login(login) { this.#login = login }
    get senha() { return this.#senha } set senha(senha) { this.#senha = senha }
    get chavePix() { return this.#chavePix } set chavePix(chavePix) { this.#chavePix = chavePix }
    get nomePix() { return this.#nomePix } set nomePix(nomePix) { this.#nomePix = nomePix }
    get cidade() { return this.#cidade } set cidade(cidade) { this.#cidade = cidade }
    get tipoPix() { return this.#tipoPix } set tipoPix(tipoPix) { this.#tipoPix = tipoPix }

    constructor(idUsuario, login, senha, chavePix, nomePix, cidade, tipoPix) {
        this.#idUsuario = idUsuario;
        this.#login = login;
        this.#senha = senha;
        this.#chavePix = chavePix;
        this.#nomePix = nomePix;
        this.#cidade = cidade;
        this.#tipoPix = tipoPix;
    }

    toJSON() {
        return {
            'idUsuario': this.#idUsuario,
            'login': this.#login,
            'senha': this.#senha,
            'chavePix': this.#chavePix,
            'nomePix': this.#nomePix,
            'cidade': this.#cidade,
            'tipoPix': this.#tipoPix
        }
    }

    async gravarChave(chavePix, nomePix, cidade, tipoPix) {
        try {
            let sql = "UPDATE usuario SET chavePix = ?, nomePix = ?, cidade = ?, tipoPix = ? WHERE idUsuario = 1";
            let valores = [chavePix, nomePix, cidade, tipoPix];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        } catch (e) {
            console.error("Erro ao gravar chave do usuário:", e);
            return false;
        }
    }

    async listarChave() {
        try {
            let sql = "select * from usuario where idUsuario = 1";
            let rows = await banco.ExecutaComando(sql);
            let lista = [];
            if (rows.length > 0) {
                lista.push(new UsuarioModel(
                    rows[0]['idUsuario'],
                    rows[0]['login'],
                    rows[0]['senha'],
                    rows[0]['chavePix'],
                    rows[0]['nomePix'],
                    rows[0]['cidade'],
                    rows[0]['tipoPix']
                ));
            }
            return lista;
        } catch (e) {
            console.error("Erro ao listar chave do usuário:", e);
            return [];
        }
    }

    async autenticar(login, senha) {
        try {
            let sql = "select * from usuario where login = ? and senha = ?";
            let valores = [login, senha];
            let rows = await banco.ExecutaComando(sql, valores);
            if (rows.length > 0) {
                return new UsuarioModel(
                    rows[0]['idUsuario'],
                    rows[0]['login'],
                    rows[0]['senha'],
                    rows[0]['chavePix'],
                    rows[0]['nomePix'],
                    rows[0]['cidade'],
                    rows[0]['tipoPix']
                );
            } else {
                return null;
            }
        } catch (e) {
            console.error(`Erro ao autenticar usuário ${login}:`, e);
            return null;
        }
    }

    async obter(idUsuario) {
        try {
            let sql = "select * from usuario where idUsuario = ?";
            let valores = [idUsuario];
            let rows = await banco.ExecutaComando(sql, valores);
            if (rows.length > 0) {
                return new UsuarioModel(
                    rows[0]['idUsuario'],
                    rows[0]['login'],
                    rows[0]['senha'],
                    rows[0]['chavePix'],
                    rows[0]['nomePix'],
                    rows[0]['cidade'],
                    rows[0]['tipoPix']
                );
            } else {
                return null;
            }
        } catch (e) {
            console.error(`Erro ao obter usuário com ID ${idUsuario}:`, e);
            return null;
        }
    }

}

module.exports = UsuarioModel;
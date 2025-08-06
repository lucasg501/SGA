const Database = require('../utils/database');
const banco = new Database();

class UsuarioModel {
    #idUsuario;
    #login;
    #senha;
    #chavePix;
    #nomePix;
    #cidade;

    get idUsuario() { return this.#idUsuario } set idUsuario(idUsuario) { this.#idUsuario = idUsuario }
    get login() { return this.#login } set login(login) { this.#login = login }
    get senha() { return this.#senha } set senha(senha) { this.#senha = senha }
    get chavePix() { return this.#chavePix } set chavePix(chavePix) { this.#chavePix = chavePix }
    get nomePix() { return this.#nomePix } set nomePix(nomePix) { this.#nomePix = nomePix }
    get cidade() { return this.#cidade } set cidade(cidade) { this.#cidade = cidade }

    constructor(idUsuario, login, senha, chavePix, nomePix, cidade) {
        this.#idUsuario = idUsuario;
        this.#login = login;
        this.#senha = senha;
        this.#chavePix = chavePix;
        this.#nomePix = nomePix;
        this.#cidade = cidade;
    }

    toJSON() {
        return {
            'idUsuario': this.#idUsuario,
            'login': this.#login,
            'senha': this.#senha,
            'chavePix': this.#chavePix,
            'nomePix': this.#nomePix,
            'cidade': this.#cidade
        }
    }

    async gravarChave(chavePix, nomePix, cidade) {
        let sql = "UPDATE usuario SET chavePix = ?, nomePix = ?, cidade = ? WHERE idUsuario = 1";
        let valores = [chavePix, nomePix, cidade];
        let ok = await banco.ExecutaComandoNonQuery(sql, valores);
        return ok;
    }

    async listarChave() {
        let sql = "select * from usuario where idUsuario = 1";
        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        if(rows.length > 0){
            lista.push(new UsuarioModel(rows[0]['idUsuario'], rows[0]['login'], rows[0]['senha'], rows[0]['chavePix'], rows[0]['nomePix'], rows[0]['cidade']));
        }
        return lista;
    }

    async autenticar(login, senha) {
        let sql = "select * from usuario where login = ? and senha = ?";
        let valores = [login, senha];
        let rows = await banco.ExecutaComando(sql, valores);
        if (rows.length > 0)
            return new UsuarioModel(rows[0]['idUsuario'], rows[0]['login'], rows[0]['senha'], rows[0]['chavePix'], rows[0]['nomePix'], rows[0]['cidade']);
        else
            return null;
    }

    async obter(idUsuario){
        let sql = "select * from usuario where idUsuario = ?";
        let valores = [idUsuario];
        let rows = await banco.ExecutaComando(sql, valores);
        if(rows.length > 0){
            let usuario = new UsuarioModel(rows[0]['idUsuario'], rows[0]['login'], rows[0]['senha'], rows[0]['chavePix'], rows[0]['nomePix'], rows[0]['cidade']);
            return usuario;
        }else{
            return null;
        }
    }
}

module.exports = UsuarioModel;
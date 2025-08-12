const Database = require('../utils/database');
const banco = new Database();

class ContratoModel {
    #idContrato;
    #idImovel;
    #idLocatario;
    #idLocador;
    #qtdParcelas;
    #valorParcela;
    #dataVencimento;

    get idContrato() { return this.#idContrato } set idContrato(idContrato) { this.#idContrato = idContrato }
    get idImovel() { return this.#idImovel } set idImovel(idImovel) { this.#idImovel = idImovel }
    get idLocatario() { return this.#idLocatario } set idLocatario(idLocatario) { this.#idLocatario = idLocatario }
    get idLocador() { return this.#idLocador } set idLocador(idLocador) { this.#idLocador = idLocador }
    get qtdParcelas() { return this.#qtdParcelas } set qtdParcelas(qtdParcelas) { this.#qtdParcelas = qtdParcelas }
    get valorParcela() { return this.#valorParcela } set valorParcela(valorParcela) { this.#valorParcela = valorParcela }
    get dataVencimento() { return this.#dataVencimento } set dataVencimento(dataVencimento) { this.#dataVencimento = dataVencimento }

    constructor(idContrato, idImovel, idLocatario, idLocador, qtdParcelas, valorParcela, dataVencimento) {
        this.#idContrato = idContrato;
        this.#idImovel = idImovel;
        this.#idLocatario = idLocatario;
        this.#idLocador = idLocador;
        this.#qtdParcelas = qtdParcelas;
        this.#valorParcela = valorParcela;
        this.#dataVencimento = dataVencimento;
    }

    toJSON() {
        return {
            'idContrato': this.#idContrato,
            'idImovel': this.#idImovel,
            'idLocatario': this.#idLocatario,
            'idLocador': this.#idLocador,
            'qtdParcelas': this.#qtdParcelas,
            'valorParcela': this.#valorParcela,
            'dataVencimento': this.#dataVencimento
        }
    }

    async listar() {
        let sql = "select * from contrato";
        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        for (let i = 0; i < rows.length; i++) {
            lista.push(new ContratoModel(rows[i]['idContrato'], rows[i]['idImovel'], rows[i]['idLocatario'], rows[i]['idLocador'], rows[i]['qtdParcelas'], rows[i]['valorParcela'], rows[i]['dataVencimento']));
        }
        return lista;
    }

    async obter(idContrato) {
        let sql = "select * from contrato where idContrato = ?";
        let valores = [idContrato];
        let rows = await banco.ExecutaComando(sql, valores);
        if (rows.length > 0) {
            let contrato = new ContratoModel(rows[0]['idContrato'], rows[0]['idImovel'], rows[0]['idLocatario'], rows[0]['idLocador'], rows[0]['qtdParcelas'], rows[0]['valorParcela'], rows[0]['dataVencimento']);
            return contrato;
        } else {
            return null;
        }
    }

    async gravar() {
        if (this.#idContrato == 0) {
            let sqlCheck = "select count(*) as total from contrato where idImovel = ?";
            let res = await banco.ExecutaComando(sqlCheck, [this.#idImovel]);

            if (res.length > 0 && res[0].total > 0) {
                let ok = false;
                return ok;
            }
            let sql = "insert into contrato (idImovel, idLocatario, idLocador, qtdParcelas, valorParcela, dataVencimento) values (?, ?, ?, ?, ?, ?)";
            let valores = [this.#idImovel, this.#idLocatario, this.#idLocador, this.#qtdParcelas, this.#valorParcela, this.#dataVencimento];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        } else {
            let sql = "update contrato set idImovel = ?, idLocatario = ?, idLocador = ?, qtdParcelas = ?, valorParcela = ?, dataVencimento = ? where idContrato = ?";
            let valores = [this.#idImovel, this.#idLocatario, this.#idLocador, this.#qtdParcelas, this.#valorParcela, this.#dataVencimento, this.#idContrato];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        }
    }


    async excluir(idContrato) {
        try {
            let sql = "delete from contrato where idContrato = ?";
            let valores = [idContrato];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

}

module.exports = ContratoModel;
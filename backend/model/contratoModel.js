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
    #inicioVigenciaContrato;
    #fimVigenciaContrato;

    get idContrato() { return this.#idContrato } set idContrato(idContrato) { this.#idContrato = idContrato }
    get idImovel() { return this.#idImovel } set idImovel(idImovel) { this.#idImovel = idImovel }
    get idLocatario() { return this.#idLocatario } set idLocatario(idLocatario) { this.#idLocatario = idLocatario }
    get idLocador() { return this.#idLocador } set idLocador(idLocador) { this.#idLocador = idLocador }
    get qtdParcelas() { return this.#qtdParcelas } set qtdParcelas(qtdParcelas) { this.#qtdParcelas = qtdParcelas }
    get valorParcela() { return this.#valorParcela } set valorParcela(valorParcela) { this.#valorParcela = valorParcela }
    get dataVencimento() { return this.#dataVencimento } set dataVencimento(dataVencimento) { this.#dataVencimento = dataVencimento }
    get inicioVigenciaContrato() { return this.#inicioVigenciaContrato } set inicioVigenciaContrato(inicioVigenciaContrato) { this.#inicioVigenciaContrato = inicioVigenciaContrato }
    get fimVigenciaContrato() { return this.#fimVigenciaContrato } set fimVigenciaContrato(fimVigenciaContrato) { this.#fimVigenciaContrato = fimVigenciaContrato }

    constructor(idContrato, idImovel, idLocatario, idLocador, qtdParcelas, valorParcela, dataVencimento, inicioVigenciaContrato, fimVigenciaContrato) {
        this.#idContrato = idContrato;
        this.#idImovel = idImovel;
        this.#idLocatario = idLocatario;
        this.#idLocador = idLocador;
        this.#qtdParcelas = qtdParcelas;
        this.#valorParcela = valorParcela;
        this.#dataVencimento = dataVencimento;
        this.#inicioVigenciaContrato = inicioVigenciaContrato;
        this.#fimVigenciaContrato = fimVigenciaContrato;
    }

    toJSON() {
        return {
            'idContrato': this.#idContrato,
            'idImovel': this.#idImovel,
            'idLocatario': this.#idLocatario,
            'idLocador': this.#idLocador,
            'qtdParcelas': this.#qtdParcelas,
            'valorParcela': this.#valorParcela,
            'dataVencimento': this.#dataVencimento,
            'inicioVigenciaContrato': this.#inicioVigenciaContrato,
            'fimVigenciaContrato': this.#fimVigenciaContrato
        }
    }

    async listar() {
        let sql = "select * from contrato";
        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        for (let i = 0; i < rows.length; i++) {
            lista.push(new ContratoModel(rows[i]['idContrato'], rows[i]['idImovel'], rows[i]['idLocatario'], rows[i]['idLocador'], rows[i]['qtdParcelas'], rows[i]['valorParcela'], rows[i]['dataVencimento'], rows[i]['inicioVigenciaContrato'], rows[i]['fimVigenciaContrato']));
        }
        return lista;
    }

    async obter(idContrato) {
        let sql = "select * from contrato where idContrato = ?";
        let valores = [idContrato];
        let rows = await banco.ExecutaComando(sql, valores);
        if (rows.length > 0) {
            let contrato = new ContratoModel(rows[0]['idContrato'], rows[0]['idImovel'], rows[0]['idLocatario'], rows[0]['idLocador'], rows[0]['qtdParcelas'], rows[0]['valorParcela'], rows[0]['dataVencimento'], rows[0]['inicioVigenciaContrato'], rows[0]['fimVigenciaContrato']);
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
            let sql = "insert into contrato (idImovel, idLocatario, idLocador, qtdParcelas, valorParcela, dataVencimento, inicioVigenciaContrato, fimVigenciaContrato) values (?, ?, ?, ?, ?, ?, ?, ?)";
            let valores = [this.#idImovel, this.#idLocatario, this.#idLocador, this.#qtdParcelas, this.#valorParcela, this.#dataVencimento, this.#inicioVigenciaContrato, this.#fimVigenciaContrato];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        } else {
            let sql = "update contrato set idImovel = ?, idLocatario = ?, idLocador = ?, qtdParcelas = ?, valorParcela = ?, dataVencimento = ?, inicioVigenciaContrato = ?, fimVigenciaContrato = ? where idContrato = ?";
            let valores = [this.#idImovel, this.#idLocatario, this.#idLocador, this.#qtdParcelas, this.#valorParcela, this.#dataVencimento, this.#inicioVigenciaContrato, this.#fimVigenciaContrato, this.#idContrato];
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

    async buscaPorImovel(refImovel, limit = 10, offset = 0) {
        if (!refImovel || !refImovel.toString().trim()) return [];

        const sql = "SELECT c.idContrato, c.idImovel, c.idLocatario, c.idLocador, c.qtdParcelas, c.valorParcela, c.dataVencimento, c.inicioVigenciaContrato, c.fimVigenciaContrato, i.refImovel FROM contrato c JOIN imovel i ON i.idImovel = c.idImovel WHERE i.refImovel LIKE CONCAT('%', ?, '%') ORDER BY c.idContrato DESC LIMIT ? OFFSET ?;";

        const valores = [refImovel, Number(limit), Number(offset)];

        try {
            const rows = await banco.ExecutaComando(sql, valores);
            if (!rows || rows.length === 0) return [];

            return rows.map(r => new ContratoModel(
                r.idContrato,
                r.idImovel,
                r.idLocatario,
                r.idLocador,
                r.qtdParcelas,
                r.valorParcela,
                r.dataVencimento,
                r.inicioVigenciaContrato,
                r.fimVigenciaContrato,
                r.refImovel
            ));
        } catch (err) {
            console.error('Erro em buscaPorImovel:', err);
            throw err;
        }
    }

}

module.exports = ContratoModel;
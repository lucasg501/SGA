const Database = require('../utils/database');
const banco = new Database();
const LocadorModel = require('./locadorModel');
let locadorModel = new LocadorModel();

class AluguelModel {
    #idAluguel;
    #valorAluguel;
    #quitada;
    #idContrato;
    #idLocador;

    get idAluguel() { return this.#idAluguel } set idAluguel(idAluguel) { this.#idAluguel = idAluguel }
    get valorAluguel() { return this.#valorAluguel } set valorAluguel(valorAluguel) { this.#valorAluguel = valorAluguel }
    get quitada() { return this.#quitada } set quitada(quitada) { this.#quitada = quitada }
    get idContrato() { return this.#idContrato } set idContrato(idContrato) { this.#idContrato = idContrato }
    get idLocador() { return this.#idLocador } set idLocador(idLocador) { this.#idLocador = idLocador }

    constructor(idAluguel, valorAluguel, quitada, idContrato, idLocador) {
        this.#idAluguel = idAluguel;
        this.#valorAluguel = valorAluguel;
        this.#quitada = quitada;
        this.#idContrato = idContrato;
        this.#idLocador = idLocador;
    }

    toJSON() {
        return {
            'idAluguel': this.#idAluguel,
            'valorAluguel': this.#valorAluguel,
            'quitada': this.#quitada,
            'idContrato': this.#idContrato,
            'idLocador': this.#idLocador
        }
    }

    async listar() {
        let sql = "select * from aluguel";
        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        for (let i = 0; i < rows.length; i++) {
            lista.push(new AluguelModel(rows[i]['idAluguel'], rows[i]['valorAluguel'], rows[i]['quitada'], rows[i]['idContrato'], rows[i]['idLocador']));
        }
        return lista;
    }

    async obter(idAluguel) {
        let sql = "select * from aluguel where idAluguel = ?";
        let valores = [idAluguel];
        let rows = await banco.ExecutaComando(sql, valores);
        if (rows.length > 0) {
            let aluguel = new AluguelModel(rows[0]['idAluguel'], rows[0]['valorAluguel'], rows[0]['quitada'], rows[0]['idContrato'], rows[0]['idLocador']);
            return aluguel;
        } else {
            return null;
        }
    }

    async obterPorContrato(idContrato) {
        let sql = "select * from aluguel where idContrato = ?";
        let valores = [idContrato];
        let rows = await banco.ExecutaComando(sql, valores);
        let lista = [];
        for (let i = 0; i < rows.length; i++) {
            lista.push(new AluguelModel(rows[i]['idAluguel'], rows[i]['valorAluguel'], rows[i]['quitada'], rows[i]['idContrato'], rows[i]['idLocador']));
        }
        return lista;
    }

    async marcarQuitada(idAluguel) {
        try {
            let sql = "UPDATE aluguel SET quitada = 'S' WHERE idAluguel = ?";
            let valores = [idAluguel];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async gravar() {
        // Buscar qtdParcelas do contrato correspondente (SEM INNER JOIN com aluguel)
        let sqlBusca = `SELECT qtdParcelas FROM contrato WHERE idContrato = ?`;
        let dados = await banco.ExecutaComando(sqlBusca, [this.#idContrato]);

        if (dados.length === 0) {
            throw new Error('Contrato não encontrado para o idContrato: ' + this.#idContrato);
        }

        let qtdParcelas = dados[0].qtdParcelas;

        if (this.#idAluguel == 0) {
            let ok = true;

            for (let i = 0; i < qtdParcelas; i++) {
                let sql = `INSERT INTO aluguel (valorAluguel, quitada, idContrato, idLocador) VALUES (?, ?, ?, ?)`;
                let valores = [this.#valorAluguel, this.#quitada, this.#idContrato, this.#idLocador];
                let resultado = await banco.ExecutaComandoNonQuery(sql, valores);

                // Se algum insert falhar, ok vira false
                if (!resultado) {
                    ok = false;
                }
            }

            return ok;
        } else {
            let sql = `UPDATE aluguel SET valorAluguel = ?, quitada = ?, idContrato = ?, idLocador = ? WHERE idAluguel = ?`;
            let valores = [this.#valorAluguel, this.#quitada, this.#idContrato, this.#idLocador, this.#idAluguel];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        }
    }

    async obterAlugueis(cpfLocador) {
        // Obtém o locador pelo CPF
        const locador = await locadorModel.obter(cpfLocador);

        // Verifica se encontrou
        if (!locador) {
            throw new Error(`Locador com CPF ${cpfLocador} não encontrado.`);
        }

        const idLocador = locador.idLocador;

        // Busca todos os aluguéis relacionados ao locador
        const sql = "SELECT * FROM aluguel WHERE idLocador = ?";
        const valores = [idLocador];
        const rows = await banco.ExecutaComando(sql, valores);

        // Monta a lista de objetos AluguelModel
        const lista = [];
        for(let i=0; i<rows.length; i++) {
            lista.push(new AluguelModel(rows[i].idAluguel, rows[i].valorAluguel, rows[i].quitada, rows[i].idContrato, rows[i].idLocador));
        }

        return lista;
    }


}

module.exports = AluguelModel;  
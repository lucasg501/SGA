const Database = require('../utils/database');
const banco = new Database();
let LocatarioModel = require('./locatarioModel')

class AluguelModel {
    #idAluguel;
    #valorAluguel;
    #quitada;
    #idContrato;
    #idLocador;
    #idLocatario;
    #dataVencimento;

    get idAluguel() { return this.#idAluguel } set idAluguel(idAluguel) { this.#idAluguel = idAluguel }
    get valorAluguel() { return this.#valorAluguel } set valorAluguel(valorAluguel) { this.#valorAluguel = valorAluguel }
    get quitada() { return this.#quitada } set quitada(quitada) { this.#quitada = quitada }
    get idContrato() { return this.#idContrato } set idContrato(idContrato) { this.#idContrato = idContrato }
    get idLocador() { return this.#idLocador } set idLocador(idLocador) { this.#idLocador = idLocador }
    get idLocatario() { return this.#idLocatario } set idLocatario(idLocatario) { this.#idLocatario = idLocatario }
    get dataVencimento() { return this.#dataVencimento } set dataVencimento(dataVencimento) { this.#dataVencimento = dataVencimento }

    constructor(idAluguel, valorAluguel, quitada, idContrato, idLocador, idLocatario, dataVencimento) {
        this.#idAluguel = idAluguel;
        this.#valorAluguel = valorAluguel;
        this.#quitada = quitada;
        this.#idContrato = idContrato;
        this.#idLocador = idLocador;
        this.#idLocatario = idLocatario,
        this.#dataVencimento = dataVencimento
    }

    toJSON() {
        return {
            'idAluguel': this.#idAluguel,
            'valorAluguel': this.#valorAluguel,
            'quitada': this.#quitada,
            'idContrato': this.#idContrato,
            'idLocador': this.#idLocador,
            'idLocatario': this.#idLocatario,
            'dataVencimento': this.#dataVencimento
        }
    }

    async listar() {
        let sql = "select * from aluguel";
        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        for (let i = 0; i < rows.length; i++) {
            lista.push(new AluguelModel(rows[i]['idAluguel'], rows[i]['valorAluguel'], rows[i]['quitada'], rows[i]['idContrato'], rows[i]['idLocador'], rows[i]['idLocatario'], rows[i]['dataVencimento']));
        }
        return lista;
    }

    async obter(idAluguel) {
        let sql = "select * from aluguel where idAluguel = ?";
        let valores = [idAluguel];
        let rows = await banco.ExecutaComando(sql, valores);
        if (rows.length > 0) {
            let aluguel = new AluguelModel(rows[0]['idAluguel'], rows[0]['valorAluguel'], rows[0]['quitada'], rows[0]['idContrato'], rows[0]['idLocador'], rows[0]['idLocatario'], rows[0]['dataVencimento']);
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
            lista.push(new AluguelModel(rows[i]['idAluguel'], rows[i]['valorAluguel'], rows[i]['quitada'], rows[i]['idContrato'], rows[i]['idLocador'], rows[i]['idLocatario'], rows[i]['dataVencimento']));
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
        let sqlBusca = `SELECT qtdParcelas FROM contrato WHERE idContrato = ?`;
        let dados = await banco.ExecutaComando(sqlBusca, [this.#idContrato]);

        if (dados.length === 0) {
            throw new Error('Contrato não encontrado para o idContrato: ' + this.#idContrato);
        }

        let qtdParcelas = dados[0].qtdParcelas;

        if (this.#idAluguel == 0) {
            let ok = true;
            let dataVencimentoAtual = new Date(this.#dataVencimento);
            for (let i = 0; i < qtdParcelas; i++) {
                let sql = ` INSERT INTO aluguel  (valorAluguel, quitada, idContrato, idLocador, idLocatario, dataVencimento) VALUES (?, ?, ?, ?, ?, ?)`;
                // Formata a data no padrão YYYY-MM-DD para o banco
                let dataFormatada = dataVencimentoAtual.toISOString().split('T')[0];

                let valores = [
                    this.#valorAluguel,
                    this.#quitada,
                    this.#idContrato,
                    this.#idLocador,
                    this.#idLocatario,
                    dataFormatada
                ];

                let resultado = await banco.ExecutaComandoNonQuery(sql, valores);

                if (!resultado) {
                    ok = false;
                }

                // Incrementa 1 mês para a próxima parcela
                dataVencimentoAtual.setMonth(dataVencimentoAtual.getMonth() + 1);
            }

            return ok;
        } else {
            let sql = ` UPDATE aluguel  SET valorAluguel = ?, quitada = ?, idContrato = ?, idLocador = ?, idLocatario = ?, dataVencimento = ? WHERE idAluguel = ?`;
            let valores = [
                this.#valorAluguel,
                this.#quitada,
                this.#idContrato,
                this.#idLocador,
                this.#idLocatario,
                this.#dataVencimento,
                this.#idAluguel
            ];

            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        }
    }

    async obterAlugueis(cpfLocatario) {
        const locatarioModel = new LocatarioModel();
        // Obtém o locatário pelo CPF
        const locatario = await locatarioModel.obterPorCpf(cpfLocatario);

        // Verifica se encontrou
        if (!locatario) {
            throw new Error(`Locatário com CPF ${cpfLocatario} não encontrado.`);
        }

        const idLocatario = locatario.idLocatario;

        // Busca todos os aluguéis relacionados ao locatário
        const sql = "SELECT * FROM aluguel WHERE idLocatario = ?";
        const valores = [idLocatario];
        const rows = await banco.ExecutaComando(sql, valores);

        // Monta a lista de objetos AluguelModel
        const lista = [];
        for (let i = 0; i < rows.length; i++) {
            lista.push(new AluguelModel(
                rows[i].idAluguel,
                rows[i].valorAluguel,
                rows[i].quitada,
                rows[i].idContrato,
                rows[i].idLocador,
                rows[i].idLocatario,
                rows[i].dataVencimento
            ));
        }

        return lista;
    }



}

module.exports = AluguelModel;  
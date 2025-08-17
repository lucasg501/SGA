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
        try {
            let sql = "select * from aluguel";
            let rows = await banco.ExecutaComando(sql);
            let lista = [];
            for (let i = 0; i < rows.length; i++) {
                lista.push(new AluguelModel(rows[i]['idAluguel'], rows[i]['valorAluguel'], rows[i]['quitada'], rows[i]['idContrato'], rows[i]['idLocador'], rows[i]['idLocatario'], rows[i]['dataVencimento']));
            }
            return lista;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async obter(idAluguel) {
        try {
            let sql = "select * from aluguel where idAluguel = ?";
            let valores = [idAluguel];
            let rows = await banco.ExecutaComando(sql, valores);
            if (rows.length > 0) {
                let aluguel = new AluguelModel(rows[0]['idAluguel'], rows[0]['valorAluguel'], rows[0]['quitada'], rows[0]['idContrato'], rows[0]['idLocador'], rows[0]['idLocatario'], rows[0]['dataVencimento']);
                return aluguel;
            } else {
                return null;
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async obterPorContrato(idContrato) {
        try {
            let sql = "select * from aluguel where idContrato = ?";
            let valores = [idContrato];
            let rows = await banco.ExecutaComando(sql, valores);
            let lista = [];
            for (let i = 0; i < rows.length; i++) {
                lista.push(new AluguelModel(rows[i]['idAluguel'], rows[i]['valorAluguel'], rows[i]['quitada'], rows[i]['idContrato'], rows[i]['idLocador'], rows[i]['idLocatario'], rows[i]['dataVencimento']));
            }
            return lista;
        } catch (e) {
            console.log(e);
            return null;
        }
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
        try {
            let sqlBusca = `SELECT qtdParcelas FROM contrato WHERE idContrato = ?`;
            let dados = await banco.ExecutaComando(sqlBusca, [this.#idContrato]);

            if (dados.length === 0) {
                throw new Error('Contrato não encontrado para o idContrato: ' + this.#idContrato);
            }

            let qtdParcelas = dados[0].qtdParcelas;

            if (this.#idAluguel == 0) {
                // Verifica se já existem alugueis para esse contrato
                let sqlVerificaAluguel = `SELECT COUNT(*) as total FROM aluguel WHERE idContrato = ?`;
                let resAluguel = await banco.ExecutaComando(sqlVerificaAluguel, [this.#idContrato]);

                if (resAluguel.length > 0 && resAluguel[0].total > 0) {
                    // Já existem alugueis para esse contrato, bloqueia inserção
                    return false;
                }

                let ok = true;
                let dataVencimentoAtual = new Date(this.#dataVencimento);
                for (let i = 0; i < qtdParcelas; i++) {
                    let sql = `INSERT INTO aluguel (valorAluguel, quitada, idContrato, idLocador, idLocatario, dataVencimento) VALUES (?, ?, ?, ?, ?, ?)`;
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

                    dataVencimentoAtual.setMonth(dataVencimentoAtual.getMonth() + 1);
                }

                return ok;
            } else {
                let sql = `UPDATE aluguel SET valorAluguel = ?, quitada = ?, idContrato = ?, idLocador = ?, idLocatario = ?, dataVencimento = ? WHERE idAluguel = ?`;
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
        } catch (e) {
            console.log(e);
            return false;
        }
    }


    async obterAlugueis(cpfLocatario) {
        try {
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
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async excluir(idContrato) {
        if (idContrato > 0) {
            let sql = "delete from aluguel where idContrato = ?";
            let valores = [idContrato];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        } else {
            return false;
        }
    }

}

module.exports = AluguelModel;  
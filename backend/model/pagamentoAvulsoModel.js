const Database = require('../utils/database');
const banco = new Database();

class PagamentoAvulsoModel {
    #idPagamento;
    #valorPagamento;
    #dataPagamento;
    #pago;
    #idContrato;
    #descricao;

    get idPagamento() { return this.#idPagamento } set idPagamento(idPagamento) { this.#idPagamento = idPagamento }
    get valorPagamento() { return this.#valorPagamento } set valorPagamento(valorPagamento) { this.#valorPagamento = valorPagamento }
    get dataPagamento() { return this.#dataPagamento } set dataPagamento(dataPagamento) { this.#dataPagamento = dataPagamento }
    get pago() { return this.#pago } set pago(pago) { this.#pago = pago }
    get idContrato() { return this.#idContrato } set idContrato(idContrato) { this.#idContrato = idContrato }
    get descricao() { return this.#descricao } set descricao(descricao) { this.#descricao = descricao }

    constructor(idPagamento, valorPagamento, dataPagamento, pago, idContrato, descricao) {
        this.#idPagamento = idPagamento;
        this.#valorPagamento = valorPagamento;
        this.#dataPagamento = dataPagamento;
        this.#pago = pago;
        this.#idContrato = idContrato;
        this.#descricao = descricao;
    }

    toJSON() {
        return {
            idPagamento: this.#idPagamento,
            valorPagamento: this.#valorPagamento,
            dataPagamento: this.#dataPagamento,
            pago: this.#pago,
            idContrato: this.#idContrato,
            descricao: this.#descricao
        };
    }

    async listar() {
        try {
            let sql = "SELECT * FROM pagamentoAvulso";
            let rows = await banco.ExecutaComando(sql);
            let lista = [];
            for (let i = 0; i < rows.length; i++) {
                lista.push(new PagamentoAvulsoModel(
                    rows[i]['idPagamento'],
                    rows[i]['valorPagamento'],
                    rows[i]['dataPagamento'],
                    rows[i]['pago'],
                    rows[i]['idContrato'],
                    rows[i]['descricao']
                ));
            }
            return lista;
        } catch (e) {
            console.error("Erro ao listar pagamentos avulsos:", e);
            return null;
        }
    }

    async obter(idPagamento) {
        try {
            let sql = "SELECT * FROM pagamentoAvulso WHERE idPagamento = ?";
            let valores = [idPagamento];
            let rows = await banco.ExecutaComando(sql, valores);
            if (rows.length > 0) {
                return new PagamentoAvulsoModel(
                    rows[0]['idPagamento'],
                    rows[0]['valorPagamento'],
                    rows[0]['dataPagamento'],
                    rows[0]['pago'],
                    rows[0]['idContrato'],
                    rows[0]['descricao']
                );
            } else {
                return null;
            }
        } catch (e) {
            console.error(`Erro ao obter pagamentoAvulso com ID ${idPagamento}:`, e);
            return null;
        }
    }

    async obterPorContrato(idContrato) {
        try {
            let sql = `
        SELECT 
            pa.idPagamento, 
            pa.idContrato,
            pa.valorPagamento, 
            pa.dataPagamento, 
            pa.pago, 
            pa.descricao,
            l.nomeLocatario 
        FROM pagamentoAvulso pa 
        JOIN contrato c ON pa.idContrato = c.idContrato 
        JOIN locatario l ON c.idLocatario = l.idLocatario
        WHERE pa.idContrato = ?
        `;
            let valores = [idContrato];
            let rows = await banco.ExecutaComando(sql, valores);
            let lista = [];
            for (let i = 0; i < rows.length; i++) {
                lista.push({
                    idPagamento: rows[i]['idPagamento'],
                    idContrato: rows[i]['idContrato'],
                    valorPagamento: rows[i]['valorPagamento'],
                    dataPagamento: rows[i]['dataPagamento'],
                    pago: rows[i]['pago'],
                    descricao: rows[i]['descricao'],
                    nomeLocatario: rows[i]['nomeLocatario']
                });
            }
            return lista;
        } catch (e) {
            console.error(`Erro ao obter pagamentos do contrato ${idContrato}:`, e);
            return [];
        }
    }

    async marcarPago(idPagamento) {
        try {
            let sql = "UPDATE pagamentoAvulso SET pago = 'S' WHERE idPagamento = ?";
            let valores = [idPagamento];
            return await banco.ExecutaComandoNonQuery(sql, valores);
        } catch (e) {
            console.error(`Erro ao marcar pagamento ${idPagamento} como pago:`, e);
            return false;
        }
    }

    async excluir(idPagamento) {
        try {
            if (idPagamento > 0) {
                let sql = "DELETE FROM pagamentoAvulso WHERE idPagamento = ?";
                let valores = [idPagamento];
                return await banco.ExecutaComandoNonQuery(sql, valores);
            }
            return false;
        } catch (e) {
            console.error(`Erro ao excluir pagamento ${idPagamento}:`, e);
            return false;
        }
    }

    async gravar() {
        try {
            let sql = "INSERT INTO pagamentoAvulso (valorPagamento, dataPagamento, pago, idContrato, descricao) VALUES (?, ?, ?, ?, ?)";
            let valores = [this.#valorPagamento, this.#dataPagamento, this.#pago, this.#idContrato, this.#descricao];
            let ok = await banco.ExecutaComandoNonQuery(sql, valores);
            return ok;
        } catch (e) {
            console.error("Erro ao gravar pagamentoAvulso:", e);
            return false;
        }
    }

    async buscaPorImovel(refImovel, limit = 10, offset = 0) {
        if (!refImovel || !refImovel.toString().trim()) return [];

        const sql = `
    SELECT 
        p.idPagamento, 
        p.valorPagamento, 
        p.dataPagamento, 
        p.pago, 
        p.idContrato,
        p.descricao
    FROM pagamentoAvulso p 
    JOIN contrato c ON p.idContrato = c.idContrato 
    JOIN imovel i ON c.idImovel = i.idImovel 
    WHERE i.refImovel LIKE CONCAT('%', ?, '%') 
    ORDER BY p.idPagamento DESC 
    LIMIT ? OFFSET ?;
    `;
        const valores = [refImovel, Number(limit), Number(offset)];

        try {
            const rows = await banco.ExecutaComando(sql, valores);
            if (!rows || rows.length === 0) return [];

            return rows.map(r => new PagamentoAvulsoModel(
                r.idPagamento,
                r.valorPagamento,
                r.dataPagamento,
                r.pago,
                r.idContrato,
                r.descricao
            ));
        } catch (err) {
            console.error('Erro em buscaPorImovel (pagamentoAvulso):', err);
            return [];
        }
    }

}

module.exports = PagamentoAvulsoModel;

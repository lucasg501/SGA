const Database = require('../utils/database');
const banco = new Database();

class PagamentoAvulsoModel {
    #idPagamento;
    #valorPagamento;
    #dataPagamento;
    #pago;
    #idContrato;

    get idPagamento() { return this.#idPagamento } set idPagamento(idPagamento) { this.#idPagamento = idPagamento }
    get valorPagamento() { return this.#valorPagamento } set valorPagamento(valorPagamento) { this.#valorPagamento = valorPagamento }
    get dataPagamento() { return this.#dataPagamento } set dataPagamento(dataPagamento) { this.#dataPagamento = dataPagamento }
    get pago() { return this.#pago } set pago(pago) { this.#pago = pago }
    get idContrato() { return this.#idContrato } set idContrato(idContrato) { this.#idContrato = idContrato }

    constructor(idPagamento, valorPagamento, dataPagamento, pago, idContrato) {
        this.#idPagamento = idPagamento;
        this.#valorPagamento = valorPagamento;
        this.#dataPagamento = dataPagamento;
        this.#pago = pago;
        this.#idContrato = idContrato;
    }

    toJSON() {
        return {
            'idPagamento': this.#idPagamento,
            'valorPagamento': this.#valorPagamento,
            'dataPagamento': this.#dataPagamento,
            'pago': this.#pago,
            'idContrato': this.#idContrato
        }
    }

    async listar() {
        let sql = "select * from pagamentoAvulso";
        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        for (let i = 0; i < rows.length; i++) {
            lista.push(new PagamentoAvulsoModel(rows[i]['idPagamento'], rows[i]['valorPagamento'], rows[i]['dataPagamento'], rows[i]['pago'], rows[i]['idContrato']));
        }
        return lista;
    }

    async obter(idPagamento) {
        let sql = "select * from pagamentoAvulso where idPagamento = ?";
        let valores = [idPagamento];
        let rows = await banco.ExecutaComando(sql, valores);
        if (rows.length > 0) {
            let pagamentoAvulso = new PagamentoAvulsoModel(rows[0]['idPagamento'], rows[0]['valorPagamento'], rows[0]['dataPagamento'], rows[0]['pago'], rows[0]['idContrato']);
            return pagamentoAvulso;
        } else {
            return null;
        }
    }

    async obterPorContrato(idContrato) {
        let sql = `SELECT pa.idPagamento, pa.valorPagamento, pa.dataPagamento, pa.pago, l.nomeLocatario 
               FROM pagamentoAvulso pa 
               JOIN contrato c ON pa.idContrato = c.idContrato 
               JOIN locatario l ON c.idLocatario = l.idLocatario
               WHERE pa.idContrato = ${idContrato}`;

        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        for (let i = 0; i < rows.length; i++) {
            lista.push({
                idPagamento: rows[i]['idPagamento'],
                valorPagamento: rows[i]['valorPagamento'],
                dataPagamento: rows[i]['dataPagamento'],
                pago: rows[i]['pago'],
                nomeLocatario: rows[i]['nomeLocatario']
            });
        }
        return lista;
    }

    async marcarPago(idPagamento){
        let sql = "update pagamentoAvulso set pago = 'S' where idPagamento = ?";
        let valores = [idPagamento];
        let ok = await banco.ExecutaComandoNonQuery(sql, valores);
        return ok;
    }

    async excluir(idPagamento){
        try{
            if(idPagamento > 0){
                let sql = "delete from pagamentoAvulso where idPagamento = ?";
                let valores = [idPagamento];
                let ok = await banco.ExecutaComandoNonQuery(sql, valores);
                return ok;
            }
        }catch(e){
            console.log(e);
            return false;
        }
    }

    async gravar(){
        let sql = "insert into pagamentoAvulso (valorPagamento, dataPagamento, pago, idContrato) values (?, ?, ?, ?)";
        let valores = [this.#valorPagamento, this.#dataPagamento, this.#pago, this.#idContrato];
        let ok = await banco.ExecutaComandoNonQuery(sql, valores);
        return ok;
    }
}

module.exports = PagamentoAvulsoModel;
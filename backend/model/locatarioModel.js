const Database = require('../utils/database');
const banco = new Database();

class LocatarioModel{
    #idLocatario;
    #nomeLocatario;
    #cpfLocatario;

    get idLocatario(){return this.#idLocatario} set idLocatario(idLocatario){this.#idLocatario = idLocatario}
    get nomeLocatario(){return this.#nomeLocatario} set nomeLocatario(nomeLocatario){this.#nomeLocatario = nomeLocatario}
    get cpfLocatario(){return this.#cpfLocatario} set cpfLocatario(cpfLocatario){this.#cpfLocatario = cpfLocatario}

    constructor(idLocatario, nomeLocatario, cpfLocatario) {
        this.#idLocatario = idLocatario;
        this.#nomeLocatario = nomeLocatario;
        this.#cpfLocatario = cpfLocatario;
    }

    toJSON(){
        return{
            'idLocatario': this.#idLocatario,
            'nomeLocatario': this.#nomeLocatario,
            'cpfLocatario': this.#cpfLocatario
        }
    }

    async listar(){
        let sql = "select * from locatario";
        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        for(let i=0; i<rows.length; i++){
            lista.push(new LocatarioModel(rows[i]['idLocatario'], rows[i]['nomeLocatario'], rows[i]['cpfLocatario']));
        }
        return lista;
    }

    async obter(idLocatario){
        let sql = "select * from locatario where idLocatario = ?";
        let valores = [idLocatario];
        let rows = await banco.ExecutaComando(sql, valores);
        if(rows.length > 0){
            let locatario = new LocatarioModel(rows[0]['idLocatario'], rows[0]['nomeLocatario'], rows[0]['cpfLocatario']);
            return locatario;
        }else{
            return null;
        }
    }
}

module.exports = LocatarioModel;
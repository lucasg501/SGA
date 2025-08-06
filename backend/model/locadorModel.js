const Database = require('../utils/database');
const banco = new Database();

class LocadorModel {

    #idLocador;
    #cpfLocador;
    #nomeLocador;

    get idLocador(){return this.#idLocador} set idLocador(idLocador){this.#idLocador = idLocador}
    get cpfLocador(){return this.#cpfLocador} set cpfLocador(cpfLocador){this.#cpfLocador = cpfLocador}
    get nomeLocador(){return this.#nomeLocador} set nomeLocador(nomeLocador){this.#nomeLocador = nomeLocador}

    constructor(idLocador, cpfLocador, nomeLocador) {
        this.#idLocador = idLocador;
        this.#cpfLocador = cpfLocador;
        this.#nomeLocador = nomeLocador;
    }

    toJSON(){
        return{
            'idLocador': this.#idLocador,
            'cpfLocador': this.#cpfLocador,
            'nomeLocador': this.#nomeLocador
        }
    }

    async obter(cpfLocador){
        let sql = "select * from locador where cpfLocador = ?";
        let valores = [cpfLocador];
        let rows = await banco.ExecutaComando(sql, valores);
        if(rows.length > 0){
            let locador = new LocadorModel(rows[0]['idLocador'], rows[0]['cpfLocador'], rows[0]['nomeLocador']);
            return locador;
        }else{
            return null;
        }
    }

    async listar(){
        let sql = "select * from locador";
        let rows = await banco.ExecutaComando(sql);
        let lista = [];
        for(let i=0; i<rows.length; i++){
            lista.push(new LocadorModel(rows[i]['idLocador'], rows[i]['cpfLocador'], rows[i]['nomeLocador']));
        }
        return lista;
    }

}

module.exports = LocadorModel;
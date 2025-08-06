const LocadorModel = require('../model/locadorModel');

class LocadorController{
     
    async listar(req,res){
        let locador = new LocadorModel();
        let lista = await locador.listar();
        let listaRetorno = [];
        for(let i=0; i<lista.length; i++){
            listaRetorno.push(lista[i].toJSON());
        }
        res.status(200).json(listaRetorno);
    }

    async obter(req,res){
        if(req.params.idLocador > 0){
            let locador = new LocadorModel();
            locador = await locador.obter(req.params.idLocador);
            if(locador != null){
                res.status(200).json(locador);
            }else{
                res.status(500).json({message:"Erro ao obter locador."});
            }
        }else{
            res.status(400).json({message:"Parâmetros inválidos."});
        }
    }
}

module.exports = LocadorController;
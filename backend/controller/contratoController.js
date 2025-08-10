const ContratoModel = require('../model/contratoModel');

class ContratoController{

    async listar(req,res){
        let contrato = new ContratoModel();
        let lista = await contrato.listar();
        let listaRetorno = [];
        for(let i=0; i<lista.length; i++){
            listaRetorno.push(lista[i].toJSON());
        }
        res.status(200).json(listaRetorno);
    }

    async obter(req,res){
        if(req.params.idContrato > 0){
            let contrato = new ContratoModel();
            contrato = await contrato.obter(req.params.idContrato);
            if(contrato != null){
                res.status(200).json(contrato.toJSON());
            }else{
                res.status(500).json({message:"Erro ao obter contrato."});
            }
        }else{
            res.status(400).json({message:"Parâmetros inválidos."});
        }
    }

    async gravar(req,res){
        if(Object.keys(req.body).length > 0){
            let contrato = new ContratoModel();

            contrato.idContrato = 0;
            contrato.idImovel = req.body.idImovel;
            contrato.idLocatario = req.body.idLocatario;
            contrato.idLocador = req.body.idLocador;
            contrato.qtdParcelas = req.body.qtdParcelas;
            contrato.valorParcela = req.body.valorParcela;
            contrato.dataVencimento = req.body.dataVencimento;
            let ok = await contrato.gravar();
            if(ok){
                res.status(200).json({msg:"Contrato gravado com sucesso."});
            }else{
                res.status(500).json({msg:"Erro ao gravar contrato."});
            }
        }else{
            res.status(400).json({msg:"Parâmetros inválidos."});
        }
    }

    async alterar(req,res){
        if(Object.keys(req.body).length > 0){
            let contrato = new ContratoModel();
            contrato.idContrato = req.body.idContrato;
            contrato.idImovel = req.body.idImovel;
            contrato.idLocatario = req.body.idLocatario;
            contrato.idLocador = req.body.idLocador;
            contrato.qtdParcelas = req.body.qtdParcelas;
            contrato.valorParcela = req.body.valorParcela;
            contrato.dataVencimento = req.body.dataVencimento;
            let ok = await contrato.gravar();
            if(ok){
                res.status(200).json({msg:"Contrato alterado com sucesso."});
            }else{
                res.status(500).json({msg:"Erro ao alterar contrato."});
            }
        }else{
            res.status(400).json({msg:"Parâmetros inválidos."});
        }
    }
    async excluir(req,res){
        if(req.params.idContrato != null){
            let contrato = new ContratoModel();
            let ok = await contrato.excluir(req.params.idContrato);
            if(ok){
                res.status(200).json({msg:"Contrato excluido com sucesso."});
            }else{
                res.status(500).json({msg:"Erro ao excluir contrato."});
            }
        }else{
            res.status(400).json({msg:"Parâmetros inválidos."});
        }
    }


}

module.exports = ContratoController;
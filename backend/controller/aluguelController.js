const AluguelModel = require('../model/aluguelModel');

class AluguelController{

    async listar(req,res){
        let aluguel = new AluguelModel();
        let lista = await aluguel.listar();
        let listaRetorno = [];
        for(let i=0; i<lista.length; i++){
            let aluguel = new AluguelModel(lista[i].idAluguel, lista[i].valorAluguel, lista[i].quitada, lista[i].idContrato, lista[i].idLocador);
            listaRetorno.push(aluguel);
        }
        res.status(200).json({alugueis:listaRetorno});
    }

    async obter(req,res){
        if(req.params.idAluguel > 0){
            let aluguel = new AluguelModel();
            aluguel = await aluguel.obter(req.params.idAluguel);
            if(aluguel != null){
                res.status(200).json(aluguel);
            }else{
                res.status(500).json({message:"Erro ao obter aluguel."});
            }
        }else{
            res.status(400).json({message:"Parâmetros inválidos."});
        }
    }

    async obterPorContrato(req,res){
        if(req.params.idContrato > 0){
            let aluguel = new AluguelModel();
            aluguel = await aluguel.obterPorContrato(req.params.idContrato);
            if(aluguel != null){
                res.status(200).json(aluguel);
            }else{
                res.status(500).json({message:"Erro ao obter aluguel."});
            }
        }else{
            res.status(400).json({message:"Parâmetros inválidos."});
        }
    }

    async obterAlugueis(req,res){
        if(req.params.cpfLocador != null){
            let aluguel = new AluguelModel();
            aluguel = await aluguel.obterAlugueis(req.params.cpfLocador);
            if(aluguel != null){
                res.status(200).json(aluguel);
            }else{
                res.status(500).json({message:"Erro ao obter aluguel."});
            }
        }else{
            res.status(400).json({message:"Parâmetros inválidos."});
        }
    }

    async marcarPago(req,res){
        if(req.body.idAluguel > 0){
            let aluguel = new AluguelModel();
            let ok = await aluguel.marcarQuitada(req.body.idAluguel);
            if(ok){
                res.status(200).json({message:"Aluguel quitado com sucesso."});
            }else{
                res.status(500).json({message:"Erro ao marcar quitado."});
            }
        }else{
            res.status(400).json({message:"Parâmetros inválidos."});
        }
    }

    async gravar(req,res){
        if(Object.keys(req.body).length > 0){
            let aluguel = new AluguelModel();
            aluguel.idAluguel = 0;
            aluguel.idContrato = req.body.idContrato;
            aluguel.valorAluguel = req.body.valorAluguel;
            aluguel.quitada = 'N';
            aluguel.idLocador = req.body.idLocador;
            let ok = await aluguel.gravar();
            if(ok){
                res.status(200).json({message:"Aluguel gravado com sucesso."});
            }else{
                res.status(500).json({message:"Erro ao gravar aluguel."});
            }
        }else{
            res.status(400).json({message:"Parâmetros inválidos."});
        }
    }

    async alterar(req,res){
        if(Object.keys(req.body).length > 0){
            let aluguel = new AluguelModel();
            aluguel.idAluguel = req.body.idAluguel;
            aluguel.idContrato = req.body.idContrato;
            aluguel.valorAluguel = req.body.valorAluguel;
            aluguel.quitada = req.body.quitada;
            aluguel.idLocador = req.body.idLocador;
            let ok = await aluguel.gravar();
            if(ok){
                res.status(200).json({message:"Aluguel alterado com sucesso."});
            }else{
                res.status(500).json({message:"Erro ao alterar aluguel."});
            }
        }else{
            res.status(400).json({message:"Parâmetros inválidos."});
        }
    }

}

module.exports = AluguelController;
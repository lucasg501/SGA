const express = require('express');
const router = express.Router();
const AluguelController = require('../controller/aluguelController');

const ctrl = new AluguelController();

router.get('/listar', (req,res) =>{
    // #swagger.tags = ['Alugueis']
    // #swagger.summary = 'Lista os alugueis cadastrados'

    ctrl.listar(req,res);
});

router.get('/obter/:idAluguel', (req,res)=>{
    // #swagger.tags = ['Alugueis']
    // #swagger.summary = 'Obtem um aluguel cadastrado'

    ctrl.obter(req,res);
});

router.get('/obterAlugueis/:cpfLocatario', (req,res)=>{
    // #swagger.tags = ['Alugueis']
    // #swagger.summary = 'Obtem os alugueis cadastrados por meio do cpf do locador'

    ctrl.obterAlugueis(req,res);
});

router.get('/obterPorContrato/:idContrato', (req,res)=>{
    // #swagger.tags = ['Alugueis']
    // #swagger.summary = 'Obtem um aluguel cadastrado por meio do id do contrato'

    ctrl.obterPorContrato(req,res);
});

router.post('/gravar', (req,res)=>{
    // #swagger.tags = ['Alugueis']
    // #swagger.summary = 'Adiciona um aluguel'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/aluguel" }
                }
            }
        }
    */

    ctrl.gravar(req,res);
});

router.put('/alterar', (req,res)=>{
    // #swagger.tags = ['Alugueis']
    // #swagger.summary = 'Altera um aluguel'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/aluguel" }
                }
            }
        }
    */

    ctrl.alterar(req,res);
});

router.post('/marcarPago', (req,res)=>{
    // #swagger.tags = ['Alugueis']
    // #swagger.summary = 'Marca um aluguel como quitado'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/aluguel" }
                }
            }
        }
    */

    ctrl.marcarPago(req,res);
});

module.exports = router;
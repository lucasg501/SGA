const express = require('express');
const router = express.Router();
const ContratoController = require('../controller/contratoController');

const ctrl = new ContratoController();

router.get('/listar', (req,res) =>{
    // #swagger.tags = ['Contratos']
    // #swagger.summary = 'Lista os contratos cadastrados'

    ctrl.listar(req,res);
});

router.get('/obter/:idContrato', (req,res)=>{
    // #swagger.tags = ['Contratos']
    // #swagger.summary = 'Obtem um contrato cadastrado'

    ctrl.obter(req,res);
});

router.post('/gravar', (req,res)=>{
    // #swagger.tags = ['Contratos']
    // #swagger.summary = 'Adiciona um contrato'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/contrato" }
                }
            }
        }
    */

    ctrl.gravar(req,res);
});

router.put('/alterar', (req,res)=>{
    // #swagger.tags = ['Contratos']
    // #swagger.summary = 'Altera um contrato'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/contrato" }
                }
            }
        }
    */

    ctrl.alterar(req,res);
});

router.delete('/excluir/:idContrato', (req,res)=>{
    // #swagger.tags = ['Contratos']
    // #swagger.summary = 'Exclui um contrato'

    ctrl.excluir(req,res);
});

module.exports = router;
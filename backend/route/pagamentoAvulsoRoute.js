const express = require('express');
const router = express.Router();
const PagamentoAvulsoController = require('../controller/pagamentoAvulsoController');

const ctrl = new PagamentoAvulsoController();

router.get('/listar', (req,res) =>{
    // #swagger.tags = ['PagamentoAvulso']
    // #swagger.summary = 'Lista os pagamentoAvulso cadastrados'

    ctrl.listar(req,res);
});

router.get('/obter/:idPagamentoAvulso', (req,res)=>{
    // #swagger.tags = ['PagamentoAvulso']
    // #swagger.summary = 'Obtem um pagamentoAvulso cadastrado'

    ctrl.obter(req,res);
});

router.get('/obterPorContrato/:idContrato', (req,res)=>{
    // #swagger.tags = ['PagamentoAvulso']
    // #swagger.summary = 'Obtem um pagamentoAvulso cadastrado por meio do id do contrato'

    ctrl.obterPorContrato(req,res);
});

router.post('/gravar', (req,res)=>{
    // #swagger.tags = ['PagamentoAvulso']
    // #swagger.summary = 'Adiciona um pagamentoAvulso'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/pagamentoAvulso" }
                }
            }
        }
    */

    ctrl.gravar(req,res);
});

router.post('/marcarPago', (req,res)=>{
    // #swagger.tags = ['PagamentoAvulso']
    // #swagger.summary = 'Marca um pagamentoAvulso como quitado'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/pagamentoAvulso" }
                }
            }
        }
    */

    ctrl.marcarPago(req,res);
});

router.delete('/excluir/:idPagamentoAvulso', (req,res)=>{
    // #swagger.tags = ['PagamentoAvulso']
    // #swagger.summary = 'Exclui um pagamentoAvulso'

    ctrl.excluir(req,res);
});

module.exports = router;
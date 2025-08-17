const express = require('express');
const router = express.Router();
const ImovelController = require('../controller/imovelController');

const ctrl = new ImovelController();

router.get('/listar', (req,res) =>{
    // #swagger.tags = ['Imoveis']
    // #swagger.summary = 'Lista os imoveis cadastrados'

    ctrl.listar(req,res);
});

router.get('/obter/:idImovel', (req,res)=>{
    // #swagger.tags = ['Imoveis']
    // #swagger.summary = 'Obtem um imovel cadastrado'

    ctrl.obter(req,res);
});

router.post('/gravar', (req,res)=>{
    // #swagger.tags = ['Imoveis']
    // #swagger.summary = 'Adiciona o proprietario e locador de um imovel'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/imovel" }
                }
            }
        }
    */

    ctrl.gravar(req,res);
});

router.get('/buscarPorImovel/:refImovel', (req,res)=>{
    // #swagger.tags = ['Imoveis']
    // #swagger.summary = 'Obtem um imovel cadastrado por meio do refImovel'

    ctrl.buscarPorImovel(req,res);
});

module.exports = router;
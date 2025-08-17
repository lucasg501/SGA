const express = require('express');
const router = express.Router();
const LocatarioController = require('../controller/locatarioController');

const ctrl = new LocatarioController();

router.get('/listar', (req,res) =>{
    // #swagger.tags = ['Locatarios']
    // #swagger.summary = 'Lista os locatarios cadastrados'

    ctrl.listar(req,res);
});

router.get('/obter/:idLocatario', (req,res)=>{
    // #swagger.tags = ['Locatarios']
    // #swagger.summary = 'Obtem um locatario cadastrado'

    ctrl.obter(req,res);
});

router.post('/gravar', (req,res)=>{
    // #swagger.tags = ['Locatarios']
    // #swagger.summary = 'Adiciona um locatario'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/locatario" }
                }
            }
        }
    */
    ctrl.gravar(req,res);
});

router.put('/alterar', (req,res)=>{
    // #swagger.tags = ['Locatarios']
    // #swagger.summary = 'Altera um locatario'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/locatario" }
                }
            }
        }
    */
    ctrl.alterar(req,res);
});

router.delete('/excluir/:idLocatario', (req,res)=>{
    // #swagger.tags = ['Locatarios']
    // #swagger.summary = 'Exclui um locatario'

    ctrl.excluir(req,res);
});

module.exports = router;
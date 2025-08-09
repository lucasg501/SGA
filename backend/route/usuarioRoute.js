const express = require('express');
const router = express.Router();
const UsuarioController = require('../controller/usuarioController');

const ctrl = new UsuarioController();

router.get('/listarChave', (req,res) =>{
    // #swagger.tags = ['Usuarios']
    // #swagger.summary = 'Lista os usuarios cadastrados'

    ctrl.listarChave(req,res);
});

router.get('/obter/:idUsuario', (req,res)=>{
    // #swagger.tags = ['Usuarios']
    // #swagger.summary = 'Obtem um usuario cadastrado'

    ctrl.obter(req,res);
});

router.post('/gravarChave', (req,res)=>{
    // #swagger.tags = ['Usuarios']
    // #swagger.summary = 'Adiciona uma chave pix'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/usuario" }
                }
            }
        }
    */

    ctrl.gravarChave(req,res);
});

router.post('/autenticar', (req,res)=>{
    // #swagger.tags = ['Usuarios']
    // #swagger.summary = 'Autenticação de login'
    /*
        #swagger.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { "$ref": "#/definitions/usuario" }
                }
            }
        }
    */
    ctrl.autenticar(req,res);
})

module.exports = router;
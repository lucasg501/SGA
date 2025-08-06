const express = require('express');
const router = express.Router();
const LocadorController = require('../controller/locadorController');

const ctrl = new LocadorController();

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

module.exports = router;
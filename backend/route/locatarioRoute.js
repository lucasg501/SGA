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

module.exports = router;
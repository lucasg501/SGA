const express = require('express');
const router = express.Router();
const LocadorController = require('../controller/locadorController');

const ctrl = new LocadorController();

router.get('/listar', (req,res) =>{
    // #swagger.tags = ['Locadores']
    // #swagger.summary = 'Lista os locadores cadastrados'

    ctrl.listar(req,res);
});

router.get('/obter/:idLocador', (req,res)=>{
    // #swagger.tags = ['Locadores']
    // #swagger.summary = 'Obtem um locador cadastrado'

    ctrl.obter(req,res);
});

router.get('/obterPorId/:idLocador', (req,res)=>{
    // #swagger.tags = ['Locadores']
    // #swagger.summary = 'Obtem um locador cadastrado por meio do id'

    ctrl.obterPorId(req,res);
});

module.exports = router;
const express = require('express');
const router = express.Router();
const TiposPixController = require('../controller/tiposPixController');

const ctrl = new TiposPixController();

router.get('/listar', (req,res) =>{
    // #swagger.tags = ['TiposPix']
    // #swagger.summary = 'Lista os tiposPix cadastrados'

    ctrl.listar(req,res);
});

router.get('/obter/idTipo/:idTipo', (req,res)=>{
    // #swagger.tags = ['TiposPix']
    // #swagger.summary = 'Obtem um tiposPix cadastrado'

    ctrl.obter(req,res);
});

module.exports = router;
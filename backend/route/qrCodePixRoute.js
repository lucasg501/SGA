const express  = require('express');
const router = express.Router();
const QrCodePixController = require('../controller/qrcodePixController');

const ctrl = new QrCodePixController();

router.get('/payload/:idAluguel', (req, res) => {
    // #swagger.tags = ['QrCodePix']
    // #swagger.summary = 'Retorna JSON com payload e metadados'

    ctrl.payload(req, res);
});

router.get('/qrcode/:idAluguel.png', (req, res) => {
    // #swagger.tags = ['QrCodePix']
    // #swagger.summary = 'Retorna imagem PNG do QR Code'

    ctrl.qrcode(req, res);
});

// rotas para pagamento avulso
router.get('/payload/avulso/:idPagamento', (req, res) => {
    // #swagger.tags = ['QrCodePix']
    // #swagger.summary = 'Retorna JSON com payload e metadados do pagamento avulso'
    ctrl.payloadAvulso(req, res);
});

router.get('/qrcode/avulso/:idPagamento.png', (req, res) => {
    // #swagger.tags = ['QrCodePix']
    // #swagger.summary = 'Retorna imagem PNG do QR Code do pagamento avulso'
    ctrl.qrcodeAvulso(req, res);
});


module.exports = router;
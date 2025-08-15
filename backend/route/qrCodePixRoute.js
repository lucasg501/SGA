const express = require('express');
const router = express.Router();
const PixController = require('../controller/qrcodePixController');

const ctrl = new PixController();

// Rotas originais
router.get('/payload/:idAluguel', (req, res) => ctrl.payload(req, res));
router.get('/qrcode/:idAluguel.png', (req, res) => ctrl.qrcode(req, res));
router.get('/payload/avulso/:idPagamento', (req, res) => ctrl.payloadAvulso(req, res));
router.get('/qrcode/avulso/:idPagamento.png', (req, res) => ctrl.qrcodeAvulso(req, res));

// -------------------- Rotas de iframe (delegam ao controller) --------------------

// iframe para aluguel (controller gera HTML com data URL)
router.get('/iframe/:idAluguel', (req, res) => ctrl.iframePorAluguel(req, res));

// iframe para pagamento avulso (controller gera HTML com data URL)
router.get('/iframe/avulso/:idPagamento', (req, res) => ctrl.iframePorPagamentoAvulso(req, res));

module.exports = router;

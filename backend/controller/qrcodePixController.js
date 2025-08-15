const qrcode = require('qrcode');

// Models (ajuste caminhos conforme seu projeto)
const UsuarioModel = require('../model/usuarioModel');
const TiposPixModel = require('../model/tiposPixModel');
const AluguelModel = require('../model/aluguelModel');

function calcularCRC16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ 0x1021);
      else crc <<= 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatarTelefonePix(numero) {
  if (!numero) return '';
  if (numero.startsWith('+55')) return numero;
  const numeros = numero.replace(/[^\d]/g, '');
  return '+55' + numeros;
}

function buildPayloadPix({ tipoPixNome, chavePix, nomeRecebedor, cidade, valor }) {
  let chaveFormatada = chavePix || '';

  if (tipoPixNome === 'Telefone') {
    chaveFormatada = formatarTelefonePix(chaveFormatada);
  } else if (tipoPixNome === 'CPF') {
    chaveFormatada = chaveFormatada.replace(/\D/g, '').padStart(11, '0');
  } else if (tipoPixNome === 'CNPJ') {
    chaveFormatada = chaveFormatada.replace(/\D/g, '').padStart(14, '0');
  }

  const valorFormatado = Number(valor).toFixed(2);
  const nome = (nomeRecebedor || 'RECEBEDOR').substring(0, 25).toUpperCase();
  const cidadeLim = (cidade || 'PRES PRUDENTE').substring(0, 15).toUpperCase();
  const gui = 'BR.GOV.BCB.PIX';
  const infoAdic = '***';

  const mai =
    '00' + gui.length.toString().padStart(2, '0') + gui +
    '01' + chaveFormatada.length.toString().padStart(2, '0') + chaveFormatada;

  const campo26 = '26' + mai.length.toString().padStart(2, '0') + mai;

  const payloadSemCRC =
    '000201' +
    campo26 +
    '52040000' +
    '5303986' +
    '54' + valorFormatado.length.toString().padStart(2, '0') + valorFormatado +
    '5802BR' +
    '59' + nome.length.toString().padStart(2, '0') + nome +
    '60' + cidadeLim.length.toString().padStart(2, '0') + cidadeLim +
    '62' + '07' + '05' + infoAdic.length.toString().padStart(2, '0') + infoAdic +
    '6304';

  const crc = calcularCRC16(payloadSemCRC);
  return payloadSemCRC + crc;
}

function calcularValorComMulta(valorOriginal, dataVencimentoISO) {
  const hoje = new Date();
  const venc = new Date(dataVencimentoISO);
  if (hoje <= venc) return Number(valorOriginal);

  const diffTime = hoje - venc;
  const diffDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const multaDiaria = 0.02 / 30;
  const multa = Number(valorOriginal) * multaDiaria * diffDias;
  const juros = Number(valorOriginal) * 0.01 * diffDias;

  return Number(valorOriginal) + multa + juros;
}

class PixController {

  // GET /pix/payload/:idAluguel
  async payload(req, res) {
    if (!(Number(req.params.idAluguel) > 0)) {
      return res.status(400).json({ message: "Parâmetros inválidos." });
    }

    try {
      const idAluguel = Number(req.params.idAluguel);

      let aluguelModel = new AluguelModel();
      const aluguel = await aluguelModel.obter(idAluguel);
      if (!aluguel) return res.status(404).json({ message: "aluguel não encontrada." });

      let usuarioModel = new UsuarioModel();
      const chaves = await usuarioModel.listarChave();
      if (!chaves || chaves.length === 0) return res.status(500).json({ message: "Chave Pix não configurada." });
      const dadosPix = chaves[0];

      let tiposPixModel = new TiposPixModel();
      const tipo = await tiposPixModel.obter(dadosPix.tipoPix);
      const tipoPixNome = tipo?.nomeTipo || null;

      const valorCorrigido = calcularValorComMulta(aluguel.valorAluguel, aluguel.dataVencimento);
      const payload = buildPayloadPix({
        tipoPixNome,
        chavePix: dadosPix.chavePix,
        nomeRecebedor: dadosPix.nomePix,
        cidade: dadosPix.cidade,
        valor: valorCorrigido
      });

      return res.status(200).json({
        payload,
        valorCorrigido: Number(valorCorrigido),
        vencimento: aluguel.dataVencimento,
        recebedorNome: dadosPix.nomePix,
        chavePix: dadosPix.chavePix,
        tipoPixNome
      });

    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao gerar payload Pix." });
    }
  }

  // GET /pix/qrcode/:idAluguel.png  (original - gera QR com logo)
  async qrcode(req, res) {
    // Importa Jimp dinamicamente dentro da função
    const { default: Jimp } = await import('jimp');

    if (!(Number(req.params.idAluguel) > 0)) {
      return res.status(400).json({ message: "Parâmetros inválidos." });
    }

    try {
      const idAluguel = Number(req.params.idAluguel);

      // 1) aluguel
      let aluguelModel = new AluguelModel();
      const aluguel = await aluguelModel.obter(idAluguel);
      if (!aluguel) return res.status(404).json({ message: "aluguel não encontrada." });

      // 2) Chave Pix
      let usuarioModel = new UsuarioModel();
      const chaves = await usuarioModel.listarChave();
      if (!chaves || chaves.length === 0) return res.status(500).json({ message: "Chave Pix não configurada." });
      const dadosPix = chaves[0];

      // 3) Tipo Pix (nome)
      let tiposPixModel = new TiposPixModel();
      const tipo = await tiposPixModel.obter(dadosPix.tipoPix);
      const tipoPixNome = tipo?.nomeTipo || null;

      // 4) Valor e payload
      const valorCorrigido = calcularValorComMulta(aluguel.valorAluguel, aluguel.dataVencimento);
      const payload = buildPayloadPix({
        tipoPixNome,
        chavePix: dadosPix.chavePix,
        nomeRecebedor: dadosPix.nomePix,
        cidade: dadosPix.cidade,
        valor: valorCorrigido
      });

      // 5) Gerar QR
      const qrOptions = { type: 'png', width: 800, margin: 2, errorCorrectionLevel: 'H' };
      const qrBuffer = await qrcode.toBuffer(payload, qrOptions);
      const qrImage = await Jimp.read(qrBuffer);

      // 6) Logo via URL
      let logo;
      try {
        const logoUrl = req.query.logo || 'https://i.ytimg.com/vi/PDWQQNDTea0/mqdefault.jpg';
        logo = await Jimp.read(logoUrl);
      } catch (errLogo) {
        // Sem logo disponível -> retorna apenas QR
        res.setHeader('Content-Type', 'image/png');
        return res.status(200).end(qrBuffer);
      }

      // 7) Redimensionar e centralizar logo
      const qrSize = Math.min(qrImage.bitmap.width, qrImage.bitmap.height);

      // Aumenta a logo para 30% do QR (antes estava 22%)
      const logoPercent = 0.30;
      const logoSize = Math.floor(qrSize * logoPercent);

      logo.contain(logoSize, logoSize, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);

      // 8) Fundo branco ao redor da logo
      const padding = Math.floor(logoSize * 0.05);
      const bgSize = logoSize + padding * 2;
      const bg = new Jimp(bgSize, bgSize, 0xFFFFFFFF); // fundo branco

      const xCenter = Math.floor((qrImage.bitmap.width - bgSize) / 2);
      const yCenter = Math.floor((qrImage.bitmap.height - bgSize) / 2);

      qrImage.composite(bg, xCenter, yCenter);

      const logoX = xCenter + Math.floor((bgSize - logo.bitmap.width) / 2);
      const logoY = yCenter + Math.floor((bgSize - logo.bitmap.height) / 2);
      qrImage.composite(logo, logoX, logoY, { mode: Jimp.BLEND_SOURCE_OVER, opacitySource: 1 });

      // 9) Exporta PNG final
      const finalBuffer = await qrImage.getBufferAsync(Jimp.MIME_PNG);
      res.setHeader('Content-Type', 'image/png');
      return res.status(200).end(finalBuffer);

    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao gerar QR Code." });
    }
  }

  // GET /pix/payload/avulso/:idPagamento
  async payloadAvulso(req, res) {
    const idPagamento = Number(req.params.idPagamento);
    if (!idPagamento) return res.status(400).json({ message: "Parâmetros inválidos." });

    try {
      // 1) Buscar pagamento avulso
      const PagamentoAvulsoModel = require('../model/pagamentoAvulsoModel');
      let pagamento = new PagamentoAvulsoModel();
      pagamento = await pagamento.obter(idPagamento);
      if (!pagamento) return res.status(404).json({ message: "Pagamento avulso não encontrado." });

      // 2) Buscar chave Pix
      const usuarioModel = new UsuarioModel();
      const chaves = await usuarioModel.listarChave();
      if (!chaves || chaves.length === 0) return res.status(500).json({ message: "Chave Pix não configurada." });
      const dadosPix = chaves[0];

      // 3) Tipo Pix
      const tiposPixModel = new TiposPixModel();
      const tipo = await tiposPixModel.obter(dadosPix.tipoPix);
      const tipoPixNome = tipo?.nomeTipo || null;

      // 4) Valor
      const valor = Number(pagamento.valorPagamento);

      // 5) Montar payload
      const payload = buildPayloadPix({
        tipoPixNome,
        chavePix: dadosPix.chavePix,
        nomeRecebedor: dadosPix.nomePix,
        cidade: dadosPix.cidade,
        valor
      });

      return res.status(200).json({
        payload,
        valor,
        dataPagamento: pagamento.dataPagamento,
        recebedorNome: dadosPix.nomePix,
        chavePix: dadosPix.chavePix,
        tipoPixNome
      });

    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao gerar payload Pix do pagamento avulso." });
    }
  }

  // GET /pix/qrcode/avulso/:idPagamento.png
  async qrcodeAvulso(req, res) {
    const { default: Jimp } = await import('jimp');

    const idPagamento = Number(req.params.idPagamento);
    if (!idPagamento) return res.status(400).json({ message: "Parâmetros inválidos." });

    try {
      // 1) Buscar pagamento avulso
      const pagamentoAvulsoModel = require('../model/pagamentoAvulsoModel');
      let pagamento = new pagamentoAvulsoModel();
      pagamento = await pagamento.obter(idPagamento);
      if (!pagamento) return res.status(404).json({ message: "Pagamento avulso não encontrado." });

      // 2) Buscar chave Pix
      const usuarioModel = new UsuarioModel();
      const chaves = await usuarioModel.listarChave();
      if (!chaves || chaves.length === 0) return res.status(500).json({ message: "Chave Pix não configurada." });
      const dadosPix = chaves[0];

      // 3) Tipo Pix
      const tiposPixModel = new TiposPixModel();
      const tipo = await tiposPixModel.obter(dadosPix.tipoPix);
      const tipoPixNome = tipo?.nomeTipo || null;

      // 4) Montar payload
      const valor = Number(pagamento.valorPagamento);
      const payload = buildPayloadPix({
        tipoPixNome,
        chavePix: dadosPix.chavePix,
        nomeRecebedor: dadosPix.nomePix,
        cidade: dadosPix.cidade,
        valor
      });

      // 5) Gerar QR
      const qrOptions = { type: 'png', width: 800, margin: 2, errorCorrectionLevel: 'H' };
      const qrBuffer = await qrcode.toBuffer(payload, qrOptions);
      const qrImage = await Jimp.read(qrBuffer);

      // 6) Logo via URL
      let logo;
      try {
        const logoUrl = req.query.logo || 'https://i.ytimg.com/vi/PDWQQNDTea0/mqdefault.jpg';
        logo = await Jimp.read(logoUrl);
      } catch (errLogo) {
        res.setHeader('Content-Type', 'image/png');
        return res.status(200).end(qrBuffer);
      }

      // 7) Redimensionar e centralizar logo
      const qrSize = Math.min(qrImage.bitmap.width, qrImage.bitmap.height);
      const logoPercent = 0.30;
      const logoSize = Math.floor(qrSize * logoPercent);
      logo.contain(logoSize, logoSize, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);

      const padding = Math.floor(logoSize * 0.05);
      const bgSize = logoSize + padding * 2;
      const bg = new Jimp(bgSize, bgSize, 0xFFFFFFFF);

      const xCenter = Math.floor((qrImage.bitmap.width - bgSize) / 2);
      const yCenter = Math.floor((qrImage.bitmap.height - bgSize) / 2);

      qrImage.composite(bg, xCenter, yCenter);
      const logoX = xCenter + Math.floor((bgSize - logo.bitmap.width) / 2);
      const logoY = yCenter + Math.floor((bgSize - logo.bitmap.height) / 2);
      qrImage.composite(logo, logoX, logoY, { mode: Jimp.BLEND_SOURCE_OVER, opacitySource: 1 });

      const finalBuffer = await qrImage.getBufferAsync(Jimp.MIME_PNG);
      res.setHeader('Content-Type', 'image/png');
      return res.status(200).end(finalBuffer);

    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao gerar QR Code do pagamento avulso." });
    }
  }

  // Versões Async utilizadas internamente / por outras camadas (retornam dados)
  async payloadAsync(idAluguel) {
    if (!(Number(idAluguel) > 0)) throw new Error("Parâmetros inválidos.");

    const aluguelModel = new AluguelModel();
    const aluguel = await aluguelModel.obter(Number(idAluguel));
    if (!aluguel) throw new Error("Aluguel não encontrado.");

    const usuarioModel = new UsuarioModel();
    const chaves = await usuarioModel.listarChave();
    if (!chaves || chaves.length === 0) throw new Error("Chave Pix não configurada.");
    const dadosPix = chaves[0];

    const tiposPixModel = new TiposPixModel();
    const tipo = await tiposPixModel.obter(dadosPix.tipoPix);
    const tipoPixNome = tipo?.nomeTipo || null;

    const valorCorrigido = calcularValorComMulta(aluguel.valorAluguel, aluguel.dataVencimento);
    const payload = buildPayloadPix({
      tipoPixNome,
      chavePix: dadosPix.chavePix,
      nomeRecebedor: dadosPix.nomePix,
      cidade: dadosPix.cidade,
      valor: valorCorrigido
    });

    return { payload, valorCorrigido, vencimento: aluguel.dataVencimento, recebedorNome: dadosPix.nomePix, chavePix: dadosPix.chavePix };
  }

  // Retorna payload para pagamento avulso sem enviar resposta HTTP
  async payloadAvulsoAsync(idPagamento) {
    const pagamentoAvulsoModel = require('../model/pagamentoAvulsoModel');
    const id = Number(idPagamento);
    if (!id) throw new Error("Parâmetros inválidos.");

    const pagamento = await new pagamentoAvulsoModel().obter(id);
    if (!pagamento) throw new Error("Pagamento avulso não encontrado.");

    const usuarioModel = new UsuarioModel();
    const chaves = await usuarioModel.listarChave();
    if (!chaves || chaves.length === 0) throw new Error("Chave Pix não configurada.");
    const dadosPix = chaves[0];

    const tiposPixModel = new TiposPixModel();
    const tipo = await tiposPixModel.obter(dadosPix.tipoPix);
    const tipoPixNome = tipo?.nomeTipo || null;

    const valor = Number(pagamento.valorPagamento);
    const payload = buildPayloadPix({
      tipoPixNome,
      chavePix: dadosPix.chavePix,
      nomeRecebedor: dadosPix.nomePix,
      cidade: dadosPix.cidade,
      valor
    });

    return { payload, valor, dataPagamento: pagamento.dataPagamento, recebedorNome: dadosPix.nomePix, chavePix: dadosPix.chavePix };
  }

  // ---------------------------
  // --- NOVOS MÉTODOS: IFRAME ---
  // ---------------------------

  // GET /pix/iframe/:idAluguel
  // Gera HTML com a imagem do QR embutida (data URL). Suporta ?logo=<url> para tentar compor logo.
  async iframePorAluguel(req, res) {
    const { default: Jimp } = await import('jimp').catch(() => ({})); // jimp é opcional apenas para compor logo
    try {
      const idAluguel = req.params.idAluguel;
      const r = await this.payloadAsync(idAluguel);
      const payload = r.payload;

      // Se houver query.logo tente compor com Jimp; caso contrário use toDataURL direto
      const logoUrl = 'https://i.ytimg.com/vi/PDWQQNDTea0/mqdefault.jpg';

      let dataUrl;
      if (logoUrl && Jimp) {
        try {
          const qrBuffer = await qrcode.toBuffer(payload, { type: 'png', width: 600, margin: 2, errorCorrectionLevel: 'H' });
          const qrImage = await Jimp.read(qrBuffer);
          let logo = await Jimp.read(logoUrl);

          const qrSize = Math.min(qrImage.bitmap.width, qrImage.bitmap.height);
          const logoPercent = 0.30;
          const logoSize = Math.floor(qrSize * logoPercent);
          logo.contain(logoSize, logoSize, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);

          const padding = Math.floor(logoSize * 0.05);
          const bgSize = logoSize + padding * 2;
          const bg = new Jimp(bgSize, bgSize, 0xFFFFFFFF);

          const xCenter = Math.floor((qrImage.bitmap.width - bgSize) / 2);
          const yCenter = Math.floor((qrImage.bitmap.height - bgSize) / 2);

          qrImage.composite(bg, xCenter, yCenter);
          const logoX = xCenter + Math.floor((bgSize - logo.bitmap.width) / 2);
          const logoY = yCenter + Math.floor((bgSize - logo.bitmap.height) / 2);
          qrImage.composite(logo, logoX, logoY, { mode: Jimp.BLEND_SOURCE_OVER, opacitySource: 1 });

          const finalBuffer = await qrImage.getBufferAsync(Jimp.MIME_PNG);
          dataUrl = `data:image/png;base64,${finalBuffer.toString('base64')}`;
        } catch (errLogoCompose) {
          // fallback para toDataURL
          console.warn('Erro ao compor logo, usando fallback toDataURL:', errLogoCompose);
          dataUrl = await qrcode.toDataURL(payload, { width: 260, errorCorrectionLevel: 'H' });
        }
      } else {
        dataUrl = await qrcode.toDataURL(payload, { width: 260, errorCorrectionLevel: 'H' });
      }

      const html = this._gerarIframeHTMLDataUrl(dataUrl, payload, 'Pagamento via Pix');

      res.set('Content-Type', 'text/html');
      return res.status(200).send(html);
    } catch (e) {
      console.error('iframePorAluguel error:', e);
      return res.status(500).send('Erro ao gerar iframe Pix');
    }
  }

  // GET /pix/iframe/avulso/:idPagamento
  async iframePorPagamentoAvulso(req, res) {
    const { default: Jimp } = await import('jimp').catch(() => ({}));
    try {
      const idPagamento = req.params.idPagamento;
      const r = await this.payloadAvulsoAsync(idPagamento);
      const payload = r.payload;

      const logoUrl = req.query.logo;

      let dataUrl;
      if (logoUrl && Jimp) {
        try {
          const qrBuffer = await qrcode.toBuffer(payload, { type: 'png', width: 800, margin: 2, errorCorrectionLevel: 'H' });
          const qrImage = await Jimp.read(qrBuffer);
          let logo = await Jimp.read(logoUrl);

          const qrSize = Math.min(qrImage.bitmap.width, qrImage.bitmap.height);
          const logoPercent = 0.30;
          const logoSize = Math.floor(qrSize * logoPercent);
          logo.contain(logoSize, logoSize, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);

          const padding = Math.floor(logoSize * 0.05);
          const bgSize = logoSize + padding * 2;
          const bg = new Jimp(bgSize, bgSize, 0xFFFFFFFF);

          const xCenter = Math.floor((qrImage.bitmap.width - bgSize) / 2);
          const yCenter = Math.floor((qrImage.bitmap.height - bgSize) / 2);

          qrImage.composite(bg, xCenter, yCenter);
          const logoX = xCenter + Math.floor((bgSize - logo.bitmap.width) / 2);
          const logoY = yCenter + Math.floor((bgSize - logo.bitmap.height) / 2);
          qrImage.composite(logo, logoX, logoY, { mode: Jimp.BLEND_SOURCE_OVER, opacitySource: 1 });

          const finalBuffer = await qrImage.getBufferAsync(Jimp.MIME_PNG);
          dataUrl = `data:image/png;base64,${finalBuffer.toString('base64')}`;
        } catch (errLogoCompose) {
          console.warn('Erro ao compor logo, usando fallback toDataURL:', errLogoCompose);
          dataUrl = await qrcode.toDataURL(payload, { width: 260, errorCorrectionLevel: 'H' });
        }
      } else {
        dataUrl = await qrcode.toDataURL(payload, { width: 260, errorCorrectionLevel: 'H' });
      }

      const html = this._gerarIframeHTMLDataUrl(dataUrl, payload, 'Pagamento Avulso via Pix');

      res.set('Content-Type', 'text/html');
      return res.status(200).send(html);
    } catch (e) {
      console.error('iframePorPagamentoAvulso error:', e);
      return res.status(500).send('Erro ao gerar iframe Pix Avulso');
    }
  }

  _gerarIframeHTMLDataUrl(dataUrl, payload, titulo) {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>${titulo}</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: sans-serif;
            margin: 0;
            padding: 16px;
            background: #f9fafb;
          }
          img {
            width: 230px;
            height: 230px;
            margin-bottom: 12px;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" alt="QR Code Pix">
      </body>
      </html>
    `;
  }
}

module.exports = PixController;

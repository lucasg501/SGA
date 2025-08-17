const qrcode = require('qrcode');
const UsuarioModel = require('../model/usuarioModel');
const TiposPixModel = require('../model/tiposPixModel');
const AluguelModel = require('../model/aluguelModel');
const { info } = require('console');
const ImovelModel = require('../model/imovelModel');
const ContratoModel = require('../model/contratoModel');

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

function buildPayloadPix({ tipoPixNome, chavePix, nomeRecebedor, cidade, valor, infoAdic }) {
  const byteLen = (s) => Buffer.byteLength(s ?? '', 'utf8');
  const pad2 = (n) => String(n).padStart(2, '0');
  const removeAcentos = (s) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const sanitize = (s) => removeAcentos(s || '').replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

  let chaveFormatada = chavePix || '';
  if (tipoPixNome === 'Telefone') {
    chaveFormatada = formatarTelefonePix(chaveFormatada);
  } else if (tipoPixNome === 'CPF') {
    chaveFormatada = chaveFormatada.replace(/\D/g, '').padStart(11, '0');
  } else if (tipoPixNome === 'CNPJ') {
    chaveFormatada = chaveFormatada.replace(/\D/g, '').padStart(14, '0');
  }

  const valorFormatado = Number(valor).toFixed(2); // ex: "156.00"
  const nome = sanitize(nomeRecebedor || 'RECEBEDOR').substring(0, 25).toUpperCase();
  const cidadeLim = sanitize(cidade || 'PRES PRUDENTE').substring(0, 15).toUpperCase();
  const gui = 'BR.GOV.BCB.PIX';

  const guiTag = '00' + pad2(byteLen(gui)) + gui;
  const chaveTag = '01' + pad2(byteLen(chaveFormatada)) + chaveFormatada;
  const mai = guiTag + chaveTag;
  const campo26 = '26' + pad2(byteLen(mai)) + mai;

  let campo62 = '';
  if (infoAdic && String(infoAdic).trim().length > 0) {
    let infoLimpa = removeAcentos(String(infoAdic))
      .replace(/[^A-Za-z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (infoLimpa.length > 0) {
      const sub05 = '05' + pad2(byteLen(infoLimpa)) + infoLimpa;
      campo62 = '62' + pad2(byteLen(sub05)) + sub05;
    }
  }

  const field52 = '52040000'; // MCC
  const field53 = '5303986';  // BRL
  const field54 = '54' + pad2(byteLen(valorFormatado)) + valorFormatado;
  const field58 = '58' + pad2(byteLen('BR')) + 'BR';
  const field59 = '59' + pad2(byteLen(nome)) + nome;
  const field60 = '60' + pad2(byteLen(cidadeLim)) + cidadeLim;

  const payloadSemCRC =
    '000201' +
    campo26 +
    field52 +
    field53 +
    field54 +
    field58 +
    field59 +
    field60 +
    campo62 +
    '6304';

  const crc = calcularCRC16(payloadSemCRC);
  return payloadSemCRC + crc;
}



async function calcularValorComMulta(valorOriginal, dataVencimentoISO, idContrato) {
  const hoje = new Date();
  const venc = new Date(dataVencimentoISO);
  if (hoje <= venc) return Number(valorOriginal);

  let contratoModel = new ContratoModel();
  let contrato = await contratoModel.obter(idContrato);

  const multaPercent = contrato?.multa ? parseFloat(contrato.multa) : 0.02;
  const jurosPercentDia = contrato?.juros ? parseFloat(contrato.juros) : 0.01;

  const diffTime = hoje - venc;
  const diffDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const multa = Number(valorOriginal) * multaPercent; // aplicada uma vez
  const juros = Number(valorOriginal) * jurosPercentDia * diffDias; // por dia de atraso

  return Number(valorOriginal) + multa + juros;
}


class PixController {
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

      const contratoModel = new ContratoModel();
      const contrato = await contratoModel.obter(aluguel.idContrato);
      const imovelModel = new ImovelModel();
      const imovel = await imovelModel.obter(contrato.idImovel);

      let infoAdic = `${aluguel.idAluguel} - ${imovel.refImovel}`;
      infoAdic = infoAdic.replace(/[^a-zA-Z0-9-]/g, '');
      infoAdic = infoAdic.replace(/\s+/g, '');

      const valorCorrigido = await calcularValorComMulta(aluguel.valorAluguel, aluguel.dataVencimento, aluguel.idContrato);
      const payload = buildPayloadPix({
        tipoPixNome,
        chavePix: dadosPix.chavePix,
        nomeRecebedor: dadosPix.nomePix,
        cidade: dadosPix.cidade,
        valor: valorCorrigido,
        infoAdic,
      });

      return res.status(200).json({
        payload,
        valorCorrigido: Number(valorCorrigido),
        vencimento: aluguel.dataVencimento,
        recebedorNome: dadosPix.nomePix,
        chavePix: dadosPix.chavePix,
        tipoPixNome,
        cidade: dadosPix.cidade,
        infoAdic: aluguel.idAluguel,
        idAluguel: aluguel.idAluguel,
        refImovel: aluguel.idImovel
      });

    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao gerar payload Pix." });
    }
  }
  async qrcode(req, res) {
    const { default: Jimp } = await import('jimp');

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

      const valorCorrigido = calcularValorComMulta(aluguel.valorAluguel, aluguel.dataVencimento, aluguel.idContrato);
      const payload = buildPayloadPix({
        tipoPixNome,
        chavePix: dadosPix.chavePix,
        nomeRecebedor: dadosPix.nomePix,
        cidade: dadosPix.cidade,
        valor: valorCorrigido,
        infoAdic: `${aluguel.idAluguel} - ${aluguel.idImovel}`,
      });

      const qrOptions = { type: 'png', width: 800, margin: 2, errorCorrectionLevel: 'H' };
      const qrBuffer = await qrcode.toBuffer(payload, qrOptions);
      const qrImage = await Jimp.read(qrBuffer);

      let logo;
      try {
        const logoUrl = req.query.logo || 'https://i.ytimg.com/vi/PDWQQNDTea0/mqdefault.jpg';
        logo = await Jimp.read(logoUrl);
      } catch (errLogo) {
        res.setHeader('Content-Type', 'image/png');
        return res.status(200).end(qrBuffer);
      }

      const qrSize = Math.min(qrImage.bitmap.width, qrImage.bitmap.height);

      const logoPercent = 0.30;
      const logoSize = Math.floor(qrSize * logoPercent);

      logo.contain(logoSize, logoSize, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);

      const padding = Math.floor(logoSize * 0.05);
      const bgSize = logoSize + padding * 2;
      const bg = new Jimp(bgSize, bgSize, 0xFFFFFFFF); // fundo branco

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
      return res.status(500).json({ message: "Erro ao gerar QR Code." });
    }
  }

  async payloadAvulso(req, res) {
    const idPagamento = Number(req.params.idPagamento);
    if (!idPagamento) return res.status(400).json({ message: "Parâmetros inválidos." });

    try {
      const PagamentoAvulsoModel = require('../model/pagamentoAvulsoModel');
      let pagamentoModel = new PagamentoAvulsoModel();
      const pagamento = await pagamentoModel.obter(idPagamento);
      if (!pagamento) return res.status(404).json({ message: "Pagamento avulso não encontrado." });

      const UsuarioModel = require('../model/usuarioModel');
      const usuarioModel = new UsuarioModel();
      const chaves = await usuarioModel.listarChave();
      if (!chaves || chaves.length === 0) return res.status(500).json({ message: "Chave Pix não configurada." });
      const dadosPix = chaves[0];

      const TiposPixModel = require('../model/tiposPixModel');
      const tiposPixModel = new TiposPixModel();
      const tipo = await tiposPixModel.obter(dadosPix.tipoPix);
      const tipoPixNome = tipo?.nomeTipo || null;

      const ContratoModel = require('../model/contratoModel');
      const contratoModel = new ContratoModel();
      const contrato = await contratoModel.obter(pagamento.idContrato);
      if (!contrato) return res.status(404).json({ message: "Contrato não encontrado para este pagamento." });

      const ImovelModel = require('../model/imovelModel');
      const imovelModel = new ImovelModel();
      const imovel = await imovelModel.obter(contrato.idImovel);
      const refImovel = imovel?.refImovel || '';

      const valor = Number(pagamento.valorPagamento);

      let infoAdic = `${pagamento.descricao}`
      infoAdic = infoAdic.replace(/[^a-zA-Z0-9-]/g, '').replace(/\s+/g, '');

      const payload = buildPayloadPix({
        tipoPixNome,
        chavePix: dadosPix.chavePix,
        nomeRecebedor: dadosPix.nomePix,
        cidade: dadosPix.cidade,
        valor: valor,
        infoAdic,
      });

      return res.status(200).json({
        payload,
        dataPagamento: pagamento.dataPagamento,
        recebedorNome: dadosPix.nomePix,
        chavePix: dadosPix.chavePix,
        tipoPixNome,
        cidade: dadosPix.cidade,
        infoAdic,
        idPagamento: pagamento.idPagamento,
        refImovel
      });

    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Erro ao gerar payload Pix do pagamento avulso." });
    }
  }
  async qrcodeAvulso(req, res) {
    const { default: Jimp } = await import('jimp');

    const idPagamento = Number(req.params.idPagamento);
    if (!idPagamento) return res.status(400).json({ message: "Parâmetros inválidos." });

    try {
      const pagamentoAvulsoModel = require('../model/pagamentoAvulsoModel');
      let pagamento = new pagamentoAvulsoModel();
      pagamento = await pagamento.obter(idPagamento);
      if (!pagamento) return res.status(404).json({ message: "Pagamento avulso não encontrado." });

      const usuarioModel = new UsuarioModel();
      const chaves = await usuarioModel.listarChave();
      if (!chaves || chaves.length === 0) return res.status(500).json({ message: "Chave Pix não configurada." });
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
        valor: valorCorrigido,
        infoAdic: `${pagamento.descricao}`,
      });

      const qrOptions = { type: 'png', width: 800, margin: 2, errorCorrectionLevel: 'H' };
      const qrBuffer = await qrcode.toBuffer(payload, qrOptions);
      const qrImage = await Jimp.read(qrBuffer);

      let logo;
      try {
        const logoUrl = req.query.logo || 'https://i.ytimg.com/vi/PDWQQNDTea0/mqdefault.jpg';
        logo = await Jimp.read(logoUrl);
      } catch (errLogo) {
        res.setHeader('Content-Type', 'image/png');
        return res.status(200).end(qrBuffer);
      }

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
  async payloadAsync(idAluguel) {
    if (!(Number(idAluguel) > 0)) throw new Error("Parâmetros inválidos.");

    const aluguelModel = new AluguelModel();
    const aluguel = await aluguelModel.obter(Number(idAluguel));
    if (!aluguel) throw new Error("Aluguel não encontrado.");

    const contratoModel = new ContratoModel();
    const contrato = await contratoModel.obter(aluguel.idContrato);
    if (!contrato) throw new Error("Contrato nao encontrado.");

    const imovelModel = new ImovelModel();
    const imovel = await imovelModel.obter(contrato.idImovel);
    if (!imovel) throw new Error("Imovel nao encontrado.");

    const usuarioModel = new UsuarioModel();
    const chaves = await usuarioModel.listarChave();
    if (!chaves || chaves.length === 0) throw new Error("Chave Pix não configurada.");
    const dadosPix = chaves[0];

    const tiposPixModel = new TiposPixModel();
    const tipo = await tiposPixModel.obter(dadosPix.tipoPix);
    const tipoPixNome = tipo?.nomeTipo || null;

    let infoAdic = `${aluguel.idAluguel} - ${imovel.refImovel}`;
    infoAdic = infoAdic.replace(/[^a-zA-Z0-9-]/g, '');
    infoAdic = infoAdic.replace(/\s+/g, '');


    const valorCorrigido = await calcularValorComMulta(aluguel.valorAluguel, aluguel.dataVencimento, aluguel.idContrato);
    const payload = buildPayloadPix({
      tipoPixNome,
      chavePix: dadosPix.chavePix,
      nomeRecebedor: dadosPix.nomePix,
      cidade: dadosPix.cidade,
      valor: valorCorrigido,
      infoAdic
    });

    return {
      payload,
      valorCorrigido,
      vencimento: aluguel.dataVencimento,
      recebedorNome: dadosPix.nomePix,
      chavePix: dadosPix.chavePix,
      idAluguel: aluguel.idAluguel,
      refImovel: imovel.refImovel
    };
  }

  async iframePorAluguel(req, res) {
    const { default: Jimp } = await import('jimp').catch(() => ({}));
    try {
      const idAluguel = req.params.idAluguel;
      const r = await this.payloadAsync(idAluguel);
      const payload = r.payload;

      const logoUrl = 'https://i.ytimg.com/vi/PDWQQNDTea0/mqdefault.jpg';

      let svg;
      if (logoUrl && Jimp) {
        try {
          const qrBuffer = await qrcode.toBuffer(payload, { type: 'png', width: 600, margin: 2, errorCorrectionLevel: 'H' });
          const qrImage = await Jimp.read(qrBuffer);
          const logo = await Jimp.read(logoUrl);

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
          const base64Img = finalBuffer.toString('base64');
          svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="260" height="260">
            <image href="data:image/png;base64,${base64Img}" width="260" height="260"/>
          </svg>
        `;
        } catch (errLogoCompose) {
          console.warn('Erro ao compor logo, usando fallback SVG:', errLogoCompose);
          svg = await qrcode.toString(payload, { type: 'svg', width: 260, errorCorrectionLevel: 'H' });
        }
      } else {
        svg = await qrcode.toString(payload, { type: 'svg', width: 260, errorCorrectionLevel: 'H' });
      }

      const html = this._gerarIframeHTMLSVG(svg, 'Pagamento via Pix');

      res.set('Content-Type', 'text/html');
      return res.status(200).send(html);
    } catch (e) {
      console.error('iframePorAluguel error:', e);
      return res.status(500).send('Erro ao gerar iframe Pix');
    }
  }

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

    // Mantém a descrição completa como infoAdic, sem remover caracteres
    const infoAdic = (pagamento.descricao || '')
      .normalize('NFD')                   // remove acentos
      .replace(/[\u0300-\u036f]/g, '')    // remove diacríticos
      .replace(/\s+/g, '')                // remove espaços
      .trim();

    const valor = Number(pagamento.valorPagamento);

    const payload = buildPayloadPix({
      tipoPixNome,
      chavePix: dadosPix.chavePix,
      nomeRecebedor: dadosPix.nomePix,
      cidade: dadosPix.cidade,
      valor,
      infoAdic
    });

    return {
      payload,
      valor,
      dataPagamento: pagamento.dataPagamento,
      recebedorNome: dadosPix.nomePix,
      chavePix: dadosPix.chavePix,
      idPagamento: pagamento.idPagamento,
      descricao: pagamento.descricao
    };
  }


  async iframePorPagamentoAvulso(req, res) {
    const { default: Jimp } = await import('jimp').catch(() => ({}));
    try {
      const idPagamento = req.params.idPagamento;
      const r = await this.payloadAvulsoAsync(idPagamento);
      const payload = r.payload; // usa o payload direto, sem limpar infoAdic

      const logoUrl = 'https://i.ytimg.com/vi/PDWQQNDTea0/mqdefault.jpg';
      let svg;

      if (logoUrl && Jimp) {
        try {
          const qrBuffer = await qrcode.toBuffer(payload, { type: 'png', width: 600, margin: 2, errorCorrectionLevel: 'H' });
          const qrImage = await Jimp.read(qrBuffer);
          const logo = await Jimp.read(logoUrl);

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
          const base64Img = finalBuffer.toString('base64');

          svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="260" height="260">
          <image href="data:image/png;base64,${base64Img}" width="260" height="260"/>
        </svg>
      `;
        } catch (errLogoCompose) {
          console.warn('Erro ao compor logo, usando fallback SVG:', errLogoCompose);
          svg = await qrcode.toString(payload, { type: 'svg', width: 260, errorCorrectionLevel: 'H' });
        }
      } else {
        svg = await qrcode.toString(payload, { type: 'svg', width: 260, errorCorrectionLevel: 'H' });
      }

      const html = this._gerarIframeHTMLSVG(svg, 'Pagamento Avulso via Pix');

      res.set('Content-Type', 'text/html');
      return res.status(200).send(html);

    } catch (e) {
      console.error('iframePorPagamentoAvulso error:', e);
      return res.status(500).send('Erro ao gerar iframe Pix Avulso');
    }
  }

  _gerarIframeHTMLSVG(svgContent, payload, titulo) {
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
        padding: 10px;
        background: #f9fafb;
      }
      svg {
        width: 250px;
        height: 250px;
        margin-bottom: 12px;
        border-radius: 8px;
      }
      p {
        font-size: 12px;
        word-break: break-all;
        text-align: center;
        max-width: 260px;
        background: #fff;
        padding: 6px 10px;
        border-radius: 6px;
        box-shadow: 0 0 2px rgba(0,0,0,0.2);
      }
    </style>
  </head>
  <body>
    ${svgContent}
  </body>
  </html>
  `;
  }

}

module.exports = PixController;

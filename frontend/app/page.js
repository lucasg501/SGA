'use client'
import { useEffect, useRef, useState } from "react";
import httpClient from "./utils/httpClient";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {
  const cpfLocatario = useRef(null);
  const [listaParcelas, setListaParcelas] = useState([]);
  const [parcelaQRAtiva, setParcelaQRAtiva] = useState(null);
  const [dadosPix, setDadosPix] = useState(null);

  // Carregar dados PIX do backend
  function carregarDadosPix() {
    return httpClient.get('/usuarios/listarChave')
      .then(r => {
        if (r.status === 200) return r.json();
        alert('Erro ao listar chaves.');
        return null;
      })
      .then(data => {
        if (data && data.length > 0) {
          setDadosPix(data[0]);
          return data[0];
        }
        return null;
      });
  }

  function procurarParcelas(cpf) {
    httpClient.get(`/aluguel/obterAlugueis/${cpf}`)
      .then(r => {
        if (r.status === 200) return r.json();
        alert('Erro ao listar parcelas.');
        return null;
      })
      .then(data => {
        if (data) setListaParcelas(data);
      });
  }

  useEffect(() => {
    carregarDadosPix();
  }, []);

  // Calcula CRC16 CCITT-FALSE (padrão PIX)
  function calcularCRC16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021);
        } else {
          crc <<= 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  // Função PIX que funciona perfeitamente:
  function gerarPayloadPix(
    valor,
    chavePix = dadosPix?.chavePix ? (dadosPix.chavePix.startsWith('+') ? dadosPix.chavePix : '+' + dadosPix.chavePix) : "+5518996570042",
    nomeRecebedor = dadosPix?.nomePix || "LUCAS GOIS"
  ) {
    const valorFormatado = parseFloat(valor).toFixed(2);
    const cidade = "PRES PRUDENTE";
    const nome = nomeRecebedor.substring(0, 25).toUpperCase();
    const cidadeLimite = cidade.substring(0, 15).toUpperCase();
    const gui = "BR.GOV.BCB.PIX";
    const infoAdicional = "***";

    const merchantAccountInfo =
      "00" + gui.length.toString().padStart(2, '0') + gui +
      "01" + chavePix.length.toString().padStart(2, '0') + chavePix;

    const campo26 = "26" + merchantAccountInfo.length.toString().padStart(2, '0') + merchantAccountInfo;

    const payloadSemCRC =
      "000201" +
      campo26 +
      "52040000" +
      "5303986" +
      "54" + valorFormatado.length.toString().padStart(2, '0') + valorFormatado +
      "5802BR" +
      "59" + nome.length.toString().padStart(2, '0') + nome +
      "60" + cidadeLimite.length.toString().padStart(2, '0') + cidadeLimite +
      "62" + "07" +
      "05" + infoAdicional.length.toString().padStart(2, '0') + infoAdicional +
      "6304";

    const crc = calcularCRC16(payloadSemCRC);
    return payloadSemCRC + crc;
  }

  function fecharModal() {
    setParcelaQRAtiva(null);
  }

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Verificar as parcelas pelo CPF</h1>

      {listaParcelas.length === 0 ? (
        <div style={{ width: "400px", margin: "0 auto", border: "1px solid #ccc", padding: "10px", borderRadius: 10 }} className="form form-group">
          <label>Informe seu CPF</label>
          <input type="text" className="form-control" placeholder="000.000.000-00" ref={cpfLocatario} />
          <button style={{ marginTop: "10px", width: "100%" }} className="btn btn-primary" onClick={() => procurarParcelas(cpfLocatario.current.value)}>Procurar</button>
        </div>
      ) : (
        <div>
          <button style={{ margin: 10 }} onClick={() => { window.location.reload() }} className="btn btn-primary">Novo CPF</button>
        </div>
      )}

      {listaParcelas.length > 0 && (
        <table style={{ width: "95%", margin: "0 auto", border: "1px solid #ccc", padding: "10px", borderRadius: 10 }} className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Parcela</th>
              <th scope="col">Vencimento</th>
              <th scope="col">Valor</th>
              <th scope="col">Status</th>
              <th scope="col">PIX</th>
            </tr>
          </thead>
          <tbody>
            {listaParcelas.map((value, index) => (
              <tr key={index} style={{ position: "relative" }}>
                <td>{index + 1}</td>
                <td>{'Ainda não tem vencimento'}</td>
                <td>{value.valorAluguel}</td>
                <td>{value.quitada}</td>
                <td>
                  {
                    value.quitada == "N" || value.quitada == 'n' ? 
                    <button className="btn btn-secondary" onClick={() => { carregarDadosPix().then(() => { setParcelaQRAtiva({ ...value, index }); });}}>
                    Gerar QR Code
                  </button>
                  :
                  <p style={{ color: 'green' }}>Fatura Quitada</p>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {parcelaQRAtiva && (
        <div
          onClick={fecharModal}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 8,
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              textAlign: 'center',
              minWidth: 280,
              position: 'relative',
            }}
          >
            <h3>Parcela #{parcelaQRAtiva.index + 1}</h3>
            <QRCodeCanvas value={gerarPayloadPix(parcelaQRAtiva.valorAluguel)} size={200} />
            <div style={{ marginTop: 10, fontWeight: 'bold' }}>
              R${parseFloat(parcelaQRAtiva.valorAluguel).toFixed(2)}
            </div>
            <button
              onClick={fecharModal}
              style={{
                marginTop: 15,
                padding: '5px 10px',
                cursor: 'pointer',
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

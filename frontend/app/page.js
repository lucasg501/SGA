'use client'
import { useEffect, useRef, useState } from "react";
import httpClient from "./utils/httpClient";
import { QRCodeCanvas } from "qrcode.react";

export default function Home() {
  const cpfLocatario = useRef(null);
  const [cpfFormatado, setCpfFormatado] = useState("");
  const [listaParcelas, setListaParcelas] = useState([]);
  const [parcelaQRAtiva, setParcelaQRAtiva] = useState(null);
  const [dadosPix, setDadosPix] = useState(null);
  const [listaTiposPix, setListaTiposPix] = useState([]);

  function formatarCPF(valor) {
    return valor
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function handleChangeCPF(e) {
    setCpfFormatado(formatarCPF(e.target.value));
  }

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

  function carregarTiposPix() {
    return httpClient.get('/tiposPix/listar')
      .then(r => {
        if (r.status === 200) return r.json();
        alert('Erro ao listar tipos Pix.');
        return [];
      })
      .then(data => {
        setListaTiposPix(data || []);
      });
  }

  function procurarParcelas(cpfFormatado) {
    const cpfLimpo = cpfFormatado.replace(/\D/g, "");
    httpClient.get(`/aluguel/obterAlugueis/${cpfLimpo}`)
      .then(r => {
        if (r.status === 200) return r.json();
        alert('Erro ao listar parcelas.');
        return null;
      })
      .then(data => {
        if (!data || data.length === 0) {
          alert('Nenhuma parcela encontrada.');
          setListaParcelas([]);
        } else {
          setListaParcelas(data);
        }
      });
  }

  useEffect(() => {
    carregarDadosPix();
    carregarTiposPix();
  }, []);

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

  // Função para formatar telefone no padrão +55... se não tiver
  function formatarTelefonePix(numero) {
    if (numero.startsWith('+55')) return numero;
    // Remove tudo que não for número
    const numeros = numero.replace(/[^\d]/g, '');
    return '+55' + numeros;
  }

  function gerarPayloadPix(valor) {
    if (!dadosPix) return '';

    const tipoPixObj = listaTiposPix.find(tp => tp.idTipo === dadosPix.tipoPix);
    const tipoPixNome = tipoPixObj ? tipoPixObj.nomeTipo : null;

    let chaveFormatada = dadosPix.chavePix;

    if (tipoPixNome === "Telefone") {
      // Use a chave original para evitar duplicação do +55
      chaveFormatada = formatarTelefonePix(chaveFormatada);
    } else if (tipoPixNome === "CPF") {
      chaveFormatada = dadosPix.chavePix.replace(/\D/g, '').padStart(11, '0'); // só números, 11 dígitos
    } else if (tipoPixNome === "CNPJ") {
      chaveFormatada = dadosPix.chavePix.replace(/\D/g, '').padStart(14, '0'); // só números, 14 dígitos
    } else if (tipoPixNome === "E-mail") {
      // usa direto, sem alteração
    } else {
      // Caso padrão usa chave como está
    }

    const valorFormatado = parseFloat(valor).toFixed(2);
    const cidade = (dadosPix?.cidade || "PRES PRUDENTE").substring(0, 15).toUpperCase();
    const nome = (dadosPix.nomePix || "LUCAS GOIS").substring(0, 25).toUpperCase();
    const cidadeLimite = cidade.substring(0, 15).toUpperCase();
    const gui = "BR.GOV.BCB.PIX";
    const infoAdicional = "***";

    const merchantAccountInfo =
      "00" + gui.length.toString().padStart(2, '0') + gui +
      "01" + chaveFormatada.length.toString().padStart(2, '0') + chaveFormatada;

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

  function formatarData(dataVencimento) {
    return new Date(dataVencimento)
      .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function calcularValorComMulta(valorOriginal, dataVencimento) {
    const hoje = new Date();
    const venc = new Date(dataVencimento);
    if (hoje <= venc) return parseFloat(valorOriginal);

    const diffTime = hoje - venc;
    const diffDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const multaDiaria = 0.02 / 30;
    const multa = valorOriginal * multaDiaria * diffDias;

    const juros = valorOriginal * 0.01 * diffDias;

    return parseFloat(valorOriginal) + multa + juros;
  }

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',    // centraliza verticalmente
      alignItems: 'center',        // centraliza horizontalmente
    }}>
      <h1 style={{ textAlign: "center" }}>Verificar as parcelas pelo CPF</h1>

      {listaParcelas.length === 0 ? (
        <div style={{ width: "400px", margin: "0 auto", border: "1px solid #ccc", padding: "10px", borderRadius: 10 }} className="form form-group">
          <label>Informe seu CPF</label>
          <input type="text" className="form-control" placeholder="000.000.000-00" value={cpfFormatado} onChange={handleChangeCPF} ref={cpfLocatario} maxLength={14} />
          <button style={{ marginTop: "10px", width: "100%" }} className="btn btn-primary" onClick={() => procurarParcelas(cpfFormatado)}>Procurar</button>
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
            {listaParcelas.map((value, index) => {
              const venc = new Date(value.dataVencimento);
              const hoje = new Date();
              const atrasada = (hoje > venc) && (value.quitada === 'N' || value.quitada === 'n');


              const valorComJuros = atrasada ? calcularValorComMulta(parseFloat(value.valorAluguel), value.dataVencimento) : parseFloat(value.valorAluguel);

              return (
                <tr key={index} style={{ position: "relative" }}>
                  <td>{index + 1}</td>
                  <td style={{ color: atrasada ? 'red' : 'inherit', fontWeight: atrasada ? 'bold' : 'normal' }}>
                    {formatarData(value.dataVencimento)} {atrasada && <span style={{ marginLeft: 10, fontWeight: 'bold' }}>(Atrasada)</span>}
                  </td>
                  <td>R$ {valorComJuros.toFixed(2)}</td>
                  <td>{value.quitada == "N" || value.quitada == 'n' ? "Aberta" : "Quitada"}</td>
                  <td>
                    {value.quitada == "N" || value.quitada == 'n' ? (
                      <button className="btn btn-secondary" onClick={() => { carregarDadosPix().then(() => { setParcelaQRAtiva({ ...value, index }); }); }}>
                        Gerar QR Code
                      </button>
                    ) : (
                      <p style={{ color: 'green', fontWeight: 'bold' }}>Fatura Quitada</p>
                    )}
                  </td>
                </tr>
              )
            })}
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

            {(() => {
              const valorCorrigido = calcularValorComMulta(parseFloat(parcelaQRAtiva.valorAluguel), parcelaQRAtiva.dataVencimento);
              return (
                <>
                  <QRCodeCanvas value={gerarPayloadPix(valorCorrigido)} size={200} />
                  <div style={{ marginTop: 10, fontWeight: 'bold' }}>
                    R$ {valorCorrigido.toFixed(2)}
                  </div>
                </>
              );
            })()}

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

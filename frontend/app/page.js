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
        <div onClick={fecharModal} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: 16, }}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#f5f7fb', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.25)', width: '90%', maxWidth: 980, maxHeight: '90vh', overflow: 'auto', padding: 24, textAlign: 'left', position: 'relative', border: '1px solid #e5e7eb', fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', }}>
            {/* Topo simples */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, color: '#111827' }}>Cobrança</h2>
                <div style={{ color: '#6b7280', fontSize: 13 }}>
                  Pagamento via Pix • Parcela #{parcelaQRAtiva.index + 1}
                </div>
              </div>

              <button className="btn btn-secondary" onClick={fecharModal} aria-label="Fechar" > Fechar </button>

            </div>

            {(() => {
              const recebedorNome = dadosPix?.nomePix || 'Seu Nome / Empresa';
              const recebedorChavePix = dadosPix?.chavePix || 'chave@exemplo.com';

              const valorCorrigido = calcularValorComMulta(
                parseFloat(parcelaQRAtiva.valorAluguel),
                parcelaQRAtiva.dataVencimento
              );

              const payloadPix = gerarPayloadPix(valorCorrigido);

              const copiar = async (texto) => {
                try {
                  await navigator.clipboard.writeText(texto);
                } catch { }
              };

              // componentes utilitários de estilo
              const Card = ({ children, style }) => (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, ...style, }} > {children} </div>);

              const Label = ({ children }) => (
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{children}</div>
              );

              const Value = ({ children }) => (
                <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{children}</div>
              );

              return (
                <>
                  {/* Bloco: Dados da cobrança (2 cards lado a lado) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 12, }} >
                    <Card>
                      <Label>Valor</Label>
                      <Value>R$ {valorCorrigido.toFixed(2)}</Value>
                    </Card>

                    <Card>
                      <Label>Vencimento</Label>
                      <Value>
                        {(() => {
                          const vencimento = new Date(parcelaQRAtiva.dataVencimento);
                          const hoje = new Date();
                          hoje.setHours(0, 0, 0, 0); // zerar hora para comparar só a data

                          const dataFormatada = vencimento.toLocaleDateString('pt-BR', {
                            timeZone: 'UTC',
                          });

                          const estaAtrasado = vencimento < hoje;

                          return (
                            <> {dataFormatada}{' '}{estaAtrasado && (
                                <span style={{ color: 'red', fontSize: 14, fontWeight: 600 }}>
                                  (Atrasado)
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </Value>
                    </Card>

                  </div>

                  {/* Bloco: Dados do recebedor */}
                  <Card style={{ marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', rowGap: 12 }}>
                      <div>
                        <Label>Nome do recebedor</Label>
                        <Value>{recebedorNome}</Value>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <Label>Chave Pix</Label>
                          <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', background: '#f9fafb', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', }} title={recebedorChavePix} > {recebedorChavePix} </div>
                        </div>
                      </div>

                      <div>
                        <Label>Pagamento referente à parcela</Label>
                        <Value>#{parcelaQRAtiva.index + 1}</Value>
                      </div>
                    </div>
                  </Card>

                  {/* Seção: Pagamento via Pix (2 colunas) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, alignItems: 'start', }} >
                    {/* Coluna esquerda: QRCode */}
                    <Card style={{ display: 'grid', justifyItems: 'center', gap: 12 }}>
                      <div style={{ fontWeight: 700, color: '#111827' }}>Pagamento via Pix</div>
                      <QRCodeCanvas value={payloadPix} size={260} includeMargin={true} />
                    </Card>

                    {/* Coluna direita: “Pix Copia e Cola” + (opcional) ação lateral */}
                    <div style={{ display: 'grid', gap: 16 }}>

                      {/* Pix Copia e Cola */}
                      <Card>
                        <div style={{ fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                          Pix Copia e Cola
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'start', }}>
                          <textarea readOnly value={payloadPix} style={{ width: '100%', minHeight: 70, resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5, lineHeight: 1.45, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', color: 'black' }} />
                          <button onClick={() => copiar(payloadPix)} style={{ alignSelf: 'stretch', border: '1px solid #2563eb', background: '#2563eb', color: '#fff', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, minWidth: 120, }} > Copiar </button>
                        </div>
                      </Card>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

      )}
    </div>
  );
}

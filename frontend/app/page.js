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
  const [qrImg, setQrImg] = useState(null);
  const [listaPagAvulso, setListaPagAvulso] = useState([]);

  // ----------- Funções para pagamentos avulsos -----------

  function listarPagAvulso(idContrato) {
    let status = 0;
    httpClient.get(`/pagamentoAvulso/obterPorContrato/${idContrato}`)
      .then(r => { status = r.status; return r.json(); })
      .then(r => {
        if (status === 200) setListaPagAvulso(r);
        else alert(r.msg);
      });
  }

  useEffect(() => {
    if (listaParcelas.length > 0) {
      // listaPagAvulso depende do contrato da primeira parcela
      listarPagAvulso(listaParcelas[0].idContrato);
    }
  }, [listaParcelas]);

  // ----------- Funções gerais -----------

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

  async function gerarQRCode(id) {
    try {
      const r = await httpClient.get(`/pix/qrcode/${id}.png`);
      if (r.status === 200) {
        const blob = await r.blob();
        setQrImg(URL.createObjectURL(blob));
      } else {
        alert('Erro ao gerar QR Code.');
      }
    } catch {
      alert('Erro ao acessar backend do QR Code.');
    }
  }
  async function gerarQRCodeAvulso(id) {
    try {
      const r = await httpClient.get(`/pix/qrcode/avulso/${id}.png`);
      if (r.status === 200) {
        const blob = await r.blob();
        setQrImg(URL.createObjectURL(blob));
      } else {
        alert('Erro ao gerar QR Code.');
      }
    } catch {
      alert('Erro ao acessar backend do QR Code.');
    }
  }

  async function carregarDadosPix() {
    try {
      const r = await httpClient.get('/usuarios/listarChave');
      if (r.status === 200) {
        const data = await r.json();
        if (data && data.length > 0) setDadosPix(data[0]);
      } else alert('Erro ao listar chaves.');
    } catch {
      alert('Erro ao acessar backend.');
    }
  }

  async function carregarTiposPix() {
    try {
      const r = await httpClient.get('/tiposPix/listar');
      if (r.status === 200) {
        const data = await r.json();
        setListaTiposPix(data || []);
      } else alert('Erro ao listar tipos Pix.');
    } catch {
      alert('Erro ao acessar backend.');
    }
  }

  async function procurarParcelas(cpfFormatado) {
    const cpfLimpo = cpfFormatado.replace(/\D/g, "");
    try {
      const r = await httpClient.get(`/aluguel/obterAlugueis/${cpfLimpo}`);
      if (r.status === 200) {
        const data = await r.json();
        if (!data || data.length === 0) {
          alert('Nenhuma parcela encontrada.');
          setListaParcelas([]);
        } else {
          setListaParcelas(data);
        }
      } else alert('Erro ao listar parcelas.');
    } catch {
      alert('Erro ao acessar backend.');
    }
  }

  useEffect(() => {
    carregarDadosPix();
    carregarTiposPix();
  }, []);

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

  const copiar = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert('Copiado para a área de transferência!');
    } catch {
      alert('Erro ao copiar!');
    }
  };

  const existeAvulsoAberto = listaPagAvulso.some(p => p.pago === 'n' || p.pago === 'N' || p.pago === null);

  // ----------- Renderização -----------

  return (
    <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

      {/* ---------- Pagamentos Avulsos ---------- */}
      {listaPagAvulso.length > 0 && (
        <div style={{ width: "95%", margin: "20px auto", padding: 16, border: '1px solid #ccc', borderRadius: 10, background: '#f9fafb' }}>
          <h3 style={{ marginBottom: 12 }}>Pagamentos Avulsos</h3>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
                <th>PIX</th>
              </tr>
            </thead>
            <tbody>
              {listaPagAvulso.map((pagamento) => {
                const pendente = pagamento.pago === 'n' || pagamento.pago === 'N' || pagamento.pago === null;
                return (
                  <tr key={pagamento.idPagamento}>
                    <td>{pagamento.idPagamento}</td>
                    <td>R$ {parseFloat(pagamento.valorPagamento).toFixed(2)}</td>
                    <td>{new Date(pagamento.dataPagamento).toLocaleDateString('pt-BR')}</td>
                    <td style={{ color: pendente ? 'red' : 'green', fontWeight: 'bold' }}>
                      {pendente ? 'Aberto' : 'Pago'}
                    </td>
                    <td>
                      <button disabled = {!pendente}
                        className="btn btn-primary"
                        onClick={async () => {
                          try {
                            // chama a nova rota de payload para pagamento avulso
                            const r = await httpClient.get(`/pix/payload/avulso/${pagamento.idPagamento}`);
                            if (r.status === 200) {
                              const payload = await r.json();
                              setParcelaQRAtiva({ ...pagamento, payloadPix: payload.payload });

                              // chama a nova rota de QR Code para pagamento avulso
                              await gerarQRCodeAvulso(pagamento.idPagamento);
                            } else {
                              alert('Erro ao gerar Pix do pagamento avulso.');
                            }
                          } catch {
                            alert('Erro ao acessar backend Pix.');
                          }
                        }}
                      >
                        Gerar QR Code
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Tabela principal das parcelas ---------- */}
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
                  <td>{value.quitada === "N" || value.quitada === 'n' ? "Aberta" : "Quitada"}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      disabled={existeAvulsoAberto || value.quitada === "S" || value.quitada === "s"}
                      onClick={async () => {
                        try {
                          const r = await httpClient.get(`/pix/payload/${value.idAluguel}`);
                          if (r.status === 200) {
                            const payload = await r.json();
                            setParcelaQRAtiva({ ...value, index, payloadPix: payload.payload });
                          } else {
                            alert('Erro ao gerar Pix.');
                            return;
                          }
                          await gerarQRCode(value.idAluguel);
                        } catch {
                          alert('Erro ao acessar backend Pix.');
                        }
                      }}
                    >
                      {value.quitada === "S" || value.quitada === "s" ? "Fatura Quitada" : "Gerar QR Code"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* ---------- Modal detalhado ---------- */}
      {parcelaQRAtiva && (
        <div onClick={fecharModal} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: 16 }}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#f5f7fb', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.25)', width: '90%', maxWidth: 980, maxHeight: '90vh', overflow: 'auto', padding: 24, textAlign: 'left', position: 'relative', border: '1px solid #e5e7eb', fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, color: '#111827' }}>Cobrança</h2>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Pagamento via Pix • Parcela #{parcelaQRAtiva.index + 1 || parcelaQRAtiva.idPagamento}</div>
              </div>
              <button className="btn btn-secondary" onClick={fecharModal} aria-label="Fechar">Fechar</button>
            </div>

            {/* Dados da cobrança */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginBottom: 12 }}>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Valor</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>
                  R$ {parcelaQRAtiva.valorPagamento
                    ? parseFloat(parcelaQRAtiva.valorPagamento).toFixed(2)
                    : calcularValorComMulta(parseFloat(parcelaQRAtiva.valorAluguel), parcelaQRAtiva.dataVencimento).toFixed(2)}

                </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Vencimento</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{formatarData(parcelaQRAtiva.dataVencimento || parcelaQRAtiva.dataPagamento)}</div>
              </div>
            </div>

            {/* Dados do recebedor */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Nome do recebedor</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>{dadosPix?.nomePix || 'Seu Nome / Empresa'}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Chave Pix</div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', background: '#f9fafb', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={dadosPix?.chavePix || ''}>
                {dadosPix?.chavePix || ''}
              </div>
            </div>

            {/* Pagamento via Pix */}
            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, alignItems: 'start' }}>
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'grid', justifyItems: 'center', gap: 12 }}>
                <div style={{ fontWeight: 700, color: '#111827' }}>Pagamento via Pix</div>
                <img src={qrImg || ''} alt="QR Code Pix" style={{ width: 260, height: 260 }} />
              </div>
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#111827', marginBottom: 8 }}>Pix Copia e Cola</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'start' }}>
                    <textarea
                      readOnly
                      value={parcelaQRAtiva.payloadPix || ''}
                      style={{ width: '100%', minHeight: 70, resize: 'vertical', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5, lineHeight: 1.45, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb', background: '#f9fafb', color: 'black' }}
                    />
                    <button onClick={() => copiar(parcelaQRAtiva.payloadPix || '')} style={{ alignSelf: 'stretch', border: '1px solid #2563eb', background: '#2563eb', color: '#fff', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, minWidth: 120 }}>Copiar</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

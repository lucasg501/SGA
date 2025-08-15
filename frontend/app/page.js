'use client'
import { useEffect, useRef, useState } from "react";
import httpClient from "./utils/httpClient";

export default function Home() {
  const cpfLocatario = useRef(null);
  const [cpfFormatado, setCpfFormatado] = useState("");
  const [listaParcelas, setListaParcelas] = useState([]);
  const [parcelaQRAtiva, setParcelaQRAtiva] = useState(null);
  const [dadosPix, setDadosPix] = useState(null);
  const [listaTiposPix, setListaTiposPix] = useState([]);
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
        } else setListaParcelas(data);
      } else alert('Erro ao listar parcelas.');
    } catch {
      alert('Erro ao acessar backend.');
    }
  }

  // Função para abrir modal de QR Code
  async function abrirQrModal(parcela, avulso = false) {
    try {
      const url = avulso ? `/pix/payload/avulso/${parcela.idPagamento}` : `/pix/payload/${parcela.idAluguel}`;
      const r = await httpClient.get(url);
      if (r.status === 200) {
        const payload = await r.json();
        setParcelaQRAtiva({ ...parcela, index: parcela.index, payloadPix: payload.payload });
      } else {
        alert('Erro ao gerar Pix.');
      }
    } catch {
      alert('Erro ao acessar backend Pix.');
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

      {/* Formulário CPF centralizado */}
      {listaParcelas.length === 0 && (
        <div style={{
          width: "400px",
          margin: "20px auto",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }} className="form form-group">
          <label>Informe seu CPF</label>
          <input
            type="text"
            className="form-control"
            placeholder="000.000.000-00"
            value={cpfFormatado}
            onChange={handleChangeCPF}
            ref={cpfLocatario}
            maxLength={14}
            style={{ textAlign: 'center' }}
          />
          <button
            style={{ marginTop: "10px", width: "100%" }}
            className="btn btn-primary"
            onClick={() => procurarParcelas(cpfFormatado)}
          >
            Procurar
          </button>
        </div>
      )}

      {/* Botão para novo CPF */}
      {listaParcelas.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <button style={{ margin: 10 }} onClick={() => { window.location.reload() }} className="btn btn-primary">Novo CPF</button>
        </div>
      )}

      {/* Tabelas centralizadas */}
      {listaPagAvulso.length > 0 && (
        <div style={{
          width: "95%",
          margin: "20px auto",
          padding: 16,
          border: '1px solid #ccc',
          borderRadius: 10,
          background: '#f9fafb',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <table className="table table-striped" style={{ width: '100%' }}>
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
                      <button disabled={!pendente} className="btn btn-primary" onClick={() => abrirQrModal(pagamento, true)}>
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

      {listaParcelas.length > 0 && (
        <div style={{ width: '95%', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <table className="table table-striped" style={{ width: '100%', border: "1px solid #ccc", borderRadius: 10, padding: 10 }}>
            <thead>
              <tr>
                <th>Parcela</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th>PIX</th>
              </tr>
            </thead>
            <tbody>
              {listaParcelas.map((value, index) => {
                const venc = new Date(value.dataVencimento);
                const hoje = new Date();
                const atrasada = (hoje > venc) && (value.quitada === 'N' || value.quitada === 'n');
                const valorComJuros = atrasada ? calcularValorComMulta(parseFloat(value.valorAluguel), value.dataVencimento) : parseFloat(value.valorAluguel);

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td style={{ color: atrasada ? 'red' : 'inherit', fontWeight: atrasada ? 'bold' : 'normal' }}>
                      {formatarData(value.dataVencimento)} {atrasada && <span style={{ marginLeft: 10, fontWeight: 'bold' }}>(Atrasada)</span>}
                    </td>
                    <td>R$ {valorComJuros.toFixed(2)}</td>
                    <td>{value.quitada === "N" || value.quitada === 'n' ? "Aberta" : "Quitada"}</td>
                    <td>
                      <button className="btn btn-primary" disabled={existeAvulsoAberto || value.quitada === "S" || value.quitada === "s"} onClick={() => abrirQrModal({ ...value, index })}>
                        {value.quitada === "S" || value.quitada === "s" ? "Fatura Quitada" : "Gerar QR Code"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Modal completo com QR e inputs centralizados ---------- */}
      {parcelaQRAtiva && (
        <div onClick={fecharModal} style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: 16
        }}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: '#f5f7fb',
            borderRadius: 12,
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            width: '95%',
            maxWidth: 1200,
            maxHeight: '100vh',
            overflow: 'auto',
            padding: 32,
            textAlign: 'left',
            position: 'relative',
            border: '1px solid #e5e7eb',
            fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
          }}>
            {/* Cabeçalho */}
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
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: '10px 12px',
                background: '#f9fafb',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 13,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }} title={dadosPix?.chavePix || ''}>
                {dadosPix?.chavePix || ''}
              </div>
            </div>

            {/* QR Code e Copia e Cola */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
              {/* QR */}
              <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12
              }}>
                <div style={{ fontWeight: 700, color: '#111827' }}>Pagamento via Pix</div>
                {parcelaQRAtiva && (
                  <iframe
                    src={parcelaQRAtiva.idPagamento
                      ? `http://localhost:4000/pix/iframe/avulso/${parcelaQRAtiva.idPagamento}`
                      : `http://localhost:4000/pix/iframe/${parcelaQRAtiva.idAluguel}`}
                    style={{ width: 300, height: 300, border: 'none', borderRadius: 8 }}
                    title="QR Code Pix"
                  />
                )}
              </div>

              {/* Copia e Cola */}
              <div style={{ flex: 1, minWidth: 300 }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#111827', marginBottom: 8 }}>Pix Copia e Cola</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <textarea
                      readOnly
                      value={parcelaQRAtiva.payloadPix || ''}
                      style={{
                        flex: 1,
                        minHeight: 70,
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontSize: 12.5,
                        lineHeight: 1.45,
                        padding: 12,
                        borderRadius: 10,
                        border: '1px solid #e5e7eb',
                        background: '#f9fafb',
                        color: 'black',
                        textAlign: 'left'
                      }}
                    />
                    <button
                      onClick={() => copiar(parcelaQRAtiva.payloadPix || '')}
                      style={{
                        border: '1px solid #2563eb',
                        background: '#2563eb',
                        color: '#fff',
                        padding: '10px 14px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontWeight: 700,
                        minWidth: 120
                      }}
                    >
                      Copiar
                    </button>
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

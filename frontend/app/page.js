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
  const [listaContrato, setListaContrato] = useState([]);
  const [contratoSelecionado, setContratoSelecionado] = useState(null);

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
  function listarContrato(idContrato) {
    let status = 0;

    httpClient.get(`/contratos/obter/${idContrato}`)
      .then(r => {
        status = r.status;
        return r.json();
      })
      .then(r => {
        if (status === 200) {
          const contrato = { ...r, multa: parseFloat(r.multa) || 0, juros: parseFloat(r.juros) || 0 };
          setListaContrato([contrato]);
          setContratoSelecionado(contrato);
        } else {
          alert(r.msg);
        }
      })
      .catch(err => {
        console.error('Erro ao buscar contrato:', err);
        alert('Erro ao acessar backend.');
      });
  }

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
        } else {
          setListaParcelas(data);
          listarContrato(data[0].idContrato);
        }
      } else alert('Erro ao listar parcelas.');
    } catch {
      alert('Erro ao acessar backend.');
    }
  }

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

  function calcularValorComMulta(valorOriginal, dataVencimento, multaPercent, jurosPercentDia) {
    const hoje = new Date();
    const venc = new Date(dataVencimento);
    if (hoje <= venc) return parseFloat(valorOriginal);

    const diffTime = hoje - venc;
    const diffDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const multa = valorOriginal * multaPercent;
    const juros = valorOriginal * jurosPercentDia * diffDias;
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
    <div className="container-fluid" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
      <h1 className="text-center mb-4">Verificar as parcelas pelo CPF</h1>

      {/* Formulário CPF centralizado */}
      {listaParcelas.length === 0 && (
        <div className="form form-group p-4 mb-4" style={{ width: "400px", border: "1px solid #ccc", borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label>Informe seu CPF</label>
          <input
            type="text"
            className="form-control text-center"
            placeholder="000.000.000-00"
            value={cpfFormatado}
            onChange={handleChangeCPF}
            ref={cpfLocatario}
            maxLength={14}
          />
          <button className="btn btn-primary mt-3 w-100" onClick={() => procurarParcelas(cpfFormatado)}>
            Procurar
          </button>
        </div>
      )}

      {/* Botão para novo CPF */}
      {listaParcelas.length > 0 && (
        <div className="text-center mb-3">
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Novo CPF</button>
        </div>
      )}

      {/* Tabelas centralizadas */}
      {listaPagAvulso.length > 0 && (
        <div className="mb-4 w-100 text-center">
          <h3>Pagamentos Avulsos</h3>
          <div className="table-responsive p-3" style={{ background: '#f9fafb', borderRadius: 10, border: '1px solid #ccc' }}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Descrição</th>
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
                      <td>{pagamento.descricao}</td>
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
        </div>
      )}

      {listaParcelas.length > 0 && (
        <div className="mb-4 w-100">
          <h3 className="text-center mb-3">Aluguéis</h3>
          <div className="table-responsive p-3" style={{ border: "1px solid #ccc", borderRadius: 10 }}>
            <table className="table table-striped">
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
                  const multaPercent = contratoSelecionado?.multa ?? 0.02;
                  const jurosPercentDia = contratoSelecionado?.juros ?? 0.01;
                  const valorComJuros = atrasada
                    ? calcularValorComMulta(parseFloat(value.valorAluguel), value.dataVencimento, multaPercent, jurosPercentDia)
                    : parseFloat(value.valorAluguel);

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
        </div>
      )}

      {/* ---------- Modal completo com QR e inputs centralizados ---------- */}
      {parcelaQRAtiva && (
        <div onClick={fecharModal} className="d-flex justify-content-center align-items-center" style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, padding: 16
        }}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: '#f5f7fb', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            width: '95%', maxWidth: 1200, maxHeight: '100vh', overflow: 'auto', padding: 32, textAlign: 'left',
            position: 'relative', border: '1px solid #e5e7eb', fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'
          }}>
            {/* Cabeçalho */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h2 className="mb-0" style={{ fontSize: 20, color: '#111827' }}>Cobrança</h2>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Pagamento via Pix • Parcela #{parcelaQRAtiva.index + 1 || parcelaQRAtiva.idPagamento}</div>
              </div>
              <button className="btn btn-secondary" onClick={fecharModal} aria-label="Fechar">Fechar</button>
            </div>

            {/* Dados da cobrança */}
            <div className="d-grid gap-3 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              <div className="p-3" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>Valor</div>
                <div className="fw-bold" style={{ fontSize: 16, color: '#111827' }}>
                  R$ {parcelaQRAtiva.valorPagamento
                    ? parseFloat(parcelaQRAtiva.valorPagamento).toFixed(2)
                    : calcularValorComMulta(
                      parseFloat(parcelaQRAtiva.valorAluguel),
                      parcelaQRAtiva.dataVencimento,
                      contratoSelecionado?.multa ?? 0.02,
                      contratoSelecionado?.juros ?? 0.01
                    ).toFixed(2)}
                </div>
              </div>
              <div className="p-3" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>Vencimento</div>
                <div className="fw-bold" style={{ fontSize: 16, color: '#111827' }}>{formatarData(parcelaQRAtiva.dataVencimento || parcelaQRAtiva.dataPagamento)}</div>
              </div>
            </div>

            {/* Dados do recebedor */}
            {dadosPix && (
              <div className="d-grid gap-3 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                <div className="p-3" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                  <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>Recebedor</div>
                  <div className="fw-bold" style={{ fontSize: 16, color: '#111827' }}>{dadosPix.nomePix}</div>
                </div>
                <div className="p-3" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
                  <div className="text-muted" style={{ fontSize: 12, marginBottom: 4 }}>Chave Pix</div>
                  <div className="fw-bold" style={{ fontSize: 16, color: '#111827' }}>{dadosPix.chavePix}</div>
                </div>
              </div>
            )}

            {/* QR Code e Copia e Cola */}
            <div className="d-flex flex-wrap justify-content-center gap-4">
              <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div className="fw-bold text-dark">Pagamento via Pix</div>
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

              <div style={{ flex: 1, minWidth: 300 }}>
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                  <div className="fw-bold mb-2 text-dark">Pix Copia e Cola</div>
                  <div className="d-flex gap-2">
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
                      className="btn btn-primary"
                      style={{ minWidth: 120 }}
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

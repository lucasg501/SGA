'use client'
import React, { useEffect, useState } from 'react';
import httpClient from '../utils/httpClient';

export default function AdminLayout({ children }) {
  const [listaAlugueis, setListaAlugueis] = useState([]);
  const [listaContratos, setListaContratos] = useState([]);
  const [listaImoveis, setListaImoveis] = useState([]);
  const [dropdownAberto, setDropdownAberto] = useState(false);

  function listarContratos() {
    httpClient.get('/contratos/listar')
      .then(r => r.json())
      .then(r => setListaContratos(r))
      .catch(() => console.log(r));
  }

  function listarImoveis() {
    httpClient.get('/imovel/listar')
      .then(r => r.json())
      .then(r => setListaImoveis(r))
      .catch(() => console.log(r));
  }

  function listarAlugueis() {
    httpClient.get('/aluguel/listar')
      .then(r => r.json())
      .then(r => {
        if (r && Array.isArray(r.alugueis)) {
          setListaAlugueis(r.alugueis);
        } else {
          console.log(r);
        }
      })
      .catch(() => console.log(r));
  }

  function quitarFatura(idAluguel) {
    if (!confirm("Tem certeza que deseja marcar o aluguel como quitado?")) return;

    httpClient.post('/aluguel/marcarPago', { idAluguel })
      .then(r => r.json())
      .then(() => {
        alert('Fatura quitada com sucesso!');
        listarAlugueis();
      })
      .catch(() => alert("Erro ao marcar aluguel como quitado!"));
  }

  function procurarRefImovel(idContrato) {
    const contrato = listaContratos.find(c => c.idContrato === idContrato);
    if (!contrato) return null;

    const imovel = listaImoveis.find(i => i.idImovel === contrato.idImovel);
    return imovel ? imovel.refImovel : null;
  }

  function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    if (isNaN(data)) return dataString;
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  // Data atual para filtro mês/ano
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  // Filtra aluguéis deste mês (mes e ano do vencimento igual ao atual)
  const alugueisDoMes = listaAlugueis.filter(a => {
    const dataVenc = new Date(a.dataVencimento);
    return (
      dataVenc.getMonth() === mesAtual &&
      dataVenc.getFullYear() === anoAtual
    );
  });

  // Filtra atrasados (vencidos e não quitados)
  const alugueisAtrasados = listaAlugueis.filter(a =>
    new Date(a.dataVencimento) < hoje &&
    a.quitada.toLowerCase() !== 's'
  );

  // Notificação só 1x por dia para atrasados
  useEffect(() => {
    if (alugueisAtrasados.length === 0) return;

    const hojeStr = new Date().toISOString().split('T')[0];
    const ultimaNotificacao = localStorage.getItem('ultimaNotificacao');

    if (ultimaNotificacao === hojeStr) return; // Já notificou hoje

    // Função para disparar a notificação
    const enviarNotificacao = () => {
      if (!("Notification" in window)) {
        console.log("Este navegador não suporta notificações.");
        return;
      }

      if (Notification.permission === "granted") {
        new Notification("⚠ Aluguéis Atrasados", {
          body: `Existem ${alugueisAtrasados.length} aluguel(is) atrasado(s).`,
          icon: "/alert-icon.png",
        });
        localStorage.setItem('ultimaNotificacao', hojeStr);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("⚠ Aluguéis Atrasados", {
              body: `Existem ${alugueisAtrasados.length} aluguel(is) atrasado(s).`,
              icon: "/alert-icon.png",
            });
            localStorage.setItem('ultimaNotificacao', hojeStr);
          }
        });
      }
    };

    enviarNotificacao();

  }, [alugueisAtrasados]);


  useEffect(() => {
    listarAlugueis();
    listarContratos();
    listarImoveis();
  }, []);

  return (
    <div>
      <h1>Aluguéis deste Mês</h1>

      <div>
        <table className='table table-striped'>
          <thead>
            <tr>
              <th>Referência Imóvel</th>
              <th>Data de vencimento</th>
              <th>Paga</th>
              <th>Marcar como paga</th>
            </tr>
          </thead>
          <tbody>
            {alugueisDoMes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  Nenhum aluguel com vencimento neste mês.
                </td>
              </tr>
            )}
            {alugueisDoMes.map((value, index) => (
              <tr key={index}>
                <td>{procurarRefImovel(value.idContrato) ?? 'Carregando...'}</td>
                <td
                  style={{
                    color: value.quitada.toLowerCase() === 's'
                      ? 'green'
                      : new Date(value.dataVencimento) < hoje
                        ? 'red'
                        : 'inherit',
                    fontWeight: value.quitada.toLowerCase() === 's' ? 'bold' : 'normal'
                  }}
                >
                  {formatarData(value.dataVencimento)}
                  {value.quitada.toLowerCase() === 's'
                    ? ' - Quitada'
                    : new Date(value.dataVencimento) < hoje
                      ? ' - Vencida'
                      : ''}
                </td>
                <td>{value.quitada.toLowerCase() === 'n' ? 'Não' : 'Sim'}</td>
                <td>
                  {value.quitada.toLowerCase() === 'n' ? (
                    <button
                      onClick={() => quitarFatura(value.idAluguel)}
                      className="btn btn-success"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                  ) : (
                    <h5 style={{ color: 'green', fontWeight: 'bold' }}>Quitada</h5>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown para atrasados */}
      <div style={{ marginTop: '20px' }}>
        <div
          onClick={() => setDropdownAberto(!dropdownAberto)}
          style={{
            background: '#dc3545',
            color: 'white',
            padding: '10px',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          {dropdownAberto
            ? 'Fechar aluguéis atrasados ▲'
            : `Ver aluguéis atrasados (${alugueisAtrasados.length}) ▼`}
        </div>

        {dropdownAberto && (
          <div
            style={{
              background: '#fff',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              marginTop: '5px'
            }}
          >
            {alugueisAtrasados.length > 0 ? (
              <table className='table'>
                <thead>
                  <tr>
                    <th>Referência Imóvel</th>
                    <th>Data de vencimento</th>
                  </tr>
                </thead>
                <tbody>
                  {alugueisAtrasados.map((a, i) => (
                    <tr key={i} style={{ color: 'red', fontWeight: 'bold' }}>
                      <td>{procurarRefImovel(a.idContrato) ?? 'Carregando...'}</td>
                      <td>{formatarData(a.dataVencimento)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'green', fontWeight: 'bold' }}>Nenhum aluguel atrasado 🎉</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

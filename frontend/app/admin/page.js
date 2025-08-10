'use client';
import React, { useEffect, useState } from 'react';
import httpClient from '../utils/httpClient';

export default function AdminLayout({ children }) {
  const [listaAlugueis, setListaAlugueis] = useState([]);
  const [listaContratos, setListaContratos] = useState([]);
  const [listaImoveis, setListaImoveis] = useState([]);

  function listarContratos() {
    let status = 0;
    httpClient.get('/contratos/listar')
      .then(r => {
        status = r.status;
        return r.json();
      })
      .then(r => {
        if (status === 200) {
          setListaContratos(r);
        } else {
          alert('Erro ao listar contratos.');
        }
      })
  }

  function listarImoveis() {
    let status = 0;
    httpClient.get('/imovel/listar')
      .then(r => {
        status = r.status;
        return r.json();
      })
      .then(r => {
        if (status === 200) {
          setListaImoveis(r);
        } else {
          alert('Erro ao listar imoveis.');
        }
      })
  }

  function listarAlugueis() {
    httpClient.get('/aluguel/listar')
      .then(r => r.json())
      .then(r => {
        if (r && Array.isArray(r.alugueis)) {
          const hoje = new Date();
          const mesAtual = hoje.getMonth();
          const anoAtual = hoje.getFullYear();

          const alugueisDoMesAtual = r.alugueis.filter(aluguel => {
            const dataVen = new Date(aluguel.dataVencimento);
            return (
              dataVen.getMonth() === mesAtual &&
              dataVen.getFullYear() === anoAtual
            );
          });

          setListaAlugueis(alugueisDoMesAtual);
        } else {
          alert('Erro ao listar alugueis');
        }
      });
  }

  function quitarFatura(idAluguel) {
    if (!confirm("Tem certeza que deseja marcar o aluguel como quitado?")) {
      return;
    }

    let status = 0;
    httpClient.post('/aluguel/marcarPago', { idAluguel })
      .then(r => {
        status = r.status;
        return r.json();
      })
      .then(r => {
        if (status === 200) {
          alert('Fatura quitada com sucesso!');
          window.location.reload();
        } else {
          alert("Erro ao marcar aluguel como quitado!");
        }
      })
      .catch(() => alert("Erro ao marcar aluguel como quitado!"));
  }


  function procurarRefImovel(idContrato) {
    const contrato = listaContratos.find(c => c.idContrato === idContrato);
    if (!contrato) return null;

    const imovel = listaImoveis.find(i => i.idImovel === contrato.idImovel);
    return imovel ? imovel.refImovel : null;
  }

  // Função para formatar a data para dd/mm/aaaa
  function formatarData(dataString) {
    if (!dataString) return '';

    const data = new Date(dataString);
    if (isNaN(data)) return dataString; // retorna original se inválido

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  useEffect(() => {
    listarAlugueis();
    listarContratos();
    listarImoveis();
  }, []);

  return (
    <div>
      <h1>Aluguéis desse mês</h1>

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
            {listaAlugueis.map((value, index) => (
              <tr key={index}>
                <td>{procurarRefImovel(value.idContrato) ?? 'Carregando...'}</td>
                <td>{formatarData(value.dataVencimento)}</td>
                <td>{value.quitada.toLowerCase() === 'n' ? 'Não' : 'Sim'}</td>
                <td>
                  {
                    value.quitada == 'N' || value.quitada == 'n' ?
                      <button onClick={() => quitarFatura(value.idAluguel)} className="btn btn-success">
                        <i className="fas fa-check"></i>
                      </button>
                      :
                      <h5 style={{ color: 'green', fontWeight: 'bold' }}>Quitada</h5>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

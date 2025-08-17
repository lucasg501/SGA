'use client'

import httpClient from "@/app/utils/httpClient";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Contratos() {

    const [contratos, setContratos] = useState([]);
    const [listaLocatarios, setListaLocatarios] = useState([]);
    const [listaLocadores, setListaLocadores] = useState([]);
    const [listaImoveis, setListaImoveis] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    function listarContratos() {
        let status = 0;
        httpClient.get('/contratos/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setContratos(r);
                } else {
                    alert('Erro ao listar contratos.');
                }
            })
    }

    function listarLocatarios() {
        let status = 0;
        httpClient.get('/locatario/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setListaLocatarios(r);
                } else {
                    alert('Erro ao listar locatários.');
                }
            })
    }

    function acharVencidos() {
        const hoje = new Date().toISOString().split('T')[0];
        const vencidos = contratos
            .filter(c => c.fimVigenciaContrato < hoje)
            .map(c => c.idContrato);

        if (vencidos.length > 0) {
            alert(`Existem ${vencidos.length} contratos vencidos.`);
            const desejaDarBaixa = confirm('Deseja dar baixa nesses contratos?');
            if (desejaDarBaixa) {
                vencidos.forEach(id => {
                    window.location.href = `/admin/contratos/alterar/${id}`;
                });
            }
        }
    }

    useEffect(() => {
        if (contratos.length > 0) {
            acharVencidos();
        }
    }, [contratos]); // roda sempre que contratos mudar


    function listarLocadores() {
        let status = 0;
        httpClient.get('/locador/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setListaLocadores(r);
                } else {
                    alert('Erro ao listar locadores.');
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
                if (status == 200) {
                    setListaImoveis(r);
                } else {
                    alert('Erro ao listar imóveis.');
                }
            })
    }

    function buscarLocatario(idLocatario) {
        const locatario = listaLocatarios.find(loc => loc.idLocatario == idLocatario);
        return locatario ? locatario.nomeLocatario : 'Locatário não encontrado';
    }

    function buscarLocador(idLocador) {
        const locador = listaLocadores.find(loc => loc.idLocador == idLocador);
        return locador ? locador.nomeLocador : 'Locador não encontrado';
    }

    function buscarImovel(idImovel) {
        const imovel = listaImoveis.find(loc => loc.idImovel == idImovel);
        return imovel ? imovel.refImovel : 'Imóvel não encontrado';
    }

    function formatarDataVencimento(dataVencimento) {
        if (!dataVencimento) return '';
        const data = new Date(dataVencimento);
        return data.toLocaleDateString('pt-BR', { day: '2-digit' });
    }

    useEffect(() => {
        listarContratos();
        listarLocatarios();
        listarLocadores();
        listarImoveis();
    }, []);

    function buscarPorRef(refImovel) {
        let status = 0;
        httpClient.get(`/imovel/buscarPorImovel/${refImovel}`)
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setContratos(r);
                } else {
                    alert('Erro ao listar contratos.');
                }
            })
    }

    function toggleRow(id) {
        if (expandedRows.includes(id)) {
            setExpandedRows(expandedRows.filter(rowId => rowId !== id));
        } else {
            setExpandedRows([...expandedRows, id]);
        }
    }

    return (
        <div>
            <h1>Contratos</h1>

            <div>
                <div>
                    <Link href='/admin/contratos/gravar'>
                        <button className="btn btn-primary">Novo Contrato</button>
                    </Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <input className="form-control" type="text" onChange={e => { buscarPorRef(e.target.value); }} />
                    <button className="btn btn-secondary" onClick={() => { window.location.reload(); }}>Limpar Filtro</button>
                </div>
            </div>

            <div>
                <table className="table table-striped">
                    <thead style={{ textAlign: 'center' }}>
                        <tr>
                            <th>ID</th>
                            <th>Id do Imóvel</th>
                            <th>Locatário</th>
                            <th>Locador</th>
                            <th>Quantidade de Parcelas</th>
                            <th>Valor das Parcelas</th>
                            <th>Multa (%)</th>
                            <th>Juros (% ao dia)</th>
                            <th>Vencimento</th>
                            <th>Inicio contrato</th>
                            <th>Fim contrato</th>
                            <th>Ativo</th>
                            <th>Alterar</th>
                            <th>Pag.Avulso</th>
                            <th>+</th>
                        </tr>
                    </thead>

                    <tbody>
                        {contratos.map((value) => (
                            <>
                                <tr key={value.idContrato}>
                                    <td>{value.idContrato}</td>
                                    <td style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={buscarImovel(value.idImovel)}>
                                        {buscarImovel(value.idImovel)}
                                    </td>
                                    <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={buscarLocatario(value.idLocatario)}>
                                        {buscarLocatario(value.idLocatario)}
                                    </td>
                                    <td style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={buscarLocador(value.idLocador)}>
                                        {buscarLocador(value.idLocador)}
                                    </td>
                                    <td>{value.qtdParcelas}</td>
                                    <td>R${value.valorParcela}</td>
                                    <td>%{value.multa}</td>
                                    <td>%{value.juros}</td>
                                    <td>Dia: {formatarDataVencimento(value.dataVencimento)}</td>
                                    <td>{new Date(value.inicioVigenciaContrato).toLocaleDateString()}</td>
                                    <td>{new Date(value.fimVigenciaContrato).toLocaleDateString()}</td>
                                    <td>{value.ativo === "S" ? 'Sim' : 'Não'}</td>
                                    <td>
                                        <Link href={`/admin/contratos/alterar/${value.idContrato}`}>
                                            <button className="btn btn-primary">Alterar</button>
                                        </Link>
                                    </td>
                                    <td>
                                        <Link href={`/admin/pagamentoAvulso/alterar/${value.idContrato}`}>
                                            <button className="btn btn-success">
                                                <i className="fas fa-solid fa-coins"></i>
                                            </button>
                                        </Link>
                                    </td>
                                    <td>
                                        <button className="btn btn-secondary btn-sm" onClick={() => toggleRow(value.idContrato)}>
                                            {expandedRows.includes(value.idContrato) ? '−' : '+'}
                                        </button>
                                    </td>
                                </tr>

                                {expandedRows.includes(value.idContrato) && (
                                    <tr>
                                        <td colSpan="15">
                                            <div style={{ padding: '10px', background: '#f9f9f9' }}>
                                                <strong>Detalhes completos:</strong><br />
                                                Imóvel: {buscarImovel(value.idImovel)}<br />
                                                Locatário: {buscarLocatario(value.idLocatario)}<br />
                                                Locador: {buscarLocador(value.idLocador)}<br />
                                                Quantidade de Parcelas: {value.qtdParcelas}<br />
                                                Valor das Parcelas: R${value.valorParcela}<br />
                                                Multa: %{value.multa}<br />
                                                Juros: %{value.juros}<br />
                                                Vencimento: {formatarDataVencimento(value.dataVencimento)}<br />
                                                Início contrato: {new Date(value.inicioVigenciaContrato).toLocaleDateString()}<br />
                                                Fim contrato: {new Date(value.fimVigenciaContrato).toLocaleDateString()}<br />
                                                Ativo: {value.ativo === "S" ? 'Sim' : 'Não'}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

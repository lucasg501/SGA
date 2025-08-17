'use client'

import httpClient from "@/app/utils/httpClient";
import Link from "next/link"
import { useEffect, useState } from "react"

export default function PagamentoAvulso() {

    const [listaPagamentos, setListaPagamentos] = useState([]);
    const [filtroRef, setFiltroRef] = useState('');
    const [filtroPago, setFiltroPago] = useState('N'); // padrão: não pagos

    // Normaliza o valor de pago
    const isPago = (valor) => valor?.toString().toUpperCase() === 'S';

    // Função para listar todos os pagamentos
    function listarPagamentos() {
        httpClient.get('/pagamentoAvulso/listar')
            .then(r => r.json().then(data => ({ status: r.status, data })))
            .then(({ status, data }) => {
                if (status === 200) {
                    setListaPagamentos(data);
                } else alert(data.msg);
            })
            .catch(err => {
                console.error(err);
                alert('Erro ao listar pagamentos.');
            });
    }

    // Função para buscar pagamentos por refImovel
    function buscarPorImovel(ref) {
        setFiltroRef(ref);
        if (!ref.trim()) return listarPagamentos();

        httpClient.get(`/pagamentoAvulso/obterPorImovel/${ref}`)
            .then(r => r.json().then(data => ({ status: r.status, data })))
            .then(({ status, data }) => {
                if (status === 200) setListaPagamentos(data);
                else alert('Erro ao buscar pagamentos por imóvel.');
            })
            .catch(err => {
                console.error(err);
                alert('Erro ao buscar pagamentos por imóvel.');
            });
    }

    function excluirPagamento(idPagamento) {
        if (!confirm('Deseja realmente excluir este pagamento?')) return;
        httpClient.delete(`/pagamentoAvulso/excluir/${idPagamento}`)
            .then(r => r.json().then(data => ({ status: r.status, data })))
            .then(({ status, data }) => {
                if (status === 200) {
                    alert('Pagamento excluído com sucesso!');
                    listarPagamentos();
                } else alert(data.msg);
            })
            .catch(err => {
                console.error(err);
                alert('Erro ao excluir pagamento.');
            });
    }

    function marcarPago(idPagamento) {
        if (!confirm('Deseja realmente marcar este pagamento como pago?')) return alert('Operação cancelada!');
        httpClient.post('/pagamentoAvulso/marcarPago', { idPagamento })
            .then(r => r.json().then(data => ({ status: r.status, data })))
            .then(({ status, data }) => {
                if (status === 200) {
                    alert('Pagamento marcado como pago com sucesso!');
                    listarPagamentos();
                } else alert(data.msg);
            })
            .catch(err => {
                console.error(err);
                alert('Erro ao marcar pagamento como pago.');
            });
    }

    // Aplica filtro de exibição: todos / pagos / não pagos
    const pagamentosFiltrados = listaPagamentos.filter(pagamento => {
        const pagoStatus = isPago(pagamento.pago);
        if (filtroPago === 'N') return !pagoStatus;
        if (filtroPago === 'S') return pagoStatus;
        return true; // 'T' = todos
    });

    useEffect(() => {
        listarPagamentos();
    }, []);

    return (
        <div>
            <h1>Pagamentos avulsos</h1>

            <div style={{ margin: '10px 0' }}>
                <Link href="/admin/pagamentoAvulso/gravar">
                    <button className="btn btn-primary">Novo pagamento avulso</button>
                </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <input
                    className="form-control"
                    type="text"
                    placeholder="Buscar por referência do imóvel..."
                    value={filtroRef}
                    onChange={e => buscarPorImovel(e.target.value)}
                />
                <button className="btn btn-secondary" onClick={() => buscarPorImovel('')}>Limpar Filtro</button>

                <select className="form-select" style={{ width: '200px' }} value={filtroPago} onChange={e => setFiltroPago(e.target.value)}>
                    <option value="N">Somente Não Pagos</option>
                    <option value="S">Somente Pagos</option>
                    <option value="T">Todos</option>
                </select>
            </div>

            <table className="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">Id</th>
                        <th scope="col">Valor</th>
                        <th scope="col">Data</th>
                        <th scope="col">Pago</th>
                        <th scope="col">Contrato</th>
                        <th scope="col">Descrição</th>
                        <th scope="col">Marcar Pago</th>
                        <th scope="col">Excluir</th>
                    </tr>
                </thead>

                <tbody>
                    {pagamentosFiltrados.map(pagamento => (
                        <tr key={pagamento.idPagamento}>
                            <td>{pagamento.idPagamento}</td>
                            <td>R$ {pagamento.valorPagamento}</td>
                            <td>{pagamento.dataPagamento ? new Date(pagamento.dataPagamento).toLocaleDateString() : ''}</td>
                            <td>{isPago(pagamento.pago) ? 'S' : 'N'}</td>
                            <td>{pagamento.idContrato}</td>
                            <td>{pagamento.descricao || ''}</td>
                            <td>
                                {!isPago(pagamento.pago) ?
                                    <button onClick={() => marcarPago(pagamento.idPagamento)} className="btn btn-primary">Marcar Pago</button>
                                    : <button disabled className="btn btn-primary">Marcar Pago</button>}
                            </td>
                            <td>
                                {!isPago(pagamento.pago) ?
                                    <button onClick={() => excluirPagamento(pagamento.idPagamento)} className="btn btn-danger">Excluir</button>
                                    : <button disabled className="btn btn-danger">Excluir</button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

'use client'

import httpClient from "@/app/utils/httpClient";
import Link from "next/link"
import { useEffect, useState } from "react"

export default function PagamentoAvulso() {

    const [listaPagamentos, setListaPagamentos] = useState([]);

    function listarPagamentos() {
        let status = 0;
        httpClient.get('/pagamentoAvulso/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setListaPagamentos(r);
                } else {
                    alert(r.msg);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Erro ao listar pagamentos.');
            })
    }

    function excluirPagamento(idPagamento) {
        if (!confirm('Deseja realmente excluir este pagamento?')) return;
        let status = 0;
        httpClient.delete(`/pagamentoAvulso/excluir/${idPagamento}`)
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    alert('Pagamento excluído com sucesso!');
                    listarPagamentos();
                } else {
                    alert(r.msg);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Erro ao excluir pagamento.');
            })
    }

    function marcarPago(idPagamento) {
        if(confirm('Deseja realmente marcar este pagamento como pago?')) {
            let status = 0;
            httpClient.post('/pagamentoAvulso/marcarPago',{
                idPagamento: idPagamento
            })
            .then(r=>{
                status = r.status;
                return r.json();
            })
            .then(r=>{
                if(status == 200){
                    alert('Pagamento marcado como pago com sucesso!');
                    listarPagamentos();
                }else{
                    alert(r.msg);
                }
            })
        }else{
            alert('Operação cancelada!');
        }
    }

    useEffect(() => {
        listarPagamentos();
    }, []);

    return (
        <div>
            <h1>Pagamentos avulsos aqui</h1>

            <div>
                <Link href="/admin/pagamentoAvulso/gravar">
                    <button style={{margin: 10}} className="btn btn-primary">Novo pagamento avulso</button>
                </Link>
            </div>

            <div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Id</th>
                            <th scope="col">Valor</th>
                            <th scope="col">Data</th>
                            <th scope="col">Pago</th>
                            <th scope="col">Contrato</th>
                            <th scope="col">Marcar Pago</th>
                            <th scope="col">Excluir</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            listaPagamentos.map(pagamentoAvulso => (
                                <tr key={pagamentoAvulso.idPagamento}>
                                    <td>{pagamentoAvulso.idPagamento}</td>
                                    <td>R$ {pagamentoAvulso.valorPagamento}</td>
                                    <td>{pagamentoAvulso.dataPagamento ? new Date(pagamentoAvulso.dataPagamento).toLocaleDateString() : ''}</td>
                                    <td>{(pagamentoAvulso.pago || '').toString().toUpperCase() || 'N'}</td>
                                    <td>{pagamentoAvulso.idContrato}</td>
                                    <td>
                                        {
                                            pagamentoAvulso.pago == 'N' || !pagamentoAvulso.pago ?
                                            <button onClick={() => marcarPago(pagamentoAvulso.idPagamento)} className="btn btn-primary">Marcar Pago</button>
                                            :
                                            <button disabled className="btn btn-primary">Marcar Pago</button>
                                        }
                                    </td>
                                    <td>
                                        {
                                            pagamentoAvulso.pago == 'N' || !pagamentoAvulso.pago ?
                                            <button onClick={() => excluirPagamento(pagamentoAvulso.idPagamento)} className="btn btn-danger">Excluir</button>
                                            :
                                            <button disabled className="btn btn-danger">Excluir</button>
                                        }
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

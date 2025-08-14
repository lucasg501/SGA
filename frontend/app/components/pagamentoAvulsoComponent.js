'use client'
import { useEffect, useRef, useState } from "react";
import httpClient from "../utils/httpClient";
import Link from "next/link";

export default function PagamentoAvulso(props) {
    const [pagamentoAvulso, setPagamentoAvulso] = useState(props.pagamentoAvulso ? props.pagamentoAvulso : { idPagamento: 0, valorPagamento: '', dataPagamento: '', pago: false, idContrato: 0 });
    const valorPagamento = useRef(null);
    const dataPagamento = useRef(null);
    const pago = useRef(null);
    const idContrato = useRef(null);
    const [listaContratos, setListaContratos] = useState([]);

    function listarContratos() {
        let status = 0;
        httpClient.get('/contratos/listar')
            .then(r => { status = r.status; return r.json(); })
            .then(r => { if (status == 200) { setListaContratos(r); } else { alert(r.msg); } })
    }

    useEffect(() => { listarContratos(); }, []);

    function formatarValor(e) {
        let valor = e.target.value.replace(/\D/g, "");
        valor = (parseInt(valor, 10) / 100).toFixed(2) + "";
        valor = valor.replace(".", ",");
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        e.target.value = "R$ " + valor;
    }

    function gravarPagamento() {
        let status = 0;
        const valorSemFormato = valorPagamento.current.value
            .replace(/[^\d,]/g, "") // remove R$, pontos, espaços
            .replace(/\./g, "")     // remove separadores de milhar
            .replace(",", ".");     // vírgula para ponto

        httpClient.post('/pagamentoavulso/gravar', {
            idPagamento: pagamentoAvulso.idPagamento,
            valorPagamento: valorSemFormato,
            dataPagamento: dataPagamento.current.value,
            idContrato: idContrato.current.value
        })
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    alert('Pagamento gravado com sucesso!');
                    window.location = '/admin/pagamentoAvulso';
                } else {
                    alert(r.msg);
                }
            });
    }


    return (
        <div>
            <h1>Pagamento Avulso</h1>
            <div>
                <div className="form-group">
                    <label>Contrato</label>
                    <select ref={idContrato} className="form-control" defaultValue={pagamentoAvulso.idContrato}>
                        <option value={0}>Selecione um contrato</option>
                        {
                            listaContratos.map(function(value,index){
                                if(value.idContrato == pagamentoAvulso[0].idContrato){
                                    return <option value={value.idContrato} selected>{value.idContrato}</option>
                                }else{
                                    return <option value={value.idContrato}>{value.idContrato}</option>
                                }
                            })
                        }
                    </select>
                </div>
                <div className="form-group">
                    <label>Valor</label>
                    <input ref={valorPagamento} type="text" className="form-control" defaultValue={pagamentoAvulso.valorPagamento} onChange={formatarValor} />
                </div>
                <div className="form-group">
                    <label>Data</label>
                    <input ref={dataPagamento} type="date" className="form-control" defaultValue={pagamentoAvulso.dataPagamento} />
                </div>
                <div className="form-group">
                    <Link href='/admin/contratos'><button className="btn btn-danger">Cancelar</button></Link>
                    <button onClick={gravarPagamento} className="btn btn-primary" style={{ marginLeft: 10 }}>Cadastrar</button>
                </div>
            </div>
        </div>
    )
}

'use client'
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import httpClient from "../utils/httpClient";

export default function PagamentoAvulso({ contrato }) {
    const [idContratoSelecionado, setIdContratoSelecionado] = useState(contrato ? contrato.idContrato : 0);
    const valorPagamento = useRef(null);
    const dataPagamento = useRef(null);
    const [listaContratos, setListaContratos] = useState([]);

    // Função para formatar valor em R$ enquanto digita
    function formatarValor(e) {
        let valor = e.target.value.replace(/\D/g, ""); // remove tudo que não é número
        valor = (parseInt(valor, 10) / 100).toFixed(2) + ""; // adiciona casas decimais
        valor = valor.replace(".", ","); // substitui ponto por vírgula
        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // adiciona separador de milhar
        e.target.value = "R$ " + valor;
    }

    function listarContratos() {
        let status = 0;
        httpClient.get('/contratos/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setListaContratos(r);
                } else {
                    alert(r.msg);
                }
            })
    }

    function gravarPagamento() {
        const valorSemFormato = valorPagamento.current.value
            .replace(/[^\d,]/g, "")
            .replace(/\./g, "")
            .replace(",", ".");

        let status = 0;
        httpClient.post('/pagamentoAvulso/gravar', {
            valorPagamento: valorSemFormato,
            dataPagamento: dataPagamento.current.value,
            idContrato: idContratoSelecionado
        })
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    alert(r.msg);
                    window.location.href = '/admin/contratos';
                } else {
                    alert(r.msg);
                }
            })
    }

    useEffect(() => {
        listarContratos();
    }, []);

    return (
        <div>
            <h1>Pagamento Avulso</h1>
            <div>
                <div className="form-group">
                    <label>Contrato</label>
                    <select disabled={contrato} className="form-control" value={idContratoSelecionado} onChange={(e) => setIdContratoSelecionado(parseInt(e.target.value))}>
                        {contrato ? (
                            <option value={contrato.idContrato}>
                                Contrato #{contrato.idContrato}
                            </option>
                        ) : (
                            listaContratos.map((value, index) => (
                                <option key={index} value={value.idContrato}>
                                    Contrato #{value.idContrato}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div className="form-group">
                    <label>Valor</label>
                    <input
                        ref={valorPagamento}
                        type="text"
                        className="form-control"
                        placeholder="R$ 0,00"
                        onChange={formatarValor}
                    />
                </div>

                <div className="form-group">
                    <label>Data</label>
                    <input ref={dataPagamento} type="date" className="form-control" />
                </div>

                <div className="form-group">
                    <Link href='/admin/pagamentoAvulso'><button className="btn btn-danger">Cancelar</button></Link>
                    <button onClick={gravarPagamento} className="btn btn-primary" style={{ marginLeft: 10 }}>Cadastrar</button>
                </div>
            </div>
        </div>
    );
}

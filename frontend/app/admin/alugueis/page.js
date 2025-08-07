'use client'
import httpClient from "@/app/utils/httpClient";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Alugueis() {
    const [listaAlugueis, setListaAlugueis] = useState([]);
    const [contratoSelecionado, setContratoSelecionado] = useState(null);
    const [listaImoveis, setListaImoveis] = useState([]);

    function listarImoveis(){
        let status = 0;
        httpClient.get('/imovel/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setListaImoveis(r.imoveis);
                } else {
                    setListaImoveis([]);
                }
            });
    }

    function acharRefImovel(idImovel){
        const imovel = listaImoveis.find(loc => loc.idImovel == idImovel);
        return imovel ? imovel.refImovel : 'Imóvel nao encontrado';
    }

    function listarAlugueis() {
        let status = 0;
        httpClient.get('/aluguel/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setListaAlugueis(r.alugueis);
                    console.log(r.alugueis);
                } else {
                    setListaAlugueis([]);
                }
            });
    }

    function quitarFatura(idAluguel) {
        confirm("Tem certeza que deseja marcar o aluguel como quitado?");
        if (confirm == true) {
            let status = 0;
            httpClient.post('/aluguel/marcarPago', {
                idAluguel: idAluguel
            })
                .then(r => {
                    status = r.status;
                    return r.json();
                })
                .then(r => {
                    if (status == 200) {
                        alert('Fatura quitada com sucesso!');
                        window.location.reload();
                    } else {
                        alert("Erro ao marcar aluguel como quitado!");
                    }
                })
        } else {
            alert("Erro ao marcar aluguel como quitado!")
        }
    }

    useEffect(() => {
        listarAlugueis();
        listarImoveis();
    }, []);

    // Agrupa os aluguéis por idContrato
    const alugueisArray = Array.isArray(listaAlugueis) ? listaAlugueis : [];

    const alugueisPorContrato = alugueisArray.reduce((acc, aluguel) => {
        if (!acc[aluguel.idContrato]) acc[aluguel.idContrato] = [];
        acc[aluguel.idContrato].push(aluguel);
        return acc;
    }, {});

    function handleContratoSelecionado(e) {
        const id = e.target.value;
        setContratoSelecionado(id);
    }

    return (
        <div>
            <h1>Aluguéis</h1>

            <div>
                <Link href="/admin/alugueis/gravar">
                    <button className="btn btn-primary">Cadastrar aluguel</button>
                </Link>
            </div>

            <div style={{ marginTop: '20px' }}>
                {alugueisArray.length === 0 ? (
                    <div>
                        <h3 className="text-muted">Não há aluguéis para exibir.</h3>
                    </div>
                ) : (
                    <>
                        <div className="form-group">
                            <label>Selecione um contrato</label>
                            <select
                                className="form-control"
                                onChange={handleContratoSelecionado}
                                value={contratoSelecionado || ""}
                            >
                                <option value="">Selecione um contrato</option>
                                {Object.keys(alugueisPorContrato).map(id => (
                                    <option key={id} value={id}> Contrato #{id} Imóvel: {acharRefImovel(id)}</option>
                                ))}
                            </select>
                        </div>

                        {contratoSelecionado && alugueisPorContrato[contratoSelecionado] && (
                            <table className="table table-bordered mt-3">
                                <thead>
                                    <tr>
                                        <th>Parcela</th>
                                        <th>Valor</th>
                                        <th>Quitada?</th>
                                        <th>ID Locador</th>
                                        <th>Quitar Fatura</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alugueisPorContrato[contratoSelecionado].map((aluguel, index) => (
                                        <tr key={index}>
                                            <td>Nº{index + 1}</td>
                                            <td>R$ {Number(aluguel.valorAluguel).toFixed(2)}</td>
                                            <td>{aluguel.quitada === 'S' ? "Sim" : "Não"}</td>
                                            <td>{aluguel.idLocador}</td>
                                            <td>
                                                {
                                                    aluguel.quitada == "N" ?
                                                        <button onClick={() => { quitarFatura(aluguel.idAluguel) }} className="btn btn-success">
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                        :
                                                        <button disabled className="btn btn-success">
                                                            <i className="fas fa-check"></i>
                                                        </button>
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

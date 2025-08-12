'use client'
import httpClient from "@/app/utils/httpClient";
import Link from "next/link";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

export default function Alugueis() {
    const [listaAlugueis, setListaAlugueis] = useState([]);
    const [contratoSelecionado, setContratoSelecionado] = useState(null);
    const [listaImoveis, setListaImoveis] = useState([]);
    const [listaContratos, setListaContratos] = useState([]);
    const [listaLocador, setListaLocador] = useState([]);
    const [listaLocatario, setListaLocatario] = useState([]);

    function listarLocador() {
        let status = 0;
        httpClient.get('/locador/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status === 200) {
                    setListaLocador(r);
                } else {
                    alert('Erro ao listar locadores.');
                }
            })
    }

    function listarLocatario() {
        let status = 0;
        httpClient.get('/locatario/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setListaLocatario(r);
                } else {
                    alert('Erro ao listar locatários.');
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
                    status = r.status;
                    setListaImoveis(r);
                } else {
                    alert('Erro ao listar imóveis.');
                }
            })
            .catch(() => alert('Erro ao listar imóveis.'));
    }

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
            .catch(() => alert('Erro ao listar contratos.'));
    }

    function acharIdImovelPorContrato(idContrato) {
        const contrato = listaContratos.find(c => c.idContrato == idContrato);
        return contrato ? contrato.idImovel : null;
    }

    function acharRefImovel(idImovel) {
        const imovel = listaImoveis.find(imv => imv.idImovel == idImovel);
        return imovel ? imovel.refImovel : null;
    }


    function listarAlugueis() {
        let status = 0;
        httpClient.get('/aluguel/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status === 200) {
                    setListaAlugueis(r.alugueis);
                } else {
                    setListaAlugueis([]);
                }
            })
            .catch(() => setListaAlugueis([]));
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

    function procurarNomeLocador(idLocador) {
        let locador = listaLocador.find(loc => loc.idLocador == idLocador);
        return locador ? locador.nomeLocador : 'Locador nao encontrado';
    }

    function procurarNomeLocatario(idLocatario) {
        let locatario = listaLocatario.find(loc => loc.idLocatario == idLocatario);
        return locatario ? locatario.nomeLocatario : 'Locatario nao encontrado';
    }

    useEffect(() => {
        listarAlugueis();
        listarImoveis();
        listarContratos();
        listarLocador();
        listarLocatario();
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

    function formatarData(dataVencimento) {
        return new Date(dataVencimento)
            .toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    function excluirAluguel(idContrato) {
        if (confirm("Tem certeza que deseja excluir todas as parcelas?")) {
            let status = 0;
            httpClient.delete(`/aluguel/excluir/${idContrato}`)
                .then(r => {
                    status = r.status;
                    return r.json();
                })
                .then(r => {
                    if (status === 200) {
                        alert(r.msg);
                        window.location.reload();
                    } else {
                        alert(r.msg);
                    }
                });
        } else {
            alert('Operação cancelada!');
        }
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
                            <div className="form-group">
                                <label>Selecione um contrato</label>
                                <select className="form-control" onChange={handleContratoSelecionado} value={contratoSelecionado || ""}>
                                    <option value="">Selecione um contrato</option>
                                    {Object.keys(alugueisPorContrato).map(idContrato => {
                                        const idImovel = acharIdImovelPorContrato(idContrato);
                                        return (
                                            <option key={idContrato} value={idContrato}>
                                                Contrato #{idContrato} Imóvel: {idImovel ? acharRefImovel(idImovel) : 'Imóvel não encontrado'}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {contratoSelecionado && (
                                <button
                                    onClick={() => excluirAluguel(contratoSelecionado)}
                                    className="btn btn-danger mt-2"
                                    type="button"
                                >
                                    Excluir Parcelas do Contrato {contratoSelecionado}
                                </button>
                            )}
                        </div>

                        {contratoSelecionado && alugueisPorContrato[contratoSelecionado] && (
                            <table className="table table-bordered mt-3">
                                <thead>
                                    <tr>
                                        <th>Parcela</th>
                                        <th>Valor</th>
                                        <th>Quitada?</th>
                                        <th>Locador</th>
                                        <th>Locatário</th>
                                        <th>Vencimento</th>
                                        <th>Quitar Fatura</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alugueisPorContrato[contratoSelecionado].map((aluguel, index) => (
                                        <tr key={index}>
                                            <td>Nº{index + 1}</td>
                                            <td>R$ {Number(aluguel.valorAluguel).toFixed(2)}</td>
                                            <td>{aluguel.quitada === 'S' ? "Sim" : "Não"}</td>
                                            <td>{procurarNomeLocador(aluguel.idLocador)}</td>
                                            <td>{procurarNomeLocatario(aluguel.idLocatario)}</td>
                                            <td
                                                style={{
                                                    color:
                                                        aluguel.quitada.toLowerCase() === 'n' && new Date(aluguel.dataVencimento) < new Date()
                                                            ? 'red'
                                                            : 'inherit',
                                                }}
                                            >
                                                {formatarData(aluguel.dataVencimento)}
                                                {aluguel.quitada.toLowerCase() === 'n' && new Date(aluguel.dataVencimento) < new Date() ? ' - Atrasado' : ''}
                                            </td>
                                            <td>
                                                {aluguel.quitada === "N" ? (
                                                    <button onClick={() => quitarFatura(aluguel.idAluguel)} className="btn btn-success">
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                ) : (
                                                    <button disabled className="btn btn-success">
                                                        <i className="fas fa-check"></i>
                                                    </button>
                                                )}
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

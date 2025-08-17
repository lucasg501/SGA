'use client'
import httpClient from "@/app/utils/httpClient";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Alugueis() {
    const [listaAlugueisFull, setListaAlugueisFull] = useState([]);
    const [listaAlugueis, setListaAlugueis] = useState([]);
    const [contratoSelecionado, setContratoSelecionado] = useState('');
    const [listaImoveis, setListaImoveis] = useState([]);
    const [listaContratos, setListaContratos] = useState([]);
    const [listaLocador, setListaLocador] = useState([]);
    const [listaLocatario, setListaLocatario] = useState([]);
    const [filtroRef, setFiltroRef] = useState('');

    // ---------------------- LISTAR DADOS ----------------------
    const listarDados = async (endpoint, setState) => {
        try {
            const r = await httpClient.get(endpoint);
            const data = await r.json();
            if (r.status === 200) setState(data);
            else alert(`Erro ao listar dados de ${endpoint}`);
        } catch { alert(`Erro ao listar dados de ${endpoint}`); }
    };

    useEffect(() => {
        listarDados('/locador/listar', setListaLocador);
        listarDados('/locatario/listar', setListaLocatario);
        listarDados('/imovel/listar', setListaImoveis);
        listarDados('/contratos/listar', setListaContratos);
        listarDados('/aluguel/listar', (data) => {
            if (data.alugueis) {
                setListaAlugueisFull(data.alugueis);
                setListaAlugueis(data.alugueis);
            } else setListaAlugueis([]);
        });
    }, []);

    // ---------------------- AUXILIARES ----------------------
    const acharIdImovelPorContrato = idContrato => {
        const contrato = listaContratos.find(c => c.idContrato == idContrato);
        return contrato ? contrato.idImovel : null;
    };

    const acharRefImovel = idImovel => {
        const imovel = listaImoveis.find(i => i.idImovel == idImovel);
        return imovel ? imovel.refImovel : null;
    };

    const procurarNomeLocador = id => listaLocador.find(l => l.idLocador == id)?.nomeLocador ?? 'Locador não encontrado';
    const procurarNomeLocatario = id => listaLocatario.find(l => l.idLocatario == id)?.nomeLocatario ?? 'Locatário não encontrado';
    const formatarData = d => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const buscarRefComprovante = aluguel => {
        const idImovel = aluguel.idImovel ?? acharIdImovelPorContrato(aluguel.idContrato);
        const ref = acharRefImovel(idImovel);
        return ref ? `${aluguel.idAluguel}${ref}` : null;
    };

    const quitarFatura = async idAluguel => {
        if (!confirm("Deseja marcar o aluguel como quitado?")) return;
        try {
            const r = await httpClient.post('/aluguel/marcarPago', { idAluguel });
            const data = await r.json();
            alert(data.msg || 'Fatura quitada!');
            if (r.status === 200) setListaAlugueisFull(prev => prev.map(a => a.idAluguel === idAluguel ? { ...a, quitada: 'S' } : a));
        } catch { alert('Erro ao marcar aluguel como quitado!'); }
    };

    const excluirAluguel = async idContrato => {
        if (!confirm("Deseja excluir todas as parcelas?")) return alert('Operação cancelada!');
        try {
            const r = await httpClient.delete(`/aluguel/excluir/${idContrato}`);
            const data = await r.json();
            alert(data.msg);
            if (r.status === 200) setListaAlugueisFull(prev => prev.filter(a => a.idContrato != idContrato));
        } catch { alert('Erro ao excluir parcelas.'); }
    };

    // ---------------------- FILTRO POR REFERÊNCIA ----------------------
    const buscarPorRef = ref => {
        setFiltroRef(ref);
        if (!ref.trim()) return setListaAlugueis(listaAlugueisFull);

        const filtrados = listaAlugueisFull.filter(aluguel => {
            const idImovel = aluguel.idImovel ?? acharIdImovelPorContrato(aluguel.idContrato);
            const refImovel = acharRefImovel(idImovel);
            return refImovel?.toLowerCase().includes(ref.toLowerCase());
        });
        setListaAlugueis(filtrados);
        setContratoSelecionado(''); // limpa o contrato selecionado ao filtrar
    };

    // ---------------------- AGRUPAMENTO ----------------------
    const alugueisArray = Array.isArray(listaAlugueis) ? listaAlugueis : [];
    const alugueisPorContrato = alugueisArray.reduce((acc, aluguel) => {
        const id = Number(aluguel.idContrato); // garante chave numérica
        if (!acc[id]) acc[id] = [];
        acc[id].push(aluguel);
        return acc;
    }, {});

    // ---------------------- RENDER ----------------------
    return (
        <div>
            <h1>Aluguéis</h1>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <Link href="/admin/alugueis/gravar">
                    <button className="btn btn-primary">Cadastrar aluguel</button>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                        className="form-control"
                        type="text"
                        placeholder="Buscar por referência do imóvel..."
                        value={filtroRef}
                        onChange={e => buscarPorRef(e.target.value)}
                    />
                    <button className="btn btn-secondary" onClick={() => buscarPorRef('')}>Limpar Filtro</button>
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                {filtroRef && alugueisArray.length > 0 && (
                    <h1>Listando resultados para o imóvel: {filtroRef}</h1>
                )}
                {alugueisArray.length === 0 ? (
                    <h3 className="text-muted">Não há aluguéis para exibir.</h3>
                ) : (
                    <>
                        {!filtroRef && (
                            <div className="form-group">
                                <label>Selecione um contrato:</label>
                                <select
                                    className="form-control"
                                    onChange={e => setContratoSelecionado(Number(e.target.value))}
                                    value={contratoSelecionado || ''}
                                >
                                    <option >Selecione um contrato</option>
                                    {Object.keys(alugueisPorContrato).map(idContrato => {
                                        const idImovel = acharIdImovelPorContrato(Number(idContrato));
                                        return (
                                            <option key={idContrato} value={idContrato}>
                                                Contrato #{idContrato} Imóvel: {idImovel ? acharRefImovel(idImovel) : 'Imóvel não encontrado'}
                                            </option>
                                        );
                                    })}
                                </select>

                                {contratoSelecionado && (
                                    <button onClick={() => excluirAluguel(contratoSelecionado)} className="btn btn-danger mt-2">
                                        Excluir Parcelas do Contrato {contratoSelecionado}
                                    </button>
                                )}
                            </div>
                        )}

                        {(filtroRef ? alugueisArray : (contratoSelecionado ? alugueisPorContrato[contratoSelecionado] : []))?.length > 0 && (
                            <table className="table table-bordered mt-3">
                                <thead>
                                    <tr>
                                        <th>Parcela</th>
                                        <th>Valor</th>
                                        <th>Quitada?</th>
                                        <th>Locador</th>
                                        <th>Locatário</th>
                                        <th>Vencimento</th>
                                        <th>Referência Comprovante</th>
                                        <th>Quitar Fatura</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(filtroRef ? alugueisArray : alugueisPorContrato[contratoSelecionado])?.map((aluguel, index) => (
                                        <tr key={index}>
                                            <td>Nº{index + 1}</td>
                                            <td>R$ {Number(aluguel.valorAluguel).toFixed(2)}</td>
                                            <td>{aluguel.quitada === 'S' ? 'Sim' : 'Não'}</td>
                                            <td>{procurarNomeLocador(aluguel.idLocador)}</td>
                                            <td>{procurarNomeLocatario(aluguel.idLocatario)}</td>
                                            <td style={{ color: aluguel.quitada.toLowerCase() === 'n' && new Date(aluguel.dataVencimento) < new Date() ? 'red' : 'inherit' }}>
                                                {formatarData(aluguel.dataVencimento)}
                                                {aluguel.quitada.toLowerCase() === 'n' && new Date(aluguel.dataVencimento) < new Date() ? ' - Atrasado' : ''}
                                            </td>
                                            <td>{buscarRefComprovante(aluguel) || 'Imóvel não encontrado'}</td>
                                            <td>
                                                {aluguel.quitada === 'N' ? (
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

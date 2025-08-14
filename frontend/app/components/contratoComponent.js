'use client'
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import httpClient from "../utils/httpClient";

export default function ContratoComponent(props) {
    const [contrato, setContrato] = useState({ idContrato: 0, idImovel: 0, idLocatario: 0, idLocador: 0, qtdParcelas: 0, valorParcela: 0, dataVencimento: '', inicioVigenciaContrato: '', fimVigenciaContrato: '' });
    const [listaImoveis, setListaImoveis] = useState([]);
    const [listaLocatario, setListaLocatario] = useState([]);
    const [nomeLocador, setNomeLocador] = useState('');
    const idImovel = useRef(null);
    const idLocatario = useRef(null);
    const qtdParcelas = useRef(null);
    const valorParcela = useRef(null);
    const dataVencimento = useRef(null);
    const inicioVigenciaContrato = useRef(null);
    const fimVigenciaContrato = useRef(null);

    function formatDateToInput(date) {
        if (!date) return '';
        if (date.includes('T')) return date.split('T')[0];
        if (date.includes('/')) {
            const parts = date.split('/');
            if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return date;
    }

    useEffect(() => {
        listarImoveis();
        listarLocatario();
    }, []);

    useEffect(() => {
        if (props.contrato) {
            setContrato({
                idContrato: props.contrato.idContrato || 0,
                idImovel: props.contrato.idImovel || 0,
                idLocatario: props.contrato.idLocatario || 0,
                idLocador: props.contrato.idLocador || 0,
                qtdParcelas: props.contrato.qtdParcelas || 0,
                valorParcela: props.contrato.valorParcela || 0,
                dataVencimento: formatDateToInput(props.contrato.dataVencimento),
                inicioVigenciaContrato: formatDateToInput(props.contrato.inicioVigenciaContrato),
                fimVigenciaContrato: formatDateToInput(props.contrato.fimVigenciaContrato)
            });
            if (props.contrato.idLocador) buscarNomeLocador(props.contrato.idLocador);
        }
    }, [props.contrato]);

    function listarImoveis() {
        httpClient.get('/imovel/listar').then(async r => {
            if (r.status === 200) {
                const imoveis = await r.json();
                setListaImoveis(imoveis);
            } else {
                alert('Erro ao listar imóveis.');
            }
        });
    }

    function listarLocatario() {
        httpClient.get('/locatario/listar').then(async r => {
            if (r.status === 200) {
                const locatarios = await r.json();
                setListaLocatario(locatarios);
            } else {
                alert('Erro ao listar locatários.');
            }
        });
    }

    function buscarImovelEPreencherLocador(idImovel) {
        httpClient.get(`/imovel/obter/${idImovel}`).then(async r => {
            if (r.status === 200) {
                const imovel = await r.json();
                if (imovel && imovel.idLocador) {
                    setContrato(prev => ({ ...prev, idImovel: idImovel, idLocador: imovel.idLocador }));
                    buscarNomeLocador(imovel.idLocador);
                } else {
                    setNomeLocador('');
                    alert("Imóvel não possui locador.");
                }
            } else {
                alert('Erro ao obter imóvel.');
            }
        });
    }

    function buscarNomeLocador(idLocador) {
        httpClient.get(`/locador/obterPorId/${idLocador}`).then(async r => {
            if (r.status === 200) {
                const locador = await r.json();
                setNomeLocador(locador?.nomeLocador || '');
            } else {
                alert('Erro ao obter locador.');
            }
        });
    }

    function handleSubmit() {
        if (!contrato.idImovel || !contrato.idLocatario || contrato.qtdParcelas <= 0 || contrato.valorParcela <= 0) {
            alert('Preencha todos os campos corretamente.');
            return;
        }
        if (contrato.inicioVigenciaContrato > contrato.fimVigenciaContrato) {
            alert('A data de inicio da vigência do contrato deve ser menor que a data de fim da vigência do contrato.');
        } else {
            let status = 0;
            httpClient.post('/contratos/gravar', {
                idImovel: contrato.idImovel,
                idLocatario: contrato.idLocatario,
                idLocador: contrato.idLocador,
                qtdParcelas: contrato.qtdParcelas,
                valorParcela: contrato.valorParcela,
                dataVencimento: contrato.dataVencimento,
                inicioVigenciaContrato: contrato.inicioVigenciaContrato,
                fimVigenciaContrato: contrato.fimVigenciaContrato
            }).then(r => {
                status = r.status;
                return r.json();
            }).then(r => {
                if (status == 200) {
                    alert('Contrato gravado com sucesso.');
                    window.location = '/admin/contratos';
                } else {
                    alert(r.msg);
                }
            });
        }
    }

    function alterarContrato() {
        if (contrato.inicioVigenciaContrato > contrato.fimVigenciaContrato) {
            alert('A data de inicio da vigência do contrato deve ser menor que a data de fim da vigência do contrato.');
        } else {
            let status = 0;
            httpClient.put('/contratos/alterar', {
                idContrato: contrato.idContrato,
                idImovel: contrato.idImovel,
                idLocatario: contrato.idLocatario,
                idLocador: contrato.idLocador,
                qtdParcelas: contrato.qtdParcelas,
                valorParcela: contrato.valorParcela,
                dataVencimento: contrato.dataVencimento,
                inicioVigenciaContrato: contrato.inicioVigenciaContrato,
                fimVigenciaContrato: contrato.fimVigenciaContrato
            }).then(r => {
                status = r.status;
                return r.json();
            }).then(r => {
                if (status == 200) {
                    alert('Contrato alterado com sucesso.');
                    window.location = '/admin/contratos';
                } else {
                    alert('Erro ao alterar contrato.');
                }
            });
        }
    }

    function formatarValor(valor) {
        if (!valor) return '';
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
    }

    return (
        <div>
            <h1>{props.contrato ? 'Alterar Contrato' : 'Novo Contrato'}</h1>
            <div>
                <div className="form-group">
                    <label>Imóvel</label>
                    <select ref={idImovel} className="form-control" value={contrato.idImovel} onChange={(e) => { const idSelecionado = parseInt(e.target.value); buscarImovelEPreencherLocador(idSelecionado); }}>
                        <option value={0}>Selecione um imóvel</option>
                        {listaImoveis.map(value => <option key={value.idImovel} value={value.idImovel}>{value.refImovel}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Locatário</label>
                    <select ref={idLocatario} className="form-control" value={contrato.idLocatario} onChange={(e) => setContrato({ ...contrato, idLocatario: parseInt(e.target.value) })}>
                        <option value={0}>Selecione um locatário</option>
                        {listaLocatario.map(value => <option key={value.idLocatario} value={value.idLocatario}>{value.nomeLocatario}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Locador</label>
                    <input type="text" className="form-control" value={nomeLocador} disabled />
                </div>
                <div className="form-group">
                    <label>Quantidade de Parcelas</label>
                    <input ref={qtdParcelas} type="number" className="form-control" value={contrato.qtdParcelas} onChange={(e) => setContrato({ ...contrato, qtdParcelas: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                    <label>Valor da Parcela</label>
                    <input ref={valorParcela} type="text" className="form-control" value={formatarValor(contrato.valorParcela)} onChange={(e) => { const apenasNumeros = e.target.value.replace(/[^\d]/g, ''); const valorFloat = parseFloat(apenasNumeros) / 100; setContrato({ ...contrato, valorParcela: valorFloat }); }} />
                </div>
                <div className="form-group">
                    <label>Primeira data de vencimento</label>
                    <input ref={dataVencimento} type="date" className="form-control" value={contrato.dataVencimento} onChange={(e) => setContrato({ ...contrato, dataVencimento: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Data de inicio do contrato</label>
                    <input ref={inicioVigenciaContrato} type="date" className="form-control" value={contrato.inicioVigenciaContrato} onChange={(e) => setContrato({ ...contrato, inicioVigenciaContrato: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Data de término do contrato</label>
                    <input ref={fimVigenciaContrato} type="date" className="form-control" value={contrato.fimVigenciaContrato} onChange={(e) => setContrato({ ...contrato, fimVigenciaContrato: e.target.value })} />
                </div>
                <div className="form-group">
                    <Link href="/admin/contratos"><button className="btn btn-danger">Cancelar</button></Link>
                    <button style={{ marginLeft: '10px' }} className="btn btn-primary" onClick={props.contrato ? alterarContrato : handleSubmit}>Gravar</button>
                </div>
            </div>
        </div>
    );
}

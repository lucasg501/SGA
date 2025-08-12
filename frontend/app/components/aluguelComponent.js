'use client'
import { useEffect, useState } from "react"
import httpClient from "../utils/httpClient";
import Link from "next/link";

export default function AluguelComponent(props) {

    const [listaContratos, setListaContratos] = useState([]);
    const [listaLocador, setListaLocador] = useState([]);
    const [listaLocatario, setListaLocatario] = useState([]);

    const [contratoSelecionado, setContratoSelecionado] = useState(null);

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
                    console.log("Contratos recebidos:", r);
                } else {
                    alert('Erro ao listar contratos.');
                }
            })
    }

    function listarLocadores() {
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

    function listarLocatarios() {
        let status = 0;
        httpClient.get('/locatario/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status === 200) {
                    setListaLocatario(r);
                } else {
                    alert('Erro ao listar locatários.');
                }
            })
    }

    function acharLocador(idLocador) {
        const locador = listaLocador.find(loc => loc.idLocador == idLocador);
        return locador ? locador.nomeLocador : 'Locador não encontrado';
    }

    function acharLocatario(idLocatario) {
        const locatario = listaLocatario.find(loc => loc.idLocatario == idLocatario);
        return locatario ? locatario.nomeLocatario : 'Locatário não encontrado';
    }

    function handleSelectChange(event) {
        const id = Number(event.target.value);
        const contrato = listaContratos.find(c => c.idContrato === id);
        setContratoSelecionado(contrato || null);
    }

    function gerarAluguel() {
        if (!contratoSelecionado) {
            alert('Selecione um contrato válido antes de gerar o aluguel.');
            return;
        }
        let status = 0;
        httpClient.post('/aluguel/gravar', {
            idContrato: contratoSelecionado.idContrato,
            valorAluguel: contratoSelecionado.valorParcela,
            quitada: contratoSelecionado.quitada,
            idLocatario: contratoSelecionado.idLocatario,
            idLocador: contratoSelecionado.idLocador,
            dataVencimento: contratoSelecionado.dataVencimento
        })
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status === 200) {
                    alert('Aluguel gerado com sucesso!');
                    window.location = '/admin/alugueis';
                } else {
                    alert(r.msg);
                }
            })
    }

    useEffect(() => {
        listarContratos();
        listarLocadores();
        listarLocatarios();
    }, []);

    return (
        <div>
            <h1>Gerar Aluguel</h1>

            <div className="form-group">
                <label>Selecione o contrato na qual deseja gerar os aluguéis</label>
                <select
                    className="form-control"
                    onChange={handleSelectChange}
                    defaultValue={props.contrato || 0}
                >
                    <option value={0}>Selecione o número do contrato</option>
                    {
                        listaContratos.map((value) => (
                            <option
                                key={value.idContrato}
                                value={value.idContrato}
                            >
                                {`Contrato ${value.idContrato} - Locatário: ${acharLocatario(value.idLocatario)} - Locador: ${acharLocador(value.idLocador)}`}
                            </option>
                        ))
                    }
                </select>
            </div>

            <div className="form-group">
                <Link href="/admin/alugueis">
                    <button className="btn btn-danger">Cancelar</button>
                </Link>

                <button style={{ marginLeft: '10px' }} onClick={gerarAluguel} className="btn btn-primary">Gerar Aluguel</button>
            </div>
        </div>
    )
}

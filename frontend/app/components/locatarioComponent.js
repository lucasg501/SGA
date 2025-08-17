'use client'

import { useState, useEffect } from "react";
import httpClient from "../utils/httpClient";
import Link from "next/link";

export default function LocatarioComponent({ locatario: locatarioProps }) {

    // Estado do locatário
    const [locatario, setLocatario] = useState({
        idLocatario: 0,
        nomeLocatario: '',
        cpfLocatario: ''
    });

    // Estado do CPF formatado
    const [cpfFormatado, setCpfFormatado] = useState('');

    useEffect(() => {
        if (locatarioProps) {
            setLocatario(locatarioProps);
            setCpfFormatado(formatarCPF(locatarioProps.cpfLocatario)); // já formata ao carregar
        }
    }, [locatarioProps]);

    // Função para formatar CPF
    function formatarCPF(valor) {
        if (!valor) return '';
        valor = valor.replace(/\D/g, '').substring(0, 11); // mantém apenas números, até 11 dígitos
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        return valor;
    }

    function handleCpfChange(e) {
        const valor = e.target.value;
        setCpfFormatado(formatarCPF(valor));
    }

    function validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1+$/.test(cpf)) return false;
        return true;
    }

    function validarNome(nome) {
        return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nome);
    }

    function gravarLocatario() {
        const nome = locatario.nomeLocatario.trim();
        const cpfSemMascara = cpfFormatado.replace(/\D/g, '');

        if (!validarNome(nome)) {
            alert("Nome inválido. Use apenas letras e espaços.");
            return;
        }

        if (!validarCPF(cpfSemMascara)) {
            alert("CPF inválido.");
            return;
        }

        httpClient.post('/locatario/gravar', {
            nomeLocatario: nome,
            cpfLocatario: cpfSemMascara
        })
            .then(r => r.json().then(data => ({ status: r.status, data })))
            .then(({ status, data }) => {
                if (status === 200) {
                    alert(data.message);
                    window.location.href = '/admin/locatario';
                } else {
                    alert(data.message);
                }
            });
    }

    function alterarLocatario() {
        const nome = locatario.nomeLocatario.trim();
        const cpfSemMascara = cpfFormatado.replace(/\D/g, '');

        if (!validarNome(nome)) {
            alert("Nome inválido. Use apenas letras e espaços.");
            return;
        }

        if (!validarCPF(cpfSemMascara)) {
            alert("CPF inválido.");
            return;
        }

        httpClient.put('/locatario/alterar', {
            idLocatario: locatario.idLocatario,
            nomeLocatario: nome,
            cpfLocatario: cpfSemMascara
        })
            .then(r => r.json().then(data => ({ status: r.status, data })))
            .then(({ status, data }) => {
                if (status === 200) {
                    alert(data.message);
                    window.location.href = '/admin/locatario';
                } else {
                    alert(data.message);
                }
            });
    }

    return (
        <div>
            <div>
                <h1>{locatario.idLocatario ? 'Alterar Locatário' : 'Gravar Locatário'}</h1>
                <div>
                    <Link href='/admin/locatario'>
                        <button style={{ margin: '10px' }} className="btn btn-secondary">Voltar</button>
                    </Link>
                </div>
            </div>
            <div>
                <div className="form-group">
                    <label>Nome</label>
                    <input
                        className="form-control"
                        type="text"
                        value={locatario.nomeLocatario}
                        onChange={e => setLocatario({ ...locatario, nomeLocatario: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label>CPF</label>
                    <input
                        className="form-control"
                        type="text"
                        value={cpfFormatado}
                        onChange={handleCpfChange}
                        maxLength={14} // 000.000.000-00
                    />
                </div>

                <div className="form-group">
                    <Link href='/admin/locatario'>
                        <button className="btn btn-danger">Cancelar</button>
                    </Link>
                    <button
                        style={{ marginLeft: '10px' }}
                        className="btn btn-primary"
                        onClick={locatario.idLocatario ? alterarLocatario : gravarLocatario}>
                        {locatario.idLocatario ? 'Alterar' : 'Gravar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

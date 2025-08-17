'use client'

import { useRef, useState } from "react";
import httpClient from "../utils/httpClient";
import Link from "next/link";

export default function LocatarioComponent(props) {

    const [locatario, setLocatario] = useState({});
    const [cpfFormatado, setCpfFormatado] = useState(locatario.cpfLocatario || '');

    const nomeLocatario = useRef(null);
    const cpfLocatario = useRef(null);

    // Função para formatar CPF
    function formatarCPF(valor) {
        if (!valor) return '';
        valor = valor.replace(/\D/g, ''); // remove tudo que não é número
        valor = valor.substring(0, 11); // limita a 11 dígitos
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        return valor;
    }

    function handleCpfChange(e) {
        const valor = e.target.value;
        setCpfFormatado(formatarCPF(valor));
    }

    function gravarLocatario() {
        let status = 0;
        // envia somente números
        const cpfSemMascara = cpfFormatado.replace(/\D/g, '');
        httpClient.post('/locatario/gravar', {
            nomeLocatario: nomeLocatario.current.value,
            cpfLocatario: cpfSemMascara
        })
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setLocatario(r);
                } else {
                    alert(r.message);
                }
            })
    }

    function alterarLocatario() {
        let status = 0;
        const cpfSemMascara = cpfFormatado.replace(/\D/g, '');
        httpClient.post('/locatario/alterar', {
            idLocatario: locatario.idLocatario,
            nomeLocatario: nomeLocatario.current.value,
            cpfLocatario: cpfSemMascara
        })
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setLocatario(r);
                } else {
                    alert(r.message);
                }
            })
    }

    return (
        <div>
            <div>
                <h1>{locatario.idLocatario ? 'Alterar Locatario' : 'Gravar Locatario'}</h1>
                <div>
                    <Link href='/admin/locatario'>
                        <button className="btn btn-secondary">Voltar</button>
                    </Link>
                </div>
            </div>
            <div>
                <div className="form-group">
                    <label>Nome</label>
                    <input className="form-control" type="text" ref={nomeLocatario} defaultValue={locatario.nomeLocatario} />
                </div>

                <div className="form-group">
                    <label>CPF</label>
                    <input
                        className="form-control"
                        type="text"
                        ref={cpfLocatario}
                        value={cpfFormatado}
                        onChange={handleCpfChange}
                        maxLength={14} // 000.000.000-00
                    />
                </div>

                <div className="form-group">
                    <Link href='/admin/locatario'>
                        <button className="btn btn-danger">Cancelar</button>
                    </Link>
                    <button style={{ marginLeft: '10px' }} className="btn btn-primary" onClick={locatario.idLocatario ? alterarLocatario : gravarLocatario}>{locatario.idLocatario ? 'Alterar' : 'Gravar'}</button>
                </div>
            </div>
        </div>
    )
}

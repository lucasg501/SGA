'use client'

import httpClient from "@/app/utils/httpClient";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Locatario() {

    const [listaLocatarios, setListaLocatarios] = useState([]);

    function listarLocatarios() {
        let status = 0;
        httpClient.get('/locatario/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setListaLocatarios(r);
                } else {
                    alert('Erro ao listar locatários.');
                }
            })
    }

    useEffect(() => {
        listarLocatarios();
    }, []);

    // Função para formatar CPF
    function formatarCPF(cpf) {
        if (!cpf) return '';
        cpf = cpf.replace(/\D/g, ''); // remove qualquer caractere não numérico
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    return (
        <div>
            <h1>Locatarios</h1>

            <div>
                <Link href="/admin/locatario/gravar">
                    <button className="btn btn-primary">Novo Locatário</button>
                </Link>
            </div>

            <div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>CPF</th>
                            <th>Editar</th>
                            <th>Excluir</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            listaLocatarios.map(function (value, index) {
                                return (
                                    <tr key={index}>
                                        <td>{value.nomeLocatario}</td>
                                        <td>{formatarCPF(value.cpfLocatario)}</td>
                                        <td>
                                            <Link href={`/admin/locatario/alterar/${value.idLocatario}`}>
                                                <button className="btn btn-primary">Editar</button>
                                            </Link>
                                        </td>
                                        <td>
                                            <button className="btn btn-danger">Excluir</button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

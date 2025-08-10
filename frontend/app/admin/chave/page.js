'use client'
import httpClient from "@/app/utils/httpClient";
import { useEffect, useState } from "react"
import Link from "next/link";

export default function Chave() {

    const [listaChaves, setListaChaves] = useState([]);
    const [listaTipos, setListaTipos] = useState([]);

    // Formatação CPF: 000.000.000-00
    function formatarCPF(valor) {
        valor = valor.replace(/\D/g, '').slice(0, 11);
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return valor;
    }

    // Formatação CNPJ: 00.000.000/0000-00
    function formatarCNPJ(valor) {
        valor = valor.replace(/\D/g, '').slice(0, 14);
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
        return valor;
    }

    // Formatação telefone: (00) 00000-0000 ou (00) 0000-0000
    function formatarTelefone(valor) {
        valor = valor.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);

        if (valor.length > 10) {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (valor.length > 9) {
            valor = valor.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
        } else if (valor.length > 2) {
            valor = valor.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        } else if (valor.length > 0) {
            valor = valor.replace(/^(\d*)$/, '($1');
        }
        return valor;
    }

    // Formata chavePix conforme tipoPix
    function formatarChavePix(chavePix, tipoPix) {
        if (!chavePix) return '';
        switch (tipoPix) {
            case 1: // Telefone
                return formatarTelefone(chavePix);
            case 3: // CPF
                return formatarCPF(chavePix);
            case 4: // CNPJ
                return formatarCNPJ(chavePix);
            default:
                return chavePix; // e-mail ou outros tipos sem máscara
        }
    }

    function listarChaves() {
        let status = 0;
        httpClient.get('/usuarios/listarChave')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setListaChaves(r);
                } else {
                    alert('Erro ao listar chaves.');
                }
            })
    }

    function listarTipos() {
        let status = 0;
        httpClient.get('/tiposPix/listar')
            .then(r => {
                status = r.status;
                return r.json();
            })
            .then(r => {
                if (status == 200) {
                    setListaTipos(r);
                } else {
                    alert('Erro ao listar tipos.');
                }
            })
    }

    function pegarTipoPix(idTipo) {
        const tipoPix = listaTipos.find(tipo => tipo.idTipo === idTipo);
        return tipoPix ? tipoPix.nomeTipo : null;
    }

    useEffect(() => {
        listarChaves();
        listarTipos();
    }, []);

    return (
        <div>
            <h1>Chave PIX</h1>

            <div>
                {
                    listaChaves.length > 0 ?
                        <Link style={{ display: 'none' }} href={'/admin/chave/gravar'}>
                            <button className="btn btn-primary">Cadastrar</button>
                        </Link>
                        :
                        <Link href={'/admin/chave/gravar'}>
                            <button className="btn btn-primary">Cadastrar</button>
                        </Link>
                }
            </div>

            <div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Tipo</th>
                            <th>Chave PIX</th>
                            <th>Nome PIX</th>
                            <th>Cidade</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            listaChaves.map((value, index) => (
                                <tr key={index}>
                                    <td>{value.idUsuario}</td>
                                    <td>{pegarTipoPix(value.tipoPix)}</td>
                                    <td>{formatarChavePix(value.chavePix, value.tipoPix)}</td>
                                    <td>{value.nomePix}</td>
                                    <td>{value.cidade}</td>
                                    <td>
                                        <Link href={`/admin/chave/alterar/${value.idUsuario}`}>
                                            <button className="btn btn-primary">Alterar</button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>

        </div>
    )
}

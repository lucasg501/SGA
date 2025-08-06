'use client'

import httpClient from "@/app/utils/httpClient";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Contratos(){

    const [contratos, setContratos] = useState([]);

    function listarContratos(){
        let status = 0;
        httpClient.get('/contratos/listar')
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                setContratos(r);
            }else{
                alert('Erro ao listar contratos.');
            }
        })
    }

    useEffect(() =>{
        listarContratos();
    },[]);

    return(
        <div>
            <h1>Contratos</h1>

            <div>
                <Link href='/admin/contratos/gravar'>
                    <button style={{margin: '10px'}} className="btn btn-primary">Novo Contrato</button>
                </Link>
            </div>

            <div>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Id do Imóvel</th>
                            <th>Locatário</th>
                            <th>Locador</th>
                            <th>Quantidade de Parcelas</th>
                            <th>Valor das Parcelas</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            contratos.map(function(value,index){
                                return(
                                    <tr key={index}>
                                        <td>{value.idContrato}</td>
                                        <td>{value.idImovel}</td>
                                        <td>{value.idLocatario}</td>
                                        <td>{value.idLocador}</td>
                                        <td>{value.qtdParcelas}</td>
                                        <td>R${value.valorParcela}</td>
                                        <td>
                                            <Link href={`/admin/contratos/alterar/${value.id}`}>
                                                <button className="btn btn-primary">Alterar</button>
                                            </Link>
                                            <button style={{marginLeft: '10px'}} className="btn btn-danger">Excluir</button>
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
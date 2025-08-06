'use client'
import httpClient from "@/app/utils/httpClient";
import { useEffect, useState } from "react"
import Link from "next/link";

export default function Chave() {

    const [listaChaves, setListaChaves] = useState([]);

    function listarChaves(){
        let status = 0;
        httpClient.get('/usuarios/listarChave')
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                setListaChaves(r);
            }else{
                alert('Erro ao listar chaves.');
            }
        })
    }

    useEffect(() =>{
        listarChaves();
    },[]);

    return (
        <div>
            <h1>Chave PIX</h1>

            <div>
                {
                    listaChaves.length > 0 ?
                    <Link style={{display:'none'}} href={'/admin/chave/gravar'}>
                        <button  className="btn btn-primary">Cadastrar</button>
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
                            <th>Chave PIX</th>
                            <th>Nome PIX</th>
                            <th>Cidade</th>
                            <th>Ações</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            listaChaves.map(function(value,index){
                                return(
                                    <tr key={index}>
                                        <td>{value.idUsuario}</td>
                                        <td>{value.chavePix}</td>
                                        <td>{value.nomePix}</td>
                                        <td>{value.cidade}</td>
                                        <td>
                                            <Link href={`/admin/chave/alterar/${value.idUsuario}`}>
                                                <button className="btn btn-primary">Alterar</button>
                                            </Link>
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
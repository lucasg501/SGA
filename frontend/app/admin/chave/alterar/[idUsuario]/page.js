'use client'
import httpClient from "@/app/utils/httpClient";
import { use, useEffect, useState } from "react"
import ChaveComponent from "@/app/components/chaveComponent";

export default function alterarChave({params}){

    const {idUsuario} = use(params);

    const [chave, setChave] = useState(null);

    function carregarChave(){
        let status = 0;
        httpClient.get(`/usuarios/obter/${idUsuario}`)
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                setChave(r);
            }else{
                alert('Erro ao listar chave.');
            }
        })
    }

    useEffect(() =>{
        carregarChave();
    },[]);

    return(
        <div>
            {chave != null ? <ChaveComponent chave={chave}></ChaveComponent> : <div>Carregando...</div>}
        </div>
    )
}
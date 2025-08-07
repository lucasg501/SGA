'use client'
import httpClient from "@/app/utils/httpClient";
import { use, useEffect, useState } from "react";
import ContratoComponent from "@/app/components/contratoComponent";

export default function AlterarContrato({params}) {

    const {idContrato} = use(params);

    const [contrato, setContrato] = useState(null);

    function listarContrato(){
        let status = 0;
        httpClient.get(`/contratos/obter/${idContrato}`)
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                setContrato(r);
            }else{
                alert('Erro ao listar contrato.');
            }
        })
    }

    useEffect(()=>{
        listarContrato();
    },[]);

    return (
        <div>
            {contrato != null ? <ContratoComponent contrato={contrato} /> : <div>Carregando...</div>}
        </div>
    );
}
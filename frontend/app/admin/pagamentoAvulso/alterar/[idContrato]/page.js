'use client'

import httpClient from "@/app/utils/httpClient";
import { use, useEffect, useState } from "react";
import PagamentoAvulsoComponent from "@/app/components/pagamentoAvulsoComponent";

export default function AlterarPagamentoAvulso({params}) {

    const {idContrato} = use(params);

    const [contrato, setContrato] = useState(null);

    function buscarContrato(){
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
                alert(r.msg);
            }
        })
    }

    useEffect(()=>{
        buscarContrato();
    },[]);

    return (
        <div>
            {contrato != null ? <PagamentoAvulsoComponent contrato={contrato} /> : <div>Carregando...</div>}
        </div>
    );
}
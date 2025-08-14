'use client'

import httpClient from "@/app/utils/httpClient";
import { use, useEffect, useState } from "react";
import PagamentoAvulsoComponent from "@/app/components/pagamentoAvulsoComponent";

export default function AlterarPagamentoAvulso({params}) {

    const {idContrato} = use(params);

    const [pagamentoAvulso, setPagamentoAvulso] = useState(null);

    function buscarPagamento(){
        let status = 0;
        httpClient.get(`/pagamentoAvulso/obterPorContrato/${idContrato}`)
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                setPagamentoAvulso(r);
            }else{
                alert(r.msg);
            }
        })
    }

    useEffect(()=>{
        buscarPagamento();
    },[]);

    return (
        <div>
            {pagamentoAvulso != null ? <PagamentoAvulsoComponent pagamentoAvulso={pagamentoAvulso} /> : <div>Carregando...</div>}
        </div>
    );
}
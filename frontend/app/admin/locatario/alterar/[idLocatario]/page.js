'use client'

import httpClient from "@/app/utils/httpClient";
import LocatarioComponent from "@/app/components/locatarioComponent";
import { use, useEffect, useState } from "react";

export default function alterarLocatario({params}){

    const {idLocatario} = use(params);
    const [locatario, setLocatario] = useState(null);

    function listarLocatario(){
        let status = 0;
        httpClient.get(`/locatario/obter/${idLocatario}`)
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                setLocatario(r);
            }else{
                alert(r.message);
            }
        })
    }

    useEffect(() =>{
        listarLocatario();
    },[]);

    return(
        <div>
            {locatario != null ? <LocatarioComponent locatario={locatario}></LocatarioComponent> : <div>Carregando...</div>}
        </div>
    )
};
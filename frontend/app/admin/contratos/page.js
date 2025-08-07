'use client'

import httpClient from "@/app/utils/httpClient";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Contratos(){

    const [contratos, setContratos] = useState([]);
    const [listaLocatarios, setListaLocatarios] = useState([]);
    const [listaLocadores, setListaLocadores] = useState([]);
    const [listaImoveis, setListaImoveis] = useState([]);

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

    function listarLocatarios(){
        let status = 0;
        httpClient.get('/locatario/listar')
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                setListaLocatarios(r);
            }else{
                alert('Erro ao listar locatários.');
            }
        })
    }

    function listarLocadores(){
        let status = 0;
        httpClient.get('/locador/listar')
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                setListaLocadores(r);
            }else{
                alert('Erro ao listar locadores.');
            }
        })
    }

    function listarImoveis(){
        let status = 0;
        httpClient.get('/imovel/listar')
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                setListaImoveis(r);
            }else{
                alert('Erro ao listar imóveis.');
            }
        })
    }

    function buscarLocatario(idLocatario){
        const locatario = listaLocatarios.find(loc => loc.idLocatario == idLocatario);
        return locatario ? locatario.nomeLocatario : 'Locatário não encontrado';
    }

    function buscarLocador(idLocador){
        const locador = listaLocadores.find(loc => loc.idLocador == idLocador);
        return locador ? locador.nomeLocador : 'Locador não encontrado';
    }

    function buscarImovel(idImovel){
        const imovel = listaImoveis.find(loc => loc.idImovel == idImovel);
        return imovel ? imovel.refImovel : 'Imóvel não encontrado';
    }

    useEffect(() =>{
        listarContratos();
        listarLocatarios();
        listarLocadores();
        listarImoveis();
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
                                        <td>{buscarImovel(value.idImovel)}</td>
                                        <td>{buscarLocatario(value.idLocatario)}</td>
                                        <td>{buscarLocador(value.idLocador)}</td>
                                        <td>{value.qtdParcelas}</td>
                                        <td>R${value.valorParcela}</td>
                                        <td>
                                            <Link href={`/admin/contratos/alterar/${value.idContrato}`}>
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
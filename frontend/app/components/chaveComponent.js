'use client'
import Link from "next/link";
import { useRef, useState } from "react";
import httpClient from "../utils/httpClient";

export default function chaveComponent(props){

    const [chave, setChave] = useState(props.chave ? props.chave : {
        idUsuario: 0,
        login: '',
        senha: '',
        chavePix: '',
        nomePix: '',
        cidade: ''
    });

    const chavePix = useRef(null);
    const nomePix = useRef(null);
    const cidade = useRef(null);

    function gravarChave(){
        let status = 0;
        httpClient.post('/usuarios/gravarChave',{
            idUsuario: chave.idUsuario,
            chavePix: chavePix.current.value,
            nomePix: nomePix.current.value,
            cidade: cidade.current.value
        })
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                alert('Chave PIX gravada com sucesso.');
            }else{
                alert('Erro ao gravar chave PIX.');
            }
        })
    }

    function alterarChave(){
        let status = 0;
        httpClient.post('/usuarios/gravarChave',{
            idUsuario: chave.idUsuario,
            chavePix: chavePix.current.value,
            nomePix: nomePix.current.value,
            cidade: cidade.current.value
        })
        .then(r=>{
            status = r.status;
            return r.json();
        })
        .then(r=>{
            if(status == 200){
                alert('Chave PIX alterada com sucesso.');
                window.location = '/admin/chave';
            }else{
                alert('Erro ao alterar chave PIX.');
            }
        })
    }

    return(
        <div>
            <h1>{props.chave != "" ? 'Alterar chave PIX' : 'Cadastrar Chave PIX'}</h1>

            <div>
                <Link href='/admin/chave'>
                    <button className="btn btn-secondary">Voltar</button>
                </Link>
            </div>

            <div>
                <div className="form-group">
                    <label>Chave PIX</label>
                    <input type="text" ref={chavePix} className="form-control" placeholder="Chave PIX" defaultValue={chave.chavePix}></input>
                    <p>Digite a sua chave PIX (e-mail, telefone, cpf, etc)</p>
                </div>
                <div className="form-group">
                    <label>Nome PIX</label>
                    <input type="text" maxLength={25} ref={nomePix} className="form-control" placeholder="Nome PIX" defaultValue={chave.nomePix}></input>
                    <p>Digite o seu nome PIX (o nome não pode exceder 25 caracteres)</p>
                </div>

                <div className="form-group">
                    <label>Cidade</label>
                    <input type="text" maxLength={25} ref={cidade} className="form-control" placeholder="Cidade do PIX" defaultValue={chave.cidade}></input>
                    <p>Digite a cidade do PIX (o nome da cidade não pode exceder 25 caracteres)</p>
                </div>

                <div className="form-group">
                    <Link href='/admin/chave'>
                        <button className="btn btn-danger">Cancelar</button>
                    </Link>

                    <button onClick={props.chave != "" ? alterarChave : gravarChave} style={{marginLeft: 10}} className="btn btn-primary">Cadastrar</button>
                </div>

            </div>
        </div>
    )

}
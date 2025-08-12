'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import httpClient from "../utils/httpClient";

export default function chaveComponent(props) {
    function formatarCPF(valor) {
        valor = valor.replace(/\D/g, '').slice(0, 11);
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return valor;
    }

    function formatarCNPJ(valor) {
        valor = valor.replace(/\D/g, '').slice(0, 14);
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
        return valor;
    }

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

    function limparMascara(valor) {
        return valor.replace(/\D/g, '');
    }

    function aplicarMascara(chave) {
        if (!chave || !chave.chavePix) return chave;
        let chaveFormatada = chave.chavePix;
        const tipo = Number(chave.tipoPix);
        if (tipo === 1) {
            chaveFormatada = formatarTelefone(chave.chavePix);
        } else if (tipo === 3) {
            chaveFormatada = formatarCPF(chave.chavePix);
        } else if (tipo === 4) {
            chaveFormatada = formatarCNPJ(chave.chavePix);
        }
        return { ...chave, chavePix: chaveFormatada };
    }

    const [listaTipos, setListaTipos] = useState([]);
    const [chave, setChave] = useState(
        props.chave && Object.keys(props.chave).length > 0
            ? aplicarMascara(props.chave)
            : {
                idUsuario: 0,
                login: '',
                senha: '',
                chavePix: '',
                nomePix: '',
                cidade: '',
                tipoPix: 0
            }
    );
    const [erroValidacao, setErroValidacao] = useState('');

    function getNomeTipoPorId(idTipo) {
        const tipo = listaTipos.find(t => Number(t.idTipo) === Number(idTipo));
        return tipo ? tipo.nomeTipo.toLowerCase() : null;
    }

    function handleChavePixChange(e) {
        let valor = e.target.value;
        const nomeTipo = getNomeTipoPorId(chave.tipoPix);
        let valorLimpo = valor.replace(/\D/g, '');
        if (nomeTipo === 'cpf') {
            valor = formatarCPF(valorLimpo);
        } else if (nomeTipo === 'cnpj') {
            valor = formatarCNPJ(valorLimpo);
        } else if (nomeTipo === 'telefone') {
            valor = formatarTelefone(valorLimpo);
        }
        setChave(prev => ({ ...prev, chavePix: valor }));
        setErroValidacao('');
    }

    function handleTipoPixChange(e) {
        const tipo = Number(e.target.value);
        setChave(prev => ({ ...prev, tipoPix: tipo, chavePix: '' }));
        setErroValidacao('');
    }

    function numerosIguais(valor) {
        return /^(\d)\1+$/.test(valor);
    }

    function validarChavePix() {
        const { tipoPix, chavePix } = chave;
        const valorLimpo = limparMascara(chavePix);
        const nomeTipo = getNomeTipoPorId(tipoPix);
        if (!chavePix) {
            setErroValidacao('Chave PIX é obrigatória');
            return false;
        }
        if (['telefone', 'cpf', 'cnpj'].includes(nomeTipo) && numerosIguais(valorLimpo)) {
            setErroValidacao('Insira um número válido, não repetido.');
            return false;
        }
        if (nomeTipo === 'telefone' && !/^\d{10,11}$/.test(valorLimpo)) {
            setErroValidacao('Telefone deve conter 10 ou 11 números');
            return false;
        }
        if (nomeTipo === 'e-mail' && !/^\S+@\S+\.\S+$/.test(chavePix)) {
            setErroValidacao('Formato de e-mail inválido');
            return false;
        }
        if (nomeTipo === 'cpf' && !/^\d{11}$/.test(valorLimpo)) {
            setErroValidacao('CPF deve conter 11 números');
            return false;
        }
        if (nomeTipo === 'cnpj' && !/^\d{14}$/.test(valorLimpo)) {
            setErroValidacao('CNPJ deve conter 14 números');
            return false;
        }
        setErroValidacao('');
        return true;
    }

    function tipoPixLength(tipoPix) {
        const nomeTipo = getNomeTipoPorId(tipoPix);
        switch (nomeTipo) {
            case 'telefone':
                return 15;
            case 'e-mail':
                return 50;
            case 'cpf':
                return 14;
            case 'cnpj':
                return 18;
            default:
                return 100;
        }
    }

    function gravarChave() {
        if (!validarChavePix()) return;
        let chaveLimpa = chave.chavePix;
        const nomeTipo = getNomeTipoPorId(chave.tipoPix);
        if (nomeTipo === 'telefone') {
            chaveLimpa = '+55' + limparMascara(chave.chavePix);
        } else if (nomeTipo === 'cpf' || nomeTipo === 'cnpj') {
            chaveLimpa = limparMascara(chave.chavePix);
        }
        httpClient.post('/usuarios/gravarChave', {
            idUsuario: chave.idUsuario,
            chavePix: chaveLimpa,
            nomePix: chave.nomePix,
            cidade: chave.cidade,
            tipoPix: chave.tipoPix
        })
            .then(r => {
                if (r.status === 200) {
                    alert('Chave PIX gravada com sucesso.');
                } else {
                    alert('Erro ao gravar chave PIX.');
                }
                return r.json();
            });
    }

    function alterarChave() {
        if (!validarChavePix()) return;
        let chaveLimpa = chave.chavePix;
        const nomeTipo = getNomeTipoPorId(chave.tipoPix);
        if (nomeTipo === 'telefone') {
            chaveLimpa = '+55' + limparMascara(chave.chavePix);
        } else if (nomeTipo === 'cpf' || nomeTipo === 'cnpj') {
            chaveLimpa = limparMascara(chave.chavePix);
        }
        httpClient.post('/usuarios/gravarChave', {
            idUsuario: chave.idUsuario,
            chavePix: chaveLimpa,
            nomePix: chave.nomePix,
            cidade: chave.cidade,
            tipoPix: chave.tipoPix
        })
            .then(r => {
                if (r.status === 200) {
                    alert('Chave PIX alterada com sucesso.');
                    window.location = '/admin/chave';
                } else {
                    alert('Erro ao alterar chave PIX.');
                }
                return r.json();
            });
    }

    function listarTipos() {
        httpClient.get('/tiposPix/listar')
            .then(r => {
                if (r.status === 200) {
                    return r.json();
                } else {
                    alert('Erro ao listar tipos.');
                    return null;
                }
            })
            .then(data => {
                if (data) setListaTipos(data);
            });
    }

    useEffect(() => {
        listarTipos();
    }, []);

    return (
        <div>
            <h1>{props.chave && Object.keys(props.chave).length > 0 ? 'Alterar chave PIX' : 'Cadastrar Chave PIX'}</h1>
            <div>
                <Link href='/admin/chave'>
                    <button className="btn btn-secondary">Voltar</button>
                </Link>
            </div>
            <div>
                <div className="form-group">
                    <label>Tipo do PIX</label>
                    <select
                        className="form-control"
                        value={chave.tipoPix}
                        onChange={handleTipoPixChange}
                    >
                        <option value={0}>Selecione o Tipo</option>
                        {listaTipos.map((value, index) => (
                            <option key={index} value={Number(value.idTipo)}>{value.nomeTipo}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Chave PIX</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Chave PIX"
                        value={chave.chavePix}
                        onChange={handleChavePixChange}
                        maxLength={tipoPixLength(chave.tipoPix)}
                    />
                    {erroValidacao && <p style={{ color: 'red' }}>{erroValidacao}</p>}
                    <p>Digite a sua chave PIX (e-mail, telefone, cpf, etc)</p>
                </div>
                <div className="form-group">
                    <label>Nome PIX</label>
                    <input
                        type="text"
                        maxLength={25}
                        className="form-control"
                        placeholder="Nome PIX"
                        value={chave.nomePix}
                        onChange={e => setChave(prev => ({ ...prev, nomePix: e.target.value }))}
                    />
                    <p>Digite o seu nome PIX (o nome não pode exceder 25 caracteres)</p>
                </div>
                <div className="form-group">
                    <label>Cidade</label>
                    <input
                        type="text"
                        maxLength={25}
                        className="form-control"
                        placeholder="Cidade do PIX"
                        value={chave.cidade}
                        onChange={e => setChave(prev => ({ ...prev, cidade: e.target.value }))}
                    />
                    <p>Digite a cidade do PIX (o nome da cidade não pode exceder 25 caracteres)</p>
                </div>
                <div className="form-group">
                    <Link href='/admin/chave'>
                        <button className="btn btn-danger">Cancelar</button>
                    </Link>
                    <button
                        onClick={props.chave && Object.keys(props.chave).length > 0 ? alterarChave : gravarChave}
                        style={{ marginLeft: 10 }}
                        className="btn btn-primary"
                    >
                        Cadastrar
                    </button>
                </div>
            </div>
        </div>
    );
}

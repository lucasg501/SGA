'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import httpClient from "../utils/httpClient";

export default function chaveComponent(props) {

    // Funções de formatação (CPF, CNPJ, Telefone)
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

    // Função para aplicar máscara na chavePix inicial, conforme tipoPix
    function aplicarMascara(chave) {
        if (!chave || !chave.chavePix) return chave;

        let chaveFormatada = chave.chavePix;
        const tipo = Number(chave.tipoPix);

        if (tipo === 1) { // Telefone
            chaveFormatada = formatarTelefone(chave.chavePix);
        } else if (tipo === 3) { // CPF
            chaveFormatada = formatarCPF(chave.chavePix);
        } else if (tipo === 4) { // CNPJ
            chaveFormatada = formatarCNPJ(chave.chavePix);
        }
        // para e-mail e outros tipos mantém o valor original

        return { ...chave, chavePix: chaveFormatada };
    }

    // Inicializa o estado com dados formatados se props.chave existir
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

    const [listaTipos, setListaTipos] = useState([]);
    const [erroValidacao, setErroValidacao] = useState('');

    function handleChavePixChange(e) {
        let valor = e.target.value;
        const tipo = Number(chave.tipoPix);

        let valorLimpo = valor.replace(/\D/g, '');

        if (tipo === 3) { // CPF
            valor = formatarCPF(valorLimpo);
        } else if (tipo === 4) { // CNPJ
            valor = formatarCNPJ(valorLimpo);
        } else if (tipo === 1) { // Telefone
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

    function validarChavePix() {
        const { tipoPix, chavePix } = chave;
        const valorLimpo = limparMascara(chavePix);

        if (!chavePix) {
            setErroValidacao('Chave PIX é obrigatória');
            return false;
        }

        switch (tipoPix) {
            case 1: // Telefone
                if (!/^\d{10,11}$/.test(valorLimpo)) {
                    setErroValidacao('Telefone deve conter 10 ou 11 números');
                    return false;
                }
                break;
            case 2: // E-mail
                if (!/^\S+@\S+\.\S+$/.test(chavePix)) {
                    setErroValidacao('Formato de e-mail inválido');
                    return false;
                }
                break;
            case 3: // CPF
                if (!/^\d{11}$/.test(valorLimpo)) {
                    setErroValidacao('CPF deve conter 11 números');
                    return false;
                }
                break;
            case 4: // CNPJ
                if (!/^\d{14}$/.test(valorLimpo)) {
                    setErroValidacao('CNPJ deve conter 14 números');
                    return false;
                }
                break;
            default:
                break;
        }

        setErroValidacao('');
        return true;
    }

    function tipoPixLength(tipoPix) {
        switch (tipoPix) {
            case 1: // Telefone
                return 15; // (00) 00000-0000
            case 2: // E-mail
                return 50;
            case 3: // CPF
                return 14; // 000.000.000-00
            case 4: // CNPJ
                return 18; // 00.000.000/0000-00
            default:
                return 100;
        }
    }

function gravarChave() {
    if (!validarChavePix()) return;

    let chaveLimpa = chave.chavePix;

    if (chave.tipoPix === 1) { // Telefone
        chaveLimpa = '+55' + limparMascara(chave.chavePix);
    } else if (chave.tipoPix === 3 || chave.tipoPix === 4) { // CPF ou CNPJ
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

    if (chave.tipoPix === 1) { // Telefone
        chaveLimpa = '+55' + limparMascara(chave.chavePix);
    } else if (chave.tipoPix === 3 || chave.tipoPix === 4) { // CPF ou CNPJ
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

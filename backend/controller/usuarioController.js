const UsuarioModel = require('../model/usuarioModel');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '1h';

class UsuarioController {

    async gravarChave(req, res) {
        try {
            if (Object.keys(req.body).length > 0) {
                let usuario = new UsuarioModel();
                usuario.idUsuario = 1;
                usuario.chavePix = req.body.chavePix;
                usuario.nomePix = req.body.nomePix;
                usuario.cidade = req.body.cidade;
                usuario.tipoPix = req.body.tipoPix;

                let ok = await usuario.gravarChave(usuario.chavePix, usuario.nomePix, usuario.cidade, usuario.tipoPix);
                if (ok) {
                    res.status(200).json({ message: "Chave Pix gravada com sucesso." });
                } else {
                    res.status(500).json({ message: "Erro ao gravar chave Pix." });
                }
            } else {
                res.status(400).json({ message: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro ao gravar chave Pix:", e);
            res.status(500).json({ message: "Erro ao gravar chave Pix." });
        }
    }

    async listarChave(req, res) {
        try {
            let usuarios = new UsuarioModel();
            let lista = await usuarios.listarChave();
            if (lista) {
                res.status(200).json(lista);
            } else {
                res.status(500).json({ message: "Erro ao listar chave Pix." });
            }
        } catch (e) {
            console.error("Erro ao listar chave Pix:", e);
            res.status(500).json({ message: "Erro ao listar chave Pix." });
        }
    }

    async autenticar(req, res) {
        try {
            if (req.body.login !== undefined && req.body.senha !== undefined) {
                let usuarioModel = new UsuarioModel();
                let autenticado = await usuarioModel.autenticar(req.body.login, req.body.senha);

                if (autenticado != null) {
                    const payload = {
                        id: autenticado.id,
                        login: autenticado.login,
                    };

                    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });

                    res.cookie('cookieAuth', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 3600000,
                        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
                    });

                    const usuarioResponse = { ...autenticado };
                    delete usuarioResponse.senha;

                    res.status(200).json({ msg: 'Usuário autenticado', usuario: usuarioResponse });
                } else {
                    res.status(401).json({ msg: 'Usuário ou senha inválidos' });
                }
            } else {
                res.status(400).json({ msg: 'Parâmetros inválidos' });
            }
        } catch (e) {
            console.error("Erro na autenticação:", e);
            res.status(500).json({ msg: "Erro na autenticação do usuário." });
        }
    }

    async obter(req, res) {
        try {
            if (req.params.idUsuario > 0) {
                let usuario = new UsuarioModel();
                usuario = await usuario.obter(req.params.idUsuario);
                if (usuario != null) {
                    res.status(200).json(usuario);
                } else {
                    res.status(404).json({ message: "Usuário não encontrado." });
                }
            } else {
                res.status(400).json({ message: "Parâmetros inválidos." });
            }
        } catch (e) {
            console.error("Erro ao obter usuário:", e);
            res.status(500).json({ message: "Erro ao obter usuário." });
        }
    }
}

module.exports = UsuarioController;

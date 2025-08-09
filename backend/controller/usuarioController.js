console.log('JWT_SECRET no controller:', process.env.JWT_SECRET);
const UsuarioModel = require('../model/usuarioModel');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '1h'; // mantem o tempo que desejar


class UsuarioController {

    async gravarChave(req, res) {
        if (Object.keys(req.body).length > 0) {
            let usuario = new UsuarioModel();

            usuario.idUsuario = 1;
            usuario.chavePix = req.body.chavePix;
            usuario.nomePix = req.body.nomePix;
            usuario.cidade = req.body.cidade;
            let ok = await usuario.gravarChave(usuario.chavePix, usuario.nomePix, usuario.cidade);
            if (ok)
                res.status(200).json({ message: "Chave Pix gravada com sucesso." });
            else
                res.status(500).json({ message: "Erro ao gravar chave Pix." });
        } else {
            res.status(400).json({ message: "Parâmetros inválidos." });
        }
    }

    async listarChave(req, res) {
        let usuarios = new UsuarioModel();
        let lista = await usuarios.listarChave();
        if (lista) {
            res.status(200).json(lista);
        } else {
            res.status(500).json({ message: "Erro ao listar chave Pix." });
        }
    }

    async autenticar(req, res) {
        if (req.body.login !== undefined && req.body.senha !== undefined) {
            let usuarioModel = new UsuarioModel();
            let autenticado = await usuarioModel.autenticar(req.body.login, req.body.senha);

            if (autenticado != null) {
                // Cria payload do token — coloque só dados que não sejam sensíveis
                const payload = {
                    id: autenticado.id,  // ou o campo que identifica o usuário
                    login: autenticado.login,
                };

                // Gera o token JWT
                const token = jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });

                // Define o cookie com o token
                res.cookie('cookieAuth', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production', // true só em produção (HTTPS)
                    maxAge: 3600000,
                    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' // lax para localhost
                });



                // Retorna dados do usuário (sem a senha)
                const usuarioResponse = { ...autenticado };
                delete usuarioResponse.senha;

                res.status(200).json({ msg: 'Usuário autenticado', usuario: usuarioResponse });
            } else {
                res.status(401).json({ msg: 'Usuário ou senha inválidos' });
            }
        } else {
            res.status(400).json({ msg: 'Parâmetros inválidos' });
        }
    }




    async obter(req, res) {
        if (req.params.idUsuario > 0) {
            let usuario = new UsuarioModel();
            usuario = await usuario.obter(req.params.idUsuario);
            if (usuario != null) {
                res.status(200).json(usuario);
            } else {
                res.status(500).json({ message: "Erro ao obter usuario." });
            }
        } else {
            res.status(400).json({ message: "Parâmetros inválidos." });
        }
    }

}

module.exports = UsuarioController;
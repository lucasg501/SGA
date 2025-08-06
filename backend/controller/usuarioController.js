const UsuarioModel = require('../model/usuarioModel');

class UsuarioController{

    async gravarChave(req,res){
        if(Object.keys(req.body).length > 0){
            let usuario = new UsuarioModel();

            usuario.idUsuario = 1;
            usuario.chavePix = req.body.chavePix;
            usuario.nomePix = req.body.nomePix;
            usuario.cidade = req.body.cidade;
            let ok = await usuario.gravarChave(usuario.chavePix, usuario.nomePix, usuario.cidade);
            if(ok)
                res.status(200).json({message:"Chave Pix gravada com sucesso."});
            else
                res.status(500).json({message:"Erro ao gravar chave Pix."});
        }else{
            res.status(400).json({message:"Parâmetros inválidos."});
        }
    }

    async listarChave(req,res){
        let usuarios = new UsuarioModel();
        let lista = await usuarios.listarChave();
        if(lista){
            res.status(200).json(lista);
        }else{
            res.status(500).json({message:"Erro ao listar chave Pix."});
        }
    }

    async autenticar(req,res){
        let usuario = new UsuarioModel();
        let login = req.params.login;
        let senha = req.params.senha;
        let autenticado = await usuario.autenticar(login,senha);
        if(autenticado != null){
            res.status(200).json(autenticado);
        }else{
            res.status(500).json({msg: "Erro ao autenticar usuario!"});
        }
    }

    async obter(req,res){
        if(req.params.idUsuario > 0){
            let usuario = new UsuarioModel();
            usuario = await usuario.obter(req.params.idUsuario);
            if(usuario != null){
                res.status(200).json(usuario);
            }else{
                res.status(500).json({message:"Erro ao obter usuario."});
            }
        }else{
            res.status(400).json({message:"Parâmetros inválidos."});
        }
    }

}

module.exports = UsuarioController;
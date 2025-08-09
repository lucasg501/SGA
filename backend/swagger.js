require('dotenv').config();

const swaggerAutogen = require('swagger-autogen')({openapi: "3.0.0"});
const UsuarioModel = require('./model/usuarioModel');
const ContratoModel = require('./model/contratoModel');
const AluguelModel = require('./model/aluguelModel');
const ImovelModel = require('./model/imovelModel');
const LocadorModel = require('./model/locadorModel');
const LocatarioModel = require('./model/locatarioModel');

const doc = {
    info:{

    },
    host: 'localhost:4000',
    securityDefinitions:{
        apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'apiKey',
            description: 'chave para autenticacao da api'
        }
    },
    components:{
        schemas:{
            usuario: new UsuarioModel(1,'alfredo', '123', 'pix@gmail.com', 'fetucicio', 'rio de janeiro').toJSON(),
            contrato: new ContratoModel(0,1,1,1,12,1000).toJSON(),
            aluguel: new AluguelModel(0,1000,'N',1, 1).toJSON(),
            imovel: new ImovelModel(0,'AP1010',1000,1,1).toJSON(),
            locador: new LocadorModel(1,'111.111.111-11', 'Alfredo').toJSON(),
            locatario: new LocatarioModel(1,'111.111.111-11', 'Rodolfinho').toJSON()
        }
    }
}

let outputJson = "./outputSwagger.json";
let endpoins = ["./server.js"];

swaggerAutogen(outputJson, endpoins, doc)
.then(r=>{
    require('./server.js');
});
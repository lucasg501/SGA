require('dotenv').config();

const express = require('express');
const swaggerJson = require('./outputSwagger.json');
const swaggerUi = require('swagger-ui-express');
const usuarioRoute = require('./route/usuarioRoute');
const contratoRoute = require('./route/contratoRoute');
const aluguelRoute = require('./route/aluguelRoute');
const imovelRoute = require('./route/imovelRoute');
const locadorRoute = require('./route/locadorRoute');
const locatarioRoute = require('./route/locatarioRoute');

const cors = require('cors');

const app = express();
const porta = 4000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerJson));
app.use(express.json());
app.use(cors({origin: 'http://localhost:3000', credentials:true}));
app.use('/usuarios', usuarioRoute);
app.use('/contratos', contratoRoute);
app.use('/aluguel', aluguelRoute);
app.use('/imovel', imovelRoute);
app.use('/locador', locadorRoute);
app.use('/locatario', locatarioRoute);

app.listen(porta, () =>{
    console.log(`Servidor rodando na porta ${porta}`);
    console.log(`Consultar documentação em http://localhost:${porta}/docs\n`);
});
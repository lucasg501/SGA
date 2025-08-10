# 🚀 SGA - Sistema de Gerenciamento de Aluguéis

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) 
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white) 
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

---

## 📋 Sobre o Projeto

SGA (**Sistema de Gerenciamento de Aluguéis**) é uma aplicação desenvolvida com **Node.js, Next.js, React.js e MySQL**, pensada para integração em sistemas CRM já existentes para imobiliárias.

O objetivo principal é facilitar a geração de **códigos PIX** para pagamento das mensalidades dos aluguéis, simplificando o controle financeiro para clientes e administradores.

---

## 🏗 Arquitetura do Projeto

- 🖥 **Backend**: API construída em Node.js, responsável pela lógica do sistema e autenticação via JWT.
- 🌐 **Frontend**: Aplicação React/Next.js para interação administrativa e do cliente final.
- 💾 **Banco de Dados**: Scripts para criação e replicação do banco MySQL.

---

## ⚙️ Funcionalidades Principais

1. Criação e gestão de **chaves PIX** para locatários.
2. Cadastro e controle de **contratos** de aluguel.
3. Geração automática dos **aluguéis mensais** vinculados a contratos.
4. Autenticação segura via **JWT**.
5. Interface administrativa para gerenciamento (URL: `localhost:3000/admin`).
6. Interface cliente para consulta e pagamento via CPF (URL: `localhost:3000`).

---

## 🚀 Como Rodar o Projeto

1. Configure o banco MySQL com os scripts disponíveis na pasta `database`.
2. No terminal, acesse as pastas do **backend** e do **frontend** e rode o comando para instalar dependências:

   ```bash
   npm install
3. Inicie o backend e o frontend normalmente.

4. A documentação da API está disponível via Swagger na URL:
   http://localhost:4000/docs
🔑 Considerações Importantes
O acesso ao frontend depende dos dados já existentes no banco, pois o projeto foi pensado para ser integrado a um CRM imobiliário.

Para utilizar o sistema:

Crie uma chave PIX;

Cadastre um contrato;

Gere os aluguéis vinculados;

Alguns dados como locador, imóvel e locatário devem ser inseridos diretamente no banco para funcionar corretamente.

🧑‍💻 URLs de Acesso
Interface	URL	Descrição
Administração	http://localhost:3000/admin	Para gerenciar contratos e aluguéis
Cliente final	http://localhost:3000	Consulta via CPF cadastrado
Documentação da API	http://localhost:4000/docs	Testes e documentação Swagger

📚 Tecnologias Utilizadas
Node.js — Backend

Next.js & React.js — Frontend

MySQL — Banco de dados

JWT — Autenticação e segurança

Swagger — Documentação da API


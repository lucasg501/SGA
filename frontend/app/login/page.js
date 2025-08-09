'use client';

import { useContext, useRef } from "react";
import httpClient from "../utils/httpClient";

export default function Login() {
  const login = useRef('');
  const senha = useRef('');


  function autenticar() {
    let status = 0;
    if (login.current.value != '' && senha.current.value != '') {
      httpClient.post('/usuarios/autenticar', {
        login: login.current.value,
        senha: senha.current.value
      }).then(r => {
        status = r.status;
        return r.json();
      })
      .then(r=>{
        if(status == 200){
          alert('Usuario autenticado');
          window.location.href = '/admin';
        }else{
          alert('Usuário ou senha inválidos');
        }
      })
    }else{
      alert('Verifique se os campos estão preenchidos!');
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        padding: '20px'
      }}
    >
      <div
        className="card shadow"
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '30px',
          borderRadius: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <div className="text-center mb-4">
          <h3 className="fw-bold" style={{ color: '#333' }}>Bem-vindo de volta!</h3>
          <p className="text-muted">Faça login para continuar</p>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">Usuário</label>
            <input
              ref={login}
              type="text"
              className="form-control"
              id="email"
              placeholder="Digite seu usuário"
              autoComplete="username"
              style={{ fontSize: '1rem' }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="senha" className="form-label fw-semibold">Senha</label>
            <input
              ref={senha}
              type="password"
              className="form-control"
              id="senha"
              placeholder="Digite sua senha"
              autoComplete="current-password"
              style={{ fontSize: '1rem' }}
            />
          </div>
          <button
            onClick={autenticar}
            type="button"
            className="btn btn-primary w-100 fw-bold"
            style={{ fontSize: '1.1rem', padding: '10px' }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';
import { Nunito } from 'next/font/google';
import Link from 'next/link';
import '../../public/template/css/styles.css';
import '../../public/template/css/fontawesome-free/css/all.min.css';
import '../../public/template/css/sb-admin-2.min.css';

const nunito = Nunito({ subsets: ['latin'] });

export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body className={nunito.className}>
                <LayoutContent>{children}</LayoutContent>
            </body>
        </html>
    );
}

function LayoutContent({ children }) {
    return (
        <div id="wrapper">
            {/* Sidebar */}
            <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
                <a className="sidebar-brand d-flex align-items-center justify-content-center" href="/admin">
                    <div className="sidebar-brand-icon rotate-n-15">
                        <i className="fas fa-solid fa-trowel-bricks"></i>
                    </div>
                    <div className="sidebar-brand-text mx-3">
                        <sup>Painel Administrativo</sup>
                    </div>
                </a>

                <hr className="sidebar-divider my-0" />

                <li className="nav-item">
                    <Link className="nav-link" href="/admin">
                        <i className="fas fa-home"></i>
                        <span>Início</span>
                    </Link>
                </li>

                <hr className="sidebar-divider" />
                <div className="sidebar-heading">Menu</div>

                <li className="nav-item">
                    <Link className="nav-link" href="/admin/chave">
                        <i className="fas fa-qrcode me-2"></i>
                        <span>Chave PIX</span>
                    </Link>
                </li>

                <li className="nav-item">
                    <Link className="nav-link" href="/admin/contratos">
                        <i className="fas fa fa-file-word"></i>
                        <span>Contratos</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/admin/alugueis">
                        <i className="fas fa-solid fa-cash-register"></i>
                        <span>Aluguéis</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/admin/pagamentoAvulso">
                        <i className="fas fa-solid fa-money-bill"></i>
                        <span>Pagamento Avulso</span>
                    </Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" href="/admin/locatario">
                        <i className="fas fa-solid fa-users"></i>
                        <span>Locatários</span>
                    </Link>
                </li>
            </ul>

            {/* Topbar + Conteúdo */}
            <div id="content-wrapper" className="d-flex flex-column">
                <div id="content">
                    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                        <span className="navbar-brand mb-0 h1">Sistema de Gerenciamento de Aluguéis</span>
                    </nav>
                    <div className="container-fluid">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

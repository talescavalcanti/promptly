
import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.brand}>
                        <h3>Promptly</h3>
                        <p>Empoderando desenvolvedores com <br /> prompts de IA prontos para produção.</p>
                    </div>
                    <div className={styles.column}>
                        <h4>Produto</h4>
                        <ul>
                            <li><Link href="#features">Funcionalidades</Link></li>
                            <li><Link href="#pricing">Planos</Link></li>
                            <li><Link href="#api">API</Link></li>
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h4>Recursos</h4>
                        <ul>
                            <li><Link href="/docs">Documentação</Link></li>
                            <li><Link href="/guides">Guias</Link></li>
                            <li><Link href="/blog">Blog</Link></li>
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h4>Empresa</h4>
                        <ul>
                            <li><Link href="/about">Sobre</Link></li>
                            <li><Link href="/careers">Carreiras</Link></li>
                            <li><Link href="/legal">Legal</Link></li>
                        </ul>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} Promptly. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

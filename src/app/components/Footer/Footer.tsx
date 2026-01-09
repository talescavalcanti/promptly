
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
                        <p>Transforme suas ideias em prompts técnicos profissionais para IA.</p>
                    </div>
                    <div className={styles.column}>
                        <h4>Navegação</h4>
                        <ul>
                            <li><Link href="/">Início</Link></li>
                            <li><Link href="/dashboard">Dashboard</Link></li>
                            <li><Link href="/pricing">Planos</Link></li>
                        </ul>
                    </div>
                    <div className={styles.column}>
                        <h4>Contato</h4>
                        <ul>
                            <li><a href="mailto:iapromptly@gmail.com">iapromptly@gmail.com</a></li>
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

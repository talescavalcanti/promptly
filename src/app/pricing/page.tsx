'use client';

import React from 'react';
import Link from 'next/link';
import { Footer } from '../components/Footer/Footer';
import { Button } from '../components/Button/Button';
import { Check } from 'lucide-react';
import styles from './page.module.css';
import { useScrollReveal } from '../../lib/hooks/useScrollReveal';

export default function PricingPage() {
    useScrollReveal();
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await import('../../lib/supabase').then(m => m.supabase.auth.getSession());
            setUser(session?.user);
        };
        checkUser();
    }, []);

    return (
        <div className={styles.wrapper}>
            <main className={styles.main}>
                {/* Hero section */}
                <section className={`${styles.hero} animate-fade-blur`}>
                    <h1 className={styles.heroTitle}>
                        Escolha o plano ideal para criar seus sites com prompts profissionais.
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Transforme suas ideias em especificações técnicas de alta fidelidade.
                        Comece hoje mesmo sem custos e evolua seu plano conforme sua necessidade cresce.
                    </p>
                    {!user && (
                        <Link href="/signup">
                            <Button variant="primary" className={styles.heroButton}>
                                Começar grátis agora
                            </Button>
                        </Link>
                    )}
                </section>

                {/* Pricing Table */}
                <section className={`${styles.pricingSection} reveal`} style={{ transitionDelay: '200ms' }}>
                    <div className={styles.pricingGrid}>
                        {/* Free Plan */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.planName}>Free</h2>
                                <div className={styles.price}>
                                    <span className={styles.currency}>R$</span>
                                    <span className={styles.amount}>0,00</span>
                                    <span className={styles.period}>/mês</span>
                                </div>
                                <p className={styles.cardDescription}>Ideal para testar o poder da nossa engine.</p>
                            </div>

                            <ul className={styles.features}>
                                <li><Check size={16} /> <strong>5 prompts</strong> por mês</li>
                                <li><Check size={16} /> Assistente guiado inteligente</li>
                                <li><Check size={16} /> Especificações técnicas básicas</li>
                                <li><Check size={16} /> Atualizações de sistema inclusas</li>
                            </ul>

                            <div className={styles.cardFooter}>
                                <p className={styles.note}>Ativado automaticamente ao criar sua conta. No credit card required.</p>
                                {user ? (
                                    <Button variant="outline" fullWidth disabled>Plano Atual</Button>
                                ) : (
                                    <Link href="/signup">
                                        <Button variant="outline" fullWidth>Criar conta e usar Free</Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Starter Plan */}
                        <div className={`${styles.card} ${styles.popular}`}>
                            <div className={styles.popularBadge}>Mais Popular</div>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.planName}>Starter</h2>
                                <div className={styles.price}>
                                    <span className={styles.currency}>R$</span>
                                    <span className={styles.amount}>9,90</span>
                                    <span className={styles.period}>/mês</span>
                                </div>
                                <p className={styles.cardDescription}>O equilíbrio perfeito para desenvolvedores independentes.</p>
                            </div>

                            <ul className={styles.features}>
                                <li><Check size={16} /> <strong>100 prompts</strong> por mês</li>
                                <li><Check size={16} /> Acesso total ao assistente guiado</li>
                                <li><Check size={16} /> Arquiteturas de sistema detalhadas</li>
                                <li><Check size={16} /> Suporte prioritário via ticket</li>
                            </ul>

                            <div className={styles.cardFooter}>
                                <p className={styles.note}>Cancele quando quiser.</p>
                                <Link href={user ? "#upgrade-starter" : "/signup"}>
                                    <Button variant="primary" fullWidth>
                                        {user ? "Fazer Upgrade para Starter" : "Assinar Starter"}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h2 className={styles.planName}>Pro</h2>
                                <div className={styles.price}>
                                    <span className={styles.currency}>R$</span>
                                    <span className={styles.amount}>27,90</span>
                                    <span className={styles.period}>/mês</span>
                                </div>
                                <p className={styles.cardDescription}>Potência máxima para agências e profissionais de elite.</p>
                            </div>

                            <ul className={styles.features}>
                                <li><Check size={16} /> <strong>400 prompts</strong> por mês</li>
                                <li><Check size={16} /> Maior limite de gerações do mercado</li>
                                <li><Check size={16} /> Suporte prioritário via Direct</li>
                                <li><Check size={16} /> Exportação avançada de requisitos</li>
                            </ul>

                            <div className={styles.cardFooter}>
                                <p className={styles.note}>Faturamento mensal sem fidelidade.</p>
                                <Link href={user ? "#upgrade-pro" : "/signup"}>
                                    <Button variant="outline" fullWidth>
                                        {user ? "Fazer Upgrade para Pro" : "Assinar Pro"}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Additional Info */}
                <section className={`${styles.infoSection} reveal`}>
                    <h3 className={styles.infoTitle}>Flexibilidade total para sua jornada</h3>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoBlock}>
                            <h4>Comece Grátis</h4>
                            <p>Basta criar sua conta para ganhar 5 prompts todos os meses. Sem pegadinhas, sem cartão.</p>
                        </div>
                        <div className={styles.infoBlock}>
                            <h4>Evolução Simples</h4>
                            <p>Precisa de mais? Faça o upgrade para os planos Starter ou Pro a qualquer momento e o novo limite é liberado instantaneamente.</p>
                        </div>
                        <div className={styles.infoBlock}>
                            <h4>Pagamento Transparente</h4>
                            <p>A cobrança é feita mensalmente via cartão de crédito ou PIX. O cancelamento é simples e pode ser feito direto no seu painel.</p>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className={`${styles.faqSection} reveal`}>
                    <h3 className={styles.faqHeader}>Perguntas Frequentes</h3>
                    <div className={styles.faqGrid}>
                        <div className={styles.faqItem}>
                            <h5>O que acontece quando eu atingir o limite de prompts?</h5>
                            <p>No plano Free, o limite reinicia no próximo mês. Nos planos pagos, você pode optar por fazer um upgrade para um plano maior ou aguardar o próximo ciclo de cobrança.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h5>Posso mudar de plano depois?</h5>
                            <p>Com certeza! Você pode subir ou descer de plano (upgrade ou downgrade) a qualquer momento diretamente nas configurações da sua conta.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h5>Preciso cadastrar um cartão para usar o plano Free?</h5>
                            <p>Não. O plano Free é 100% gratuito e não exige nenhuma informação bancária. Queremos que você sinta o poder da ferramenta antes de decidir investir.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <h5>Como funciona o cancelamento dos planos pagos?</h5>
                            <p>Sem letras miúdas. Se decidir cancelar, você continuará com acesso aos benefícios do seu plano atual até o final do período já pago.</p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

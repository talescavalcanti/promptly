
import styles from '../../checkout/checkout.module.css';
import { Check } from 'lucide-react';

interface PlanSelectorProps {
    selectedPlan: 'STARTER' | 'PRO';
    onSelect: (plan: 'STARTER' | 'PRO') => void;
}

export function PlanSelector({ selectedPlan, onSelect }: PlanSelectorProps) {
    return (
        <div className={styles.planSelector}>
            <div
                className={`${styles.planCard} ${selectedPlan === 'STARTER' ? styles.active : ''}`}
                onClick={() => onSelect('STARTER')}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className={styles.planName}>STARTER</span>
                    {selectedPlan === 'STARTER' && <Check size={20} color="#0070f3" />}
                </div>
                <span className={styles.planPrice}>R$ 9,90<small>/mês</small></span>
                <p className={styles.label}>Para iniciantes</p>
            </div>

            <div
                className={`${styles.planCard} ${selectedPlan === 'PRO' ? styles.active : ''}`}
                onClick={() => onSelect('PRO')}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className={styles.planName}>PRO</span>
                    {selectedPlan === 'PRO' && <Check size={20} color="#0070f3" />}
                </div>
                <span className={styles.planPrice}>R$ 27,90<small>/mês</small></span>
                <p className={styles.label}>Acesso completo</p>
            </div>
        </div>
    );
}

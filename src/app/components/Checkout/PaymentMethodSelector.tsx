
import styles from '../../checkout/checkout.module.css';
import { CreditCard, QrCode } from 'lucide-react';

interface PaymentMethodSelectorProps {
    method: 'CREDIT_CARD' | 'PIX';
    onSelect: (method: 'CREDIT_CARD' | 'PIX') => void;
}

export function PaymentMethodSelector({ method, onSelect }: PaymentMethodSelectorProps) {
    return (
        <div className={styles.paymentTabs}>
            <button
                className={`${styles.tab} ${method === 'CREDIT_CARD' ? styles.active : ''}`}
                onClick={() => onSelect('CREDIT_CARD')}
                type="button"
            >
                <CreditCard size={20} />
                Cartão de Crédito
            </button>
            <button
                className={`${styles.tab} ${method === 'PIX' ? styles.active : ''}`}
                onClick={() => onSelect('PIX')}
                type="button"
            >
                <QrCode size={20} />
                PIX
            </button>
        </div>
    );
}

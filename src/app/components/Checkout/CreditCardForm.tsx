import styles from '../../checkout/checkout.module.css';
import { formatCardNumber, formatExpiry } from '@/lib/formatters';

interface CreditCardFormProps {
    cardDetails: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
        expiryDate?: string; // Add temporary field for UI if needed, but better to derive
    };
    onChange: (field: string, value: string) => void;
}

export function CreditCardForm({ cardDetails, onChange }: CreditCardFormProps) {
    const handleInputChange = (field: string, value: string) => {
        let formattedValue = value;

        if (field === 'number') {
            formattedValue = formatCardNumber(value);
            onChange(field, formattedValue);
        } else if (field === 'expiryDate') {
            // Handle combined MM/YY input
            formattedValue = formatExpiry(value);
            // Split into month/year for the parent state
            const parts = formattedValue.split('/');
            onChange('expiryMonth', parts[0] || '');
            onChange('expiryYear', parts[1] ? '20' + parts[1] : '');
            // We usually don't store "expiryDate" in the parent state structure shown previously, 
            // so we might need to adjust how we render the input or update the parent state structure.
            // However, the user asked for "VALIDADE" formatting. 
            // The previous form had separate inputs. Let's merge them into one for better UX/Formatting 
            // OR format them individually. Merging is usually expected with "Validade".
        } else {
            onChange(field, value);
        }
    };

    return (
        <div className={styles.formGrid}>
            <div className={styles.fullWidth}>
                <div className={styles.field}>
                    <label className={styles.label}>Número do Cartão</label>
                    <input
                        className={styles.input}
                        placeholder="0000 0000 0000 0000"
                        value={cardDetails.number}
                        onChange={(e) => handleInputChange('number', e.target.value)}
                        required
                        maxLength={19}
                    />
                </div>
            </div>

            <div className={styles.fullWidth}>
                <div className={styles.field}>
                    <label className={styles.label}>Nome Impresso no Cartão</label>
                    <input
                        className={styles.input}
                        placeholder="NOME COMO NO CARTAO"
                        value={cardDetails.holderName}
                        onChange={(e) => onChange('holderName', e.target.value.toUpperCase())}
                        required
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Validade (MM/AA)</label>
                <input
                    className={styles.input}
                    placeholder="MM/AA"
                    maxLength={5}
                    // create a composite value for display
                    value={cardDetails.expiryMonth + (cardDetails.expiryYear ? '/' + cardDetails.expiryYear.slice(2) : '')}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    required
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>CVV</label>
                <input
                    className={styles.input}
                    placeholder="123"
                    maxLength={4}
                    value={cardDetails.ccv}
                    onChange={(e) => onChange('ccv', e.target.value.replace(/\D/g, ''))}
                    required
                />
            </div>
        </div>
    );
}

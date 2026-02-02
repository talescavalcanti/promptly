'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import styles from './settings.module.css';
import { Button } from '../../components/Button/Button';
import { User } from '@supabase/supabase-js';
import { Loader2, Camera, Save, Lock, Eye, EyeOff, Check, X } from 'lucide-react';

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // User profile from database (contains plano_ativo, status, etc.)
    const [userProfile, setUserProfile] = useState<{ plano_ativo?: string; status?: string } | null>(null);

    // Cancel subscription modal
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellingSubscription, setCancellingSubscription] = useState(false);

    // Password Requirements
    const requirements = [
        { label: 'Pelo menos 8 caracteres', test: (p: string) => p.length >= 8 },
        { label: 'Uma letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
        { label: 'Uma letra minúscula', test: (p: string) => /[a-z]/.test(p) },
        { label: 'Um número', test: (p: string) => /[0-9]/.test(p) },
        { label: 'Um caractere especial', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
    ];

    const allRequirementsMet = requirements.every(req => req.test(newPassword));

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setFullName(user.user_metadata?.full_name || '');
                setEmail(user.email || '');
                setAvatarUrl(user.user_metadata?.avatar_url || '');

                // Fetch user profile from database to get plan info
                const { data: profile } = await supabase
                    .from('users')
                    .select('plano_ativo, status')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserProfile(profile);
                }
            }
            setLoading(false);
        };
        getUser();
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);

        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        });

        if (error) {
            showMessage('error', `Erro ao atualizar perfil: ${error.message}`);
        } else {
            showMessage('success', 'Perfil atualizado com sucesso!');
        }
        setSavingProfile(false);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!oldPassword) {
            showMessage('error', 'Por favor, informe sua senha antiga.');
            return;
        }

        if (!allRequirementsMet) {
            showMessage('error', 'A nova senha não atende a todos os requisitos.');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('error', 'As senhas não coincidem.');
            return;
        }

        setSavingPassword(true);

        // Reauthenticate with old password
        const { error: reauthError } = await supabase.auth.signInWithPassword({
            email: user?.email || '',
            password: oldPassword,
        });

        if (reauthError) {
            showMessage('error', 'Senha antiga incorreta.');
            setSavingPassword(false);
            return;
        }

        // Update to new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            showMessage('error', `Erro ao atualizar senha: ${updateError.message}`);
        } else {
            showMessage('success', 'Senha atualizada com sucesso!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
        setSavingPassword(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setUploadingAvatar(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);

        if (uploadError) {
            showMessage('error', `Erro no upload: ${uploadError.message}`);
            setUploadingAvatar(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        });

        if (updateError) {
            showMessage('error', `Erro ao salvar foto: ${updateError.message}`);
        } else {
            setAvatarUrl(publicUrl);
            showMessage('success', 'Foto de perfil atualizada!');
        }
        setUploadingAvatar(false);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Configurações</h1>
                <p className={styles.subtitle}>Gerencie seu perfil, segurança e preferências na plataforma.</p>
            </header>

            {message && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.contentWrapper}>
                <div>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Perfil</h2>

                        <div className={styles.avatarSection}>
                            <div className={styles.avatar}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" />
                                ) : (
                                    fullName.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <button
                                className={styles.uploadButton}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                            >
                                <Camera size={16} style={{ marginRight: '0.5rem' }} />
                                {uploadingAvatar ? 'Enviando...' : 'Alterar foto'}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarUpload}
                                style={{ display: 'none' }}
                                accept="image/*"
                            />
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nome Completo</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>E-mail</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    value={email}
                                    disabled
                                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                />
                            </div>
                            <div className={styles.actions}>
                                <Button variant="primary" type="submit" loading={savingProfile}>
                                    <Save size={16} style={{ marginRight: '0.5rem' }} />
                                    Salvar Perfil
                                </Button>
                            </div>
                        </form>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Segurança</h2>
                        <form onSubmit={handleUpdatePassword}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Senha Atual</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        className={`${styles.input} ${styles.passwordInput}`}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className={styles.showPasswordButton}
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        tabIndex={-1}
                                    >
                                        {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nova Senha</label>
                                <div className={styles.passwordWrapper}>
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        className={`${styles.input} ${styles.passwordInput}`}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className={styles.showPasswordButton}
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        tabIndex={-1}
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <ul className={styles.checklist}>
                                {requirements.map((req, i) => {
                                    const isMet = req.test(newPassword);
                                    return (
                                        <li key={i} className={`${styles.checkItem} ${isMet ? styles.met : ''}`}>
                                            <span className={styles.checkIcon}>
                                                {isMet ? <Check size={14} /> : <X size={14} />}
                                            </span>
                                            {req.label}
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    className={styles.input}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    loading={savingPassword}
                                    disabled={!allRequirementsMet || !oldPassword || !confirmPassword}
                                >
                                    <Lock size={16} style={{ marginRight: '0.5rem' }} />
                                    Atualizar Senha
                                </Button>
                            </div>
                        </form>
                    </section>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Assinatura</h2>
                        <div className={styles.formGroup}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{
                                    padding: '20px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <p style={{ color: '#86868B', fontSize: '13px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plano Atual</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{
                                                fontSize: '18px',
                                                fontWeight: 600,
                                                color: userProfile?.plano_ativo && userProfile?.plano_ativo !== 'FREE' ? '#F5F5F7' : '#86868B'
                                            }}>
                                                {userProfile?.plano_ativo === 'PRO' ? 'Promptly PRO' :
                                                    userProfile?.plano_ativo === 'STARTER' ? 'Promptly STARTER' : 'Gratuito'}
                                            </span>
                                            {userProfile?.status === 'canceled' && (
                                                <span style={{
                                                    fontSize: '11px',
                                                    background: 'rgba(244, 67, 54, 0.15)',
                                                    color: '#FF453A',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontWeight: 500
                                                }}>
                                                    Cancelado
                                                </span>
                                            )}
                                            {userProfile?.plano_ativo && userProfile?.plano_ativo !== 'FREE' && userProfile?.status !== 'canceled' && (
                                                <span style={{
                                                    fontSize: '11px',
                                                    background: 'rgba(48, 209, 88, 0.15)',
                                                    color: '#30D158',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontWeight: 500
                                                }}>
                                                    Ativo
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {userProfile?.plano_ativo && userProfile?.plano_ativo !== 'FREE' && userProfile?.status !== 'canceled' && (
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowCancelModal(true)}
                                            style={{
                                                borderColor: 'rgba(255, 69, 58, 0.3)',
                                                color: '#FF453A',
                                                background: 'rgba(255, 69, 58, 0.1)'
                                            }}
                                        >
                                            Cancelar Assinatura
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Cancel Subscription Modal */}
            {showCancelModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: '#1C1C1E',
                        borderRadius: '20px',
                        padding: '32px',
                        maxWidth: '420px',
                        width: '100%',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                background: 'rgba(255, 69, 58, 0.15)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <X size={32} color="#FF453A" />
                            </div>
                            <h3 style={{ color: '#F5F5F7', fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>
                                Cancelar Assinatura?
                            </h3>
                            <p style={{ color: '#86868B', fontSize: '15px', lineHeight: 1.5 }}>
                                Você perderá acesso aos recursos premium ao fim do período atual. Esta ação não pode ser desfeita.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button
                                variant="secondary"
                                onClick={() => setShowCancelModal(false)}
                                style={{ flex: 1 }}
                                disabled={cancellingSubscription}
                            >
                                Voltar
                            </Button>
                            <Button
                                variant="primary"
                                loading={cancellingSubscription}
                                onClick={async () => {
                                    setCancellingSubscription(true);
                                    try {
                                        const { data: { session } } = await supabase.auth.getSession();
                                        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/cancel-subscription`, {
                                            method: 'POST',
                                            headers: {
                                                'Authorization': `Bearer ${session?.access_token}`,
                                                'Content-Type': 'application/json'
                                            }
                                        });

                                        const result = await response.json();

                                        if (!response.ok) throw new Error(result.error);

                                        // Update local state immediately
                                        setUserProfile(prev => prev ? { ...prev, status: 'canceled' } : null);
                                        setShowCancelModal(false);
                                        showMessage('success', 'Assinatura cancelada com sucesso.');

                                        // Also refresh from database to be sure
                                        const { data: profile } = await supabase
                                            .from('users')
                                            .select('plano_ativo, status')
                                            .eq('id', user?.id)
                                            .single();
                                        if (profile) setUserProfile(profile);

                                    } catch (err: any) {
                                        showMessage('error', `Erro ao cancelar: ${err.message}`);
                                    } finally {
                                        setCancellingSubscription(false);
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    background: '#FF453A',
                                    borderColor: '#FF453A'
                                }}
                            >
                                {cancellingSubscription ? 'Cancelando...' : 'Confirmar Cancelamento'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

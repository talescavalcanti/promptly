import { Header } from '../components/Header/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <Header />
            <main style={{ paddingTop: '6rem' }}>
                {children}
            </main>
        </div>
    );
}

import { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#fff8f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Noto Sans, sans-serif'
        }}>
          <div style={{
            maxWidth: '560px',
            backgroundColor: '#ffffff',
            border: '1px solid #dac1b8',
            borderRadius: '6px',
            padding: '32px',
            boxShadow: '0 8px 24px rgba(44, 37, 35, 0.08)'
          }}>
            <h2 style={{ color: '#914724', fontSize: '20px', fontWeight: 600, margin: '0 0 12px 0' }}>
              อ่านแล้วใจฟู — เกิดข้อผิดพลาดในการโหลดหน้าเว็บ
            </h2>
            <p style={{ color: '#54433c', fontSize: '14px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              {this.state.error?.message || 'ไม่สามารถเรนเดอร์คอมโพเนนต์ได้ตามปกติ'}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#914724',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                โหลดหน้าเว็บใหม่อีกครั้ง (Reload)
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  } catch (e) {
                    window.location.reload();
                  }
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f5f0eb',
                  color: '#211a18',
                  border: '1px solid #dac1b8',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ล้างข้อมูลแคช (Clear Cache)
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error("Root element #root not found in document");
}


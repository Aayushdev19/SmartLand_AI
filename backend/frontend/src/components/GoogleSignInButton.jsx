import { useEffect, useRef, useState } from 'react';

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function GoogleSignInButton({ onSuccess, onError, label = 'signin_with' }) {
  const buttonRef = useRef(null);
  const [status, setStatus] = useState(clientId ? 'loading' : 'missing-config');

  useEffect(() => {
    if (!clientId) return undefined;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: response => {
            if (response?.credential) {
              onSuccess(response.credential);
            } else {
              onError('Google sign-in did not return a credential.');
            }
          },
        });

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          text: label,
          shape: 'rectangular',
          logo_alignment: 'left',
          width: buttonRef.current.offsetWidth || 340,
        });
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error');
          onError('Google sign-in could not load. Check your connection and OAuth setup.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [label, onError, onSuccess]);

  if (!clientId) {
    return (
      <button
        type="button"
        className="sl-btn-outline"
        disabled
        title="Set VITE_GOOGLE_CLIENT_ID in backend/frontend/.env"
        style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 8 }}
      >
        Configure Google OAuth
      </button>
    );
  }

  return (
    <div aria-busy={status === 'loading'} style={{ width: '100%', minHeight: 44 }}>
      <div
        ref={buttonRef}
        style={{ width: '100%', display: status === 'ready' ? 'flex' : 'none', justifyContent: 'center' }}
      />
      {status === 'loading' && (
        <button
          type="button"
          className="sl-btn-outline"
          disabled
          style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 8 }}
        >
          Loading Google...
        </button>
      )}
      {status === 'error' && (
        <button
          type="button"
          className="sl-btn-outline"
          disabled
          style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 8 }}
        >
          Google unavailable
        </button>
      )}
    </div>
  );
}

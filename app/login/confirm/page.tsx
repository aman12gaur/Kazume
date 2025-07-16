export default function ConfirmEmailPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minWidth: 340, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 24, fontWeight: 700, fontSize: 24, color: '#2563eb' }}>Confirm Your Email</h2>
        <p style={{ marginBottom: 16, color: '#374151', fontSize: 16 }}>
          You need to confirm your email address before you can log in.<br />
          Please check your inbox for a confirmation link.
        </p>
        <p style={{ color: '#6b7280', fontSize: 15 }}>If you did not receive an email, check your spam folder or try signing up again.</p>
      </div>
    </div>
  )
} 
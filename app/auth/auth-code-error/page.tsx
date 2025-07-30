export default function AuthCodeErrorPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minWidth: 340, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 24, fontWeight: 700, fontSize: 24, color: '#b91c1c' }}>Authentication Error</h2>
        <p style={{ marginBottom: 16, color: '#374151', fontSize: 16 }}>
          Something went wrong while signing in with Google.<br />
          Please try again or contact support if the problem persists.
        </p>
        <p style={{ color: '#6b7280', fontSize: 15 }}>
          Possible reasons: network issues, invalid credentials, or a problem with our authentication provider.<br />
          <a href="/" style={{ color: '#2563eb', textDecoration: 'underline' }}>Back to Login</a>
        </p>
      </div>
    </div>
  )
} 
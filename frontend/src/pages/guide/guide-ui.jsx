export function Section({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-title" style={{ marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

export function Term({ word, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontWeight: 600, color: 'var(--blue)', fontSize: 13, marginBottom: 3 }}>{word}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

export function Step({ n, title, children }) {
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
      <div style={{
        minWidth: 28, height: 28, borderRadius: '50%',
        background: 'var(--blue-dark)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700
      }}>{n}</div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{children}</div>
      </div>
    </div>
  );
}

export function Callout({ tone = 'var(--gold)', title, children }) {
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '14px 16px', borderLeft: `3px solid ${tone}`, marginTop: 8, marginBottom: 8 }}>
      {title && <div style={{ fontWeight: 600, color: tone, marginBottom: 6, fontSize: 13 }}>{title}</div>}
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}

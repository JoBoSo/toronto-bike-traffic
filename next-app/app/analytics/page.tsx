// This must be a default export for Next.js to recognize it as a page
export default function AnalyticsPage() {
  return (
    <main style={{ padding: '2rem', color: 'white' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Analytics</h1>
      <p style={{ color: '#94a3b8' }}>
        This page will soon display charts and data insights about Toronto's bike traffic and infrastructure.
      </p>
      
      {/* Placeholder for future charts */}
      <div style={{ 
        marginTop: '2rem', 
        height: '300px', 
        border: '1px dashed #30363d', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px',
        backgroundColor: '#0d1117'
      }}>
        Chart coming soon...
      </div>
    </main>
  );
}
export default function TestPage() {
  const testComponents = [
    {
      id: 'test-1',
      type: 'button',
      x: 100,
      y: 100,
      props: {
        text: 'Test Button',
        fontSize: 16,
        color: '#fff',
        bg: '#3B4EFF'
      }
    },
    {
      id: 'test-2', 
      type: 'text',
      x: 100,
      y: 200,
      props: {
        text: 'Test Text',
        fontSize: 18,
        color: '#333'
      }
    }
  ];

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: '#ffffff'
    }}>
      <h1 style={{ padding: 20 }}>Simple Test Page</h1>
      {testComponents.map(comp => (
        <div
          key={comp.id}
          style={{
            position: 'absolute',
            left: comp.x,
            top: comp.y,
            padding: '12px 16px',
            background: comp.props.bg || '#f0f0f0',
            color: comp.props.color || '#333',
            fontSize: comp.props.fontSize || 16,
            borderRadius: 4
          }}
        >
          {comp.props.text}
        </div>
      ))}
    </div>
  );
}
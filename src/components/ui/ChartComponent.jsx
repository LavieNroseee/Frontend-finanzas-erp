import { useEffect, useRef } from 'react';

const ChartComponent = ({ type, data, options, height = 250 }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    if (chartRef.current) chartRef.current.destroy();

    // Estilos de ChartJS globales para que coincidan con el tema
    window.Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    window.Chart.defaults.color = '#64748b';
    window.Chart.defaults.scale.grid.color = '#f1f5f9';

    const ctx = canvasRef.current.getContext('2d');
    try {
      chartRef.current = new window.Chart(ctx, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20,
                font: { size: 11, weight: 600 }
              }
            },
            tooltip: {
              backgroundColor: '#1e293b',
              padding: 12,
              titleFont: { size: 13 },
              bodyFont: { size: 12 },
              cornerRadius: 8,
              displayColors: true
            }
          },
          ...options
        }
      });
    } catch (e) {
      console.error('Error creating chart:', e);
    }
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [type, data, options]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ChartComponent;

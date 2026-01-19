import { useMemo } from 'react';
import { Activity, AlertCircle, Calendar, FileText, Scale, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import Card from '../components/ui/Card';
import ChartComponent from '../components/ui/ChartComponent';
import KPI from '../components/ui/KPI';
import SectionHeader from '../components/ui/SectionHeader';
import { cleanNum } from '../utils/financial';

const VisionScreen = ({ data }) => {
  const { cxc, cxp, proj, balance } = data;

  const totalCxC = useMemo(() => cxc.reduce((a, b) => a + b.saldo, 0), [cxc]);
  const totalCxP = useMemo(() => cxp.reduce((a, b) => a + b.saldo, 0), [cxp]);
  const totalPres = useMemo(() => proj.reduce((a, b) => a + b.presupuesto_neto, 0), [proj]);
  const saldoNeto = totalCxC - totalCxP;
  const ratio = totalCxP ? (totalCxC / totalCxP) : 0;

  const acidTest = useMemo(() => {
    if (balance && balance.length > 0) {
      const b = balance[0];
      const val = (cleanNum(b.efectivo_y_equivalente_de_efectivo) + cleanNum(b.cuentas_por_cobrar_comerciales)) / (cleanNum(b.total_pasivo_corriente) || 1);
      return isNaN(val) ? 'N/A' : val.toFixed(2);
    }
    return 'N/A';
  }, [balance]);

  // --- LÓGICA DE CXC: 2024 vs 2025 ---
  const cxcComparisonData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const data2024 = new Array(12).fill(0);
    const data2025 = new Array(12).fill(0);

    cxc.forEach(p => {
      if (p.fecha_emision && p.fecha_emision instanceof Date) {
        const month = p.fecha_emision.getMonth();
        const year = p.fecha_emision.getFullYear();
        const amount = p.saldo || 0;

        if (year === 2024) data2024[month] += amount;
        if (year === 2025) data2025[month] += amount;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'CxC 2025',
          data: data2025,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true
        },
        {
          label: 'CxC 2024',
          data: data2024,
          borderColor: '#94a3b8',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          fill: false
        }
      ]
    };
  }, [cxc]);

  // --- LÓGICA: COBRANZA vs PAGOS (RATIO LIQUIDEZ) ---
  const liquidityChartData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const cxcValues = new Array(12).fill(0);
    const cxpValues = new Array(12).fill(0);

    const isUSD = (val) => {
      const str = String(val).toUpperCase();
      return str.includes('USD') || str.includes('DOLAR') || str.includes('$');
    };

    cxc.forEach(i => {
      if (i.fecha_vencimiento instanceof Date && i.fecha_vencimiento.getFullYear() === 2025) {
        if (!isUSD(i.tipo_moneda)) {
          cxcValues[i.fecha_vencimiento.getMonth()] += (i.saldo || 0);
        }
      }
    });

    cxp.forEach(i => {
      if (i.fecha_vencimiento instanceof Date && i.fecha_vencimiento.getFullYear() === 2025) {
        if (!isUSD(i.moneda)) {
          cxpValues[i.fecha_vencimiento.getMonth()] += (i.saldo || 0);
        }
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Cobranza (CxC)',
          data: cxcValues,
          backgroundColor: '#3b82f6',
          borderRadius: 4
        },
        {
          label: 'Pagos (CxP)',
          data: cxpValues,
          backgroundColor: '#ef4444',
          borderRadius: 4
        }
      ]
    };
  }, [cxc, cxp]);

  const agingData = useMemo(() => {
    const buckets = ['Por Vencer', '1-30', '31-60', '61-90', '+90'];
    const dataC = buckets.map(b => cxc.filter(i => i.bucket === b).reduce((s, i) => s + i.saldo, 0));
    const dataP = buckets.map(b => cxp.filter(i => i.bucket === b).reduce((s, i) => s + i.saldo, 0));

    const indigoPalette = ['#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#3730a3'];
    const rosePalette = ['#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#9f1239'];

    return {
      labels: buckets,
      datasets: [
        {
          label: 'CxC (Cobrar)',
          data: dataC,
          backgroundColor: indigoPalette,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 10
        },
        {
          label: 'CxP (Pagar)',
          data: dataP,
          backgroundColor: rosePalette,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 10
        }
      ]
    };
  }, [cxc, cxp]);

  const topCxCData = useMemo(() => {
    const map = {};
    cxc.forEach(i => map[i.entidad] = (map[i.entidad] || 0) + i.saldo);
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return {
      labels: sorted.map(s => s[0]),
      datasets: [{ label: 'Saldo S/', data: sorted.map(s => s[1]), backgroundColor: '#4f46e5', borderRadius: 6 }]
    };
  }, [cxc]);

  const scatterData = useMemo(() => {
    const points = proj.filter(p => p.fecha).map(p => ({ x: p.fecha.getMonth() + 1, y: p.presupuesto_neto }));
    return {
      datasets: [{ label: 'Ventas', data: points, backgroundColor: '#10b981', pointRadius: 6, pointHoverRadius: 8 }]
    };
  }, [proj]);

  return (
    <div className="space-y-8 animate-fade-in">
      <SectionHeader title="Visión Estratégica" subtitle="Estado de salud financiera y KPIs macro." />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPI title="Cuentas x Cobrar" value={`S/ ${totalCxC.toLocaleString()}`} icon={TrendingUp} colorTheme="indigo" />
        <KPI title="Cuentas x Pagar" value={`S/ ${totalCxP.toLocaleString()}`} icon={TrendingDown} colorTheme="rose" />
        <KPI title="Flujo Neto" value={`S/ ${saldoNeto.toLocaleString()}`} icon={Wallet} colorTheme="emerald" />
        <KPI title="Ratio Liquidez" value={ratio.toFixed(2)} icon={Activity} colorTheme="amber" subtext="CxC / CxP" />
      </div>

      <Card hover={true}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Evolución de Cartera por Cobrar</h3>
              <p className="text-xs text-slate-500">Saldo Pendiente (Generado por Fecha Emisión)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span> 2024
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span> 2025
            </span>
          </div>
        </div>
        <ChartComponent
          type="line"
          height={300}
          data={cxcComparisonData}
          options={{
            scales: { y: { beginAtZero: true, ticks: { callback: v => 'S/ ' + v.toLocaleString() } } },
            plugins: { tooltip: { callbacks: { label: c => c.dataset.label + ': S/ ' + c.parsed.y.toLocaleString() } } }
          }}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover={true}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Envejecimiento de Deuda</h3>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-medium">Consolidado (Doughnut)</span>
          </div>
          <ChartComponent type="doughnut" data={agingData} options={{ cutout: '50%' }} />
        </Card>
        <Card hover={true}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Top 5 Clientes (Deuda)</h3>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-medium">Pareto</span>
          </div>
          <ChartComponent type="bar" data={topCxCData} options={{ indexAxis: 'y' }} />
        </Card>
      </div>

      <Card hover={true}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Cobranza vs Pagos (Ratio Liquidez)</h3>
              <p className="text-xs text-slate-500">Proyección 2025 (Solo Soles PEN) | Ratio = Total CxC / Total CxP</p>
            </div>
          </div>
        </div>
        <ChartComponent
          type="bar"
          height={250}
          data={liquidityChartData}
          options={{
            scales: { y: { beginAtZero: true, ticks: { callback: v => 'S/ ' + v.toLocaleString() } } },
            plugins: { tooltip: { callbacks: { label: c => c.dataset.label + ': S/ ' + c.parsed.y.toLocaleString() } } }
          }}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPI title="Prueba Ácida" value={acidTest} subtext="Liquidez Inmediata" icon={AlertCircle} colorTheme="slate" />
        <KPI title="Facturación Anual" value={`S/ ${totalPres.toLocaleString()}`} subtext="Ventas Estimadas" icon={FileText} colorTheme="slate" />
        <Card hover={true}>
          <h3 className="font-bold text-slate-800 mb-4">Estacionalidad de Ventas</h3>
          <ChartComponent type="scatter" height={120} data={scatterData} options={{ scales: { x: { min: 0, max: 13, grid: { display: false } }, y: { grid: { borderDash: [5, 5] } } } }} />
        </Card>
      </div>
    </div>
  );
};

export default VisionScreen;

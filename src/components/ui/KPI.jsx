import Card from './Card';

const KPI = ({ title, value, icon: Icon, colorTheme, subtext }) => {
  const themes = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-500' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-500' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-500' },
  };

  const theme = themes[colorTheme] || themes.slate;

  return (
    <Card hover={true} className="relative overflow-hidden group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
          {subtext && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.bg} ${theme.text}`}>
                {subtext}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${theme.bg} ${theme.text} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
          {Icon && <Icon size={22} strokeWidth={2.5} />}
        </div>
      </div>
    </Card>
  );
};

export default KPI;

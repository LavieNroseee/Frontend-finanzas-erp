const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-10 animate-fade-in-up">
    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
    {subtitle && <p className="text-slate-500 mt-2 text-lg font-light">{subtitle}</p>}
  </div>
);

export default SectionHeader;

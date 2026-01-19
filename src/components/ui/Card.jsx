const Card = ({ children, className = "", hover = false }) => (
  <div className={`bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 p-6 ${hover ? 'card-hoverable' : ''} ${className}`}>
    {children}
  </div>
);

export default Card;

import './StatCard.css';

export default function StatCard({ label, value, badge, badgeType = 'green', sub, subIcon = '↗' }) {
  return (
    <div className="stat-card card">
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        {badge && <span className={`badge badge-${badgeType}`}>{badge}</span>}
      </div>
      <div className="stat-card__value">{value}</div>
      {sub && (
        <div className="stat-card__sub">
          <span>{sub}</span>
          <span className="stat-card__sub-icon">{subIcon}</span>
        </div>
      )}
    </div>
  );
}

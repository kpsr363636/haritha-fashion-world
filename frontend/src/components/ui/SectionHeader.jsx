import { Link } from 'react-router-dom'

export default function SectionHeader({ eyebrow, title, linkLabel, linkTo, className = '' }) {
  return (
    <div className={`flex justify-between items-end mb-6 md:mb-8 ${className}`}>
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
      </div>
      {linkLabel && linkTo && (
        <Link to={linkTo} className="text-brand text-sm font-medium hover:underline flex items-center gap-1 group">
          {linkLabel}
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      )}
    </div>
  )
}

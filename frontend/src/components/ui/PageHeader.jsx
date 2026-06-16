export default function PageHeader({ eyebrow, title, subtitle, action, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10 ${className}`}>
      <div>
        {eyebrow && (
          <p className="eyebrow mb-2">{eyebrow}</p>
        )}
        {title && <h1 className="page-title">{title}</h1>}
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

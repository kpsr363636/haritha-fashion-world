export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="page-shell py-24 flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-gold-light flex items-center justify-center shadow-soft">
          <div className="w-8 h-8 rounded-full border-2 border-brand/20" />
          <div className="absolute inset-0 m-auto w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        </div>
      </div>
      <p className="text-gray-500 mt-6 text-sm font-medium">{message}</p>
      <div className="flex gap-1 mt-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-brand/40 animate-pulse-soft" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  )
}

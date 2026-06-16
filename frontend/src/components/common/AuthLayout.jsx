export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-layout animate-fade-in">
      <div className="auth-hero">
        <div className="relative z-10 max-w-md">
          <p className="text-gold-light text-sm uppercase tracking-[0.25em] mb-5 font-semibold">Haritha Fashion</p>
          <h1 className="font-display text-5xl xl:text-6xl font-semibold leading-[1.1] mb-6">
            Where tradition meets modern elegance
          </h1>
          <p className="text-white/85 text-lg leading-relaxed">
            Discover sarees, ethnic wear, fine jewellery and beauty — curated for the modern Indian woman.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            {['Free delivery ₹499+', 'Easy returns', 'Secure checkout'].map((t) => (
              <span key={t} className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-sm text-white/90 border border-white/10">
                ✦ {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-card animate-slide-up">
          {title && <h2 className="font-display text-3xl font-semibold text-center text-gray-900 mb-1">{title}</h2>}
          {subtitle && <p className="text-gray-500 text-center mb-8 text-sm">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  )
}

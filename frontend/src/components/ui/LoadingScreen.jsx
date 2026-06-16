export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="page-shell py-24 flex flex-col items-center justify-center animate-fade-in">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-2 border-brand/20" />
        <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
      <p className="text-gray-500 mt-5 text-sm font-medium">{message}</p>
    </div>
  )
}

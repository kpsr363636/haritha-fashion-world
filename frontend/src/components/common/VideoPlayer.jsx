import { useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

export default function VideoPlayer({ src, poster, className = '' }) {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)

  if (!src) return null

  const toggle = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setPlaying(!playing)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !muted
    setMuted(!muted)
  }

  const fullscreen = () => {
    if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen()
  }

  const onTimeUpdate = () => {
    if (!videoRef.current) return
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100
    setProgress(isNaN(p) ? 0 : p)
  }

  const seek = (e) => {
    if (!videoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pct * videoRef.current.duration
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-black group ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        onTimeUpdate={onTimeUpdate}
        onEnded={() => setPlaying(false)}
        playsInline
      />
      <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-transparent via-transparent to-black/60">
        <div />
        <div className="space-y-2">
          {/* Progress bar */}
          <div
            className="w-full h-1 bg-white/30 rounded cursor-pointer"
            onClick={seek}
          >
            <div className="h-1 bg-brand rounded" style={{ width: `${progress}%` }} />
          </div>
          {/* Controls */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={toggle} className="text-white hover:text-brand transition-colors">
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button type="button" onClick={toggleMute} className="text-white hover:text-brand transition-colors">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="flex-1" />
            <button type="button" onClick={fullscreen} className="text-white hover:text-brand transition-colors">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {!playing && (
        <button
          type="button"
          onClick={toggle}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-brand/80 transition-colors">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </button>
      )}
    </div>
  )
}

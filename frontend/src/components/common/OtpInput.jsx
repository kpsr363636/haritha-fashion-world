import { useRef, useEffect } from 'react'

export default function OtpInput({ value = '', onChange, length = 6, disabled }) {
  const inputs = useRef([])

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const newDigits = [...digits]
    newDigits[index] = val
    onChange(newDigits.join(''))
    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < length - 1) inputs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)
    inputs.current[Math.min(pasted.length, length - 1)]?.focus()
    e.preventDefault()
  }

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl
            focus:border-brand focus:outline-none transition-colors
            disabled:bg-gray-100 disabled:cursor-not-allowed
            border-gray-300"
        />
      ))}
    </div>
  )
}

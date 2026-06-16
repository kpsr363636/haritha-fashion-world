import { useEffect, useState } from 'react'
import { qaApi } from '../../api/reviewApi'
import { useAuth } from '../../context/AuthContext'

export default function QASection({ productId }) {
  const { isAuthenticated } = useAuth()
  const [questions, setQuestions] = useState([])
  const [text, setText] = useState('')

  const load = () => {
    qaApi.list(productId).then((r) => setQuestions(r.data?.content || r.data || [])).catch(() => {})
  }

  useEffect(() => { load() }, [productId])

  const ask = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await qaApi.ask(productId, text.trim())
    setText('')
    load()
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-xl font-bold mb-4">Questions & Answers</h2>
      {isAuthenticated && (
        <form onSubmit={ask} className="flex gap-2 mb-6">
          <input className="input-field flex-1" placeholder="Ask a question about this product" value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="btn-primary">Ask</button>
        </form>
      )}
      <div className="space-y-4">
        {questions.length === 0 ? <p className="text-gray-500 text-sm">No questions yet.</p> : questions.map((q) => (
          <div key={q.id} className="border rounded-lg p-4">
            <p className="font-medium">Q: {q.question}</p>
            {q.answer ? <p className="text-sm text-gray-600 mt-2">A: {q.answer}</p> : <p className="text-xs text-gray-400 mt-2">Awaiting answer</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

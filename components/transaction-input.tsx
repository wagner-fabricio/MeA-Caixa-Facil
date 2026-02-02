'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2, Check, X } from 'lucide-react'
import { parseTransaction } from '@/lib/nlp/transaction-parser'

interface TransactionInputProps {
    businessId: string
    onSuccess?: () => void
}

export default function TransactionInput({ businessId, onSuccess }: TransactionInputProps) {
    const [input, setInput] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [preview, setPreview] = useState<any>(null)
    const [error, setError] = useState('')
    const recognitionRef = useRef<any>(null)

    // Parse input in real-time
    const handleInputChange = (value: string) => {
        setInput(value)
        if (value.trim()) {
            const parsed = parseTransaction(value)
            setPreview(parsed)
        } else {
            setPreview(null)
        }
    }

    // Voice recording
    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            setError('Seu navegador não suporta reconhecimento de voz. Use Chrome ou Edge.')
            return
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.lang = 'pt-BR'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onstart = () => {
            setIsRecording(true)
            setError('')
        }

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            handleInputChange(transcript)
            setIsRecording(false)
        }

        recognition.onerror = () => {
            setError('Erro ao gravar. Tente novamente.')
            setIsRecording(false)
        }

        recognition.onend = () => {
            setIsRecording(false)
        }

        recognitionRef.current = recognition
        recognition.start()
    }

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
    }

    // Submit transaction
    const handleSubmit = async () => {
        if (!preview) {
            setError('Digite ou fale uma transação válida')
            return
        }

        setIsProcessing(true)
        setError('')

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input,
                    businessId,
                    method: isRecording ? 'voice' : 'manual',
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Erro ao salvar')
            }

            // Success
            setInput('')
            setPreview(null)
            onSuccess?.()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-primary-navy mb-4">Registrar Agora</h3>

            {/* Input Field */}
            <div className="relative mb-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder='Ex: "Corte 35" ou "Luz 180"'
                    className="w-full px-4 py-4 pr-14 border-2 border-gray-200 rounded-xl focus:border-primary-cyan focus:ring-2 focus:ring-primary-cyan/20 outline-none text-lg transition-all"
                    disabled={isRecording || isProcessing}
                />
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-lg transition-all ${isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-primary-navy text-primary-cyan hover:bg-primary-navy/90 border-2 border-primary-cyan/30 focus:ring-2 focus:ring-primary-cyan/50'
                        }`}
                >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
            </div>

            {/* Preview */}
            {preview && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${preview.type === 'income'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}
                                >
                                    {preview.type === 'income' ? '↑ Entrada' : '↓ Saída'}
                                </span>
                                <span className="text-2xl font-bold text-primary-navy font-mono">
                                    R$ {preview.amount.toFixed(2)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600">Categoria: {preview.category}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Confiança: {Math.round(preview.confidence * 100)}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!preview || isProcessing}
                className="w-full bg-primary-navy text-white py-5 rounded-2xl font-bold text-xl hover:bg-primary-navy/90 transition-all shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-b-4 border-primary-cyan/20"
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Salvando...
                    </>
                ) : (
                    <>
                        <Check className="w-5 h-5" />
                        Confirmar e Salvar
                    </>
                )}
            </button>

            {/* Hints */}
            <div className="mt-4 text-xs text-gray-500">
                <p className="font-medium mb-1">💡 Dicas:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Digite ou fale o valor e o que foi</li>
                    <li>Ex: "Corte 35", "Recebi 50", "Luz 180"</li>
                    <li>O app detecta automaticamente se é entrada ou saída</li>
                </ul>
            </div>
        </div>
    )
}

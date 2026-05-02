"use client"

import { useState } from "react"
import { X, ChevronRight, ChevronLeft, Share, PlusSquare, Smartphone } from "lucide-react"

interface InstallTutorialProps {
  onClose: () => void
}

const steps = [
  {
    icon: <Share className="w-10 h-10" style={{ color: "#ff6b52" }} />,
    title: "Toca Compartir",
    description: 'En Safari, toca el botón de compartir (la caja con flecha ↑) en la barra inferior del navegador.',
    hint: "Barra inferior de Safari",
  },
  {
    icon: <PlusSquare className="w-10 h-10" style={{ color: "#ff6b52" }} />,
    title: '"Añadir a inicio"',
    description: 'Desplázate en el menú y toca "Añadir a pantalla de inicio" o "Add to Home Screen".',
    hint: "Añadir a pantalla de inicio",
  },
  {
    icon: <Smartphone className="w-10 h-10" style={{ color: "#ff6b52" }} />,
    title: "¡Confirma!",
    description: 'Toca "Añadir" en la esquina superior derecha. PlaneApp aparecerá en tu pantalla de inicio.',
    hint: "¡Listo! Ya tienes PlaneApp",
  },
]

export default function InstallTutorial({ onClose }: InstallTutorialProps) {
  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-[#111c2d]">Instalar en iPhone / iPad</h2>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full transition-all"
              style={{ background: i <= step ? "#ff6b52" : "#e5e7eb" }} />
          ))}
        </div>

        {/* Content */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: "#ffdad4" }}>
            {steps[step].icon}
          </div>
          <h3 className="text-xl font-extrabold text-[#111c2d]">{steps[step].title}</h3>
          <p className="text-gray-500 leading-relaxed font-medium text-sm">{steps[step].description}</p>
          <span className="text-sm font-bold px-4 py-2 rounded-xl"
            style={{ background: "#ffdad4", color: "#ae311e" }}>
            {steps[step].hint}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold flex items-center justify-center gap-1">
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>
          )}
          <button
            onClick={() => isLast ? onClose() : setStep(step + 1)}
            className="flex-1 py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-1"
            style={{ background: "linear-gradient(135deg, #ff8a72, #ff6b52)" }}>
            {isLast ? "¡Entendido!" : "Siguiente"}
            {!isLast && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { X, ChevronRight, ChevronLeft, Share, PlusSquare, Smartphone } from "lucide-react"

interface InstallTutorialProps {
  onClose: () => void
}

const steps = [
  {
    icon: <Share className="w-10 h-10 text-orange-500" />,
    title: "Paso 1: Toca Compartir",
    description:
      'En Safari, toca el botón de compartir (el icono de la caja con una flecha hacia arriba) en la barra inferior del navegador.',
    highlight: "Botón Compartir ↑",
  },
  {
    icon: <PlusSquare className="w-10 h-10 text-orange-500" />,
    title: 'Paso 2: "Añadir a inicio"',
    description:
      'Desplázate hacia abajo en el menú y toca "Añadir a pantalla de inicio" o "Add to Home Screen".',
    highlight: "Añadir a pantalla de inicio",
  },
  {
    icon: <Smartphone className="w-10 h-10 text-orange-500" />,
    title: "Paso 3: Confirma",
    description:
      'Toca "Añadir" en la esquina superior derecha. ¡Listo! PlaneApp aparecerá en tu pantalla de inicio como una app nativa.',
    highlight: "¡Ya tienes PlaneApp!",
  },
]

export default function InstallTutorial({ onClose }: InstallTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const isLast = currentStep === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Instalar PlaneApp en iOS</h2>
          <button onClick={onClose} className="p-1 rounded-full bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= currentStep ? "bg-orange-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center">
            {steps[currentStep].icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h3>
          <p className="text-gray-500 leading-relaxed">{steps[currentStep].description}</p>
          <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-xl">
            {steps[currentStep].highlight}
          </span>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold flex items-center justify-center gap-1"
            >
              <ChevronLeft className="w-5 h-5" />
              Anterior
            </button>
          )}
          <button
            onClick={() => {
              if (isLast) {
                onClose()
              } else {
                setCurrentStep(currentStep + 1)
              }
            }}
            className="flex-1 py-3 rounded-2xl bg-orange-500 text-white font-semibold flex items-center justify-center gap-1"
          >
            {isLast ? "¡Entendido!" : "Siguiente"}
            {!isLast && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { X, Download, Smartphone } from "lucide-react"
import InstallTutorial from "./InstallTutorial"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Detectar iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    // Detectar si ya está instalada
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    setIsInstalled(installed)

    if (installed) return

    // Verificar si ya fue descartado recientemente
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) return
    }

    if (ios) {
      // En iOS no hay beforeinstallprompt, mostramos tutorial
      setTimeout(() => setShowBanner(true), 3000)
    } else {
      // Android / Chrome
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setTimeout(() => setShowBanner(true), 3000)
      }
      window.addEventListener("beforeinstallprompt", handler)
      return () => window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      setShowTutorial(true)
      setShowBanner(false)
      return
    }
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setShowBanner(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString())
  }

  if (isInstalled || (!showBanner && !showTutorial)) return null

  return (
    <>
      {/* Banner de instalación */}
      {showBanner && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4">
          <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-500 rounded-xl p-2 flex-shrink-0">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  Instala PlaneApp
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isIOS
                    ? "Añade la app a tu pantalla de inicio para acceder más rápido"
                    : "Instala la app y úsala sin necesidad del navegador"}
                </p>
              </div>
              <button onClick={handleDismiss} className="text-gray-400 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 text-sm text-gray-500 font-medium rounded-xl bg-gray-100"
              >
                Ahora no
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 py-2 text-sm text-white font-medium rounded-xl bg-orange-500 flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Instalar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial para iOS */}
      {showTutorial && <InstallTutorial onClose={() => setShowTutorial(false)} />}
    </>
  )
}

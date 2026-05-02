"use client"

import { useState, useEffect } from "react"
import { X, Download } from "lucide-react"
import InstallTutorial from "./InstallTutorial"
import { LogoIcon } from "./Logo"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function getDeviceType(): "ios" | "android" | "desktop" {
  if (typeof navigator === "undefined") return "desktop"
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return "ios"
  if (/android/i.test(ua)) return "android"
  return "desktop"
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop">("desktop")

  useEffect(() => {
    const device = getDeviceType()
    setDeviceType(device)

    // No mostrar en escritorio
    if (device === "desktop") return

    // No mostrar si ya está instalada como PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    if (isStandalone) return

    // No mostrar si fue descartado en los últimos 7 días
    const dismissed = localStorage.getItem("pwa-install-dismissed")
    if (dismissed) {
      const daysSince = (Date.now() - new Date(dismissed).getTime()) / 86400000
      if (daysSince < 7) return
    }

    if (device === "ios") {
      // iOS: no hay beforeinstallprompt — mostrar banner manual tras 4s
      const t = setTimeout(() => setShowBanner(true), 4000)
      return () => clearTimeout(t)
    }

    if (device === "android") {
      // Android: esperar el evento nativo del navegador
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        setTimeout(() => setShowBanner(true), 4000)
      }
      window.addEventListener("beforeinstallprompt", handler)
      return () => window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (deviceType === "ios") {
      setShowBanner(false)
      setShowTutorial(true)
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

  if (!showBanner && !showTutorial) return null

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <div className="bg-white rounded-3xl p-4"
            style={{ boxShadow: "0 8px 32px rgba(17,28,45,0.15)" }}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <LogoIcon size={40} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#111c2d] text-sm">
                  Instala PlaneApp
                </p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  {deviceType === "ios"
                    ? "Añádela a tu pantalla de inicio con Safari"
                    : "Instálala y úsala sin necesidad del navegador"}
                </p>
              </div>
              <button onClick={handleDismiss} className="flex-shrink-0 p-1 rounded-full bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleDismiss}
                className="flex-1 py-2.5 text-sm text-gray-500 font-semibold rounded-2xl bg-gray-100">
                Ahora no
              </button>
              <button onClick={handleInstall}
                className="flex-1 py-2.5 text-sm text-white font-bold rounded-2xl flex items-center justify-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #ff8a72, #ff6b52)" }}>
                <Download className="w-4 h-4" />
                {deviceType === "ios" ? "Ver cómo" : "Instalar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTutorial && <InstallTutorial onClose={() => setShowTutorial(false)} />}
    </>
  )
}

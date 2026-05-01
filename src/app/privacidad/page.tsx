export default function PrivacidadPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Política de Privacidad</h1>
      <div className="prose text-gray-600 space-y-4 text-sm leading-relaxed">
        <p><strong>Última actualización:</strong> Mayo 2026</p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">1. Información que recopilamos</h2>
        <p>PlaneApp recopila la información que nos proporcionas al registrarte: nombre, correo electrónico y foto de perfil. Si usas Google o Facebook para iniciar sesión, recibimos la información básica de tu perfil en esas plataformas.</p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">2. Uso de la información</h2>
        <p>Usamos tu información para: crear y gestionar tu cuenta, mostrarte planes cercanos a tu ubicación, permitirte crear y unirte a planes con otros usuarios.</p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">3. Geolocalización</h2>
        <p>PlaneApp solicita acceso a tu ubicación únicamente para mostrarte planes cercanos. Esta información no se almacena de forma permanente sin tu consentimiento explícito.</p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">4. Compartir información</h2>
        <p>No vendemos ni compartimos tu información personal con terceros, excepto cuando es necesario para el funcionamiento del servicio (proveedor de base de datos: Supabase).</p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">5. Tus derechos</h2>
        <p>Puedes solicitar la eliminación de tu cuenta y todos tus datos en cualquier momento desde tu perfil o enviando un email a <strong>privacidad@planeapp.es</strong>.</p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">6. Contacto</h2>
        <p>Para cualquier consulta sobre privacidad: <strong>privacidad@planeapp.es</strong></p>
      </div>
    </div>
  )
}

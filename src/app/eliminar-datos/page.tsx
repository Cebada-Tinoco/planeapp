export default function EliminarDatosPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Eliminación de datos de usuario</h1>
      <div className="text-gray-600 space-y-4 text-sm leading-relaxed">
        <p>
          Si iniciaste sesión en PlaneApp con tu cuenta de Facebook y deseas eliminar todos tus datos de nuestra plataforma, puedes hacerlo de las siguientes formas:
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">Opción 1 — Desde la app</h2>
        <p>Accede a tu perfil dentro de PlaneApp y selecciona la opción <strong>"Eliminar mi cuenta"</strong>. Esto borrará permanentemente todos tus datos, planes creados y participaciones.</p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">Opción 2 — Por email</h2>
        <p>
          Envía un correo a <strong>privacidad@planeapp.es</strong> con el asunto <em>"Eliminar mis datos"</em> y tu dirección de email o ID de usuario. Procesaremos tu solicitud en un plazo máximo de 30 días.
        </p>

        <h2 className="text-lg font-semibold text-gray-800 mt-6">¿Qué datos se eliminan?</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Tu perfil y foto de avatar</li>
          <li>Los planes que hayas creado</li>
          <li>Tu historial de participación en planes</li>
          <li>Las mascotas registradas</li>
          <li>Las fotos que hayas subido</li>
        </ul>

        <p className="mt-6">
          Para cualquier duda: <strong>privacidad@planeapp.es</strong>
        </p>
      </div>
    </div>
  )
}

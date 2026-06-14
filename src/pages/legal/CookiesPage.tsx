import { abrirPreferenciasCookies } from '@/cookies/cookieConsent';
import { LegalLayout, LegalSection } from './LegalLayout';

export function CookiesPage() {
  return (
    <LegalLayout
      badge="ID: POLITICA_DE_COOKIES"
      title="POLITICA DE COOKIES"
      subtitle="// COMO USAMOS COOKIES Y ALMACENAMIENTO LOCAL"
      lastUpdated="12/06/2026"
    >
      <p>
        En AURA IA usamos cookies y almacenamiento local solo para que la aplicacion funcione
        bien y para recordar tus preferencias. No usamos cookies de publicidad ni analitica sin
        tu permiso.
      </p>

      <LegalSection number="01" title="Que son las cookies">
        <p>
          Una cookie es un pequeno archivo que el navegador guarda en tu dispositivo. Sirve para
          recordar informacion, por ejemplo si ya aceptaste o rechazaste el banner de cookies.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Cookies necesarias">
        <p>
          Son las que hacen falta para que la web funcione. No se pueden desactivar desde el
          panel porque sin ellas algunas partes basicas dejarian de funcionar.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>aura_cookie_consent:</strong> guarda tu eleccion sobre cookies durante 180
            dias.
          </li>
          <li>
            <strong>Seguridad:</strong> Cloudflare Turnstile puede hacer comprobaciones tecnicas
            en registro y recuperacion de contrasena para evitar abuso.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="03" title="Almacenamiento local">
        <p>
          AURA tambien usa <code className="bg-brutal-teal/30 px-1">localStorage</code>. No es
          una cookie, pero guarda datos en tu navegador.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Sesion iniciada: token JWT y refresh token.</li>
          <li>Preferencias: idioma, tema visual y seccion activa del panel.</li>
          <li>Estado del panel: algunos datos temporales para mejorar la experiencia.</li>
        </ul>
      </LegalSection>

      <LegalSection number="04" title="Analitica y marketing">
        <p>
          Ahora mismo AURA IA no usa Google Analytics, Meta Pixel, Hotjar, mapas ni cookies de
          publicidad. Si en el futuro se anaden, no se cargaran hasta que aceptes esa categoria.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Cambiar tu decision">
        <p>
          Puedes aceptar, rechazar o cambiar tu configuracion cuando quieras desde este boton.
        </p>
        <button type="button" className="brutal-btn-purple" onClick={abrirPreferenciasCookies}>
          CONFIGURAR_COOKIES
        </button>
      </LegalSection>

      <LegalSection number="06" title="Como borrar cookies">
        <p>
          Tambien puedes borrar cookies y datos del sitio desde la configuracion de tu navegador.
          Si lo haces, AURA volvera a preguntarte tus preferencias la proxima vez.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

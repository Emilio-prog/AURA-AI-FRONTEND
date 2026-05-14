import { LegalLayout, LegalSection } from './LegalLayout';

export function PrivacyPage() {
  return (
    <LegalLayout
      badge="ID: POLÍTICA_DE_PRIVACIDAD"
      title="POLÍTICA DE PRIVACIDAD"
      subtitle="// CÓMO TRATAMOS TUS DATOS EN AURA IA"
      lastUpdated="10/05/2026"
    >
      <p>
        En AURA IA tratamos datos personales muy sensibles relacionados con tu bienestar
        emocional. Esta política explica qué recogemos, por qué, durante cuánto tiempo y qué
        derechos puedes ejercer en cualquier momento, conforme al Reglamento (UE) 2016/679
        (RGPD) y la LOPDGDD.
      </p>

      <LegalSection number="01" title="Responsable del tratamiento">
        <p>
          El responsable es <strong>AURA IA</strong>, con dominio operativo en{' '}
          <strong>aura-ia.es</strong>. Para cualquier asunto relacionado con tus datos puedes
          contactarnos en{' '}
          <a className="font-bold text-brutal-purple hover:underline" href="mailto:privacidad@aura-ia.es">
            privacidad@aura-ia.es
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection number="02" title="Qué datos recogemos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Datos de cuenta:</strong> nombre, email, contraseña cifrada (BCrypt), idioma
            preferido y estado de verificación.
          </li>
          <li>
            <strong>Contenido emocional:</strong> entradas de diario, registros de estado de
            ánimo, conversaciones con la IA, contactos de emergencia que tú añades.
          </li>
          <li>
            <strong>Datos técnicos:</strong> dirección IP, navegador, marcas de tiempo de inicio
            de sesión y tokens de sesión (refresh tokens) para mantener la cuenta activa.
          </li>
          <li>
            <strong>Datos de comunicación:</strong> emails transaccionales que enviamos
            (verificación, recuperación, bienvenida) y eventos de entrega/rebote del proveedor.
          </li>
        </ul>
        <p>
          No recogemos datos de menores de edad. Para crear una cuenta debes tener al menos{' '}
          <strong>18 años</strong>. Si detectamos una cuenta de un menor de edad, la eliminaremos.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Finalidades y base legal">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Prestación del servicio</strong> (ejecución del contrato, art. 6.1.b RGPD):
            crear y mantener tu cuenta, guardar tu diario, mostrar tus mood logs y permitir el
            chat con la IA.
          </li>
          <li>
            <strong>Tratamiento de categorías especiales</strong> (consentimiento explícito, art.
            9.2.a RGPD): los datos sobre estado de ánimo y contenido del diario son datos de
            salud emocional. Los tratamos solo con tu consentimiento explícito y puedes
            retirarlo borrando tu cuenta.
          </li>
          <li>
            <strong>Comunicaciones transaccionales</strong> (interés legítimo y obligación
            contractual): enviarte emails imprescindibles del servicio (verificación,
            recuperación de contraseña).
          </li>
          <li>
            <strong>Seguridad y prevención de fraude</strong> (interés legítimo, art. 6.1.f
            RGPD): rate limiting, detección de abuso y registros de actividad mínimos.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="04" title="Conservación">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Si solicitas la baja, eliminamos
          tu cuenta y todo el contenido asociado en un plazo máximo de <strong>30 días</strong>,
          salvo obligaciones legales que exijan retención (por ejemplo, registros mínimos de
          seguridad durante 12 meses).
        </p>
        <p>
          Los tokens de verificación y recuperación caducan automáticamente (24h y 30 minutos
          respectivamente) y se eliminan tras su uso.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Encargados del tratamiento">
        <p>
          Para prestar el servicio compartimos datos estrictamente necesarios con los siguientes
          proveedores, todos con garantías RGPD:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Supabase</strong> (PostgreSQL gestionado, UE) — almacena la base de datos.
          </li>
          <li>
            <strong>Resend</strong> (envío de emails transaccionales, EEE) — recibe tu email y
            nombre para entregar mensajes.
          </li>
          <li>
            <strong>Hostinger / Dokploy</strong> (hosting de la aplicación, UE) — ejecuta el
            backend.
          </li>
          <li>
            <strong>Google (Gemini API)</strong> (procesamiento de IA bajo demanda) — recibe el
            texto que tú envías al chat para generar respuestas. No usamos tus datos para
            entrenar modelos.
          </li>
        </ul>
      </LegalSection>

      <LegalSection number="06" title="Tus derechos">
        <p>Puedes ejercer en cualquier momento, escribiéndonos a privacidad@aura-ia.es:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Acceso a los datos que tenemos sobre ti.</li>
          <li>Rectificación de datos inexactos.</li>
          <li>Supresión (borrado) de tu cuenta y todo el contenido.</li>
          <li>Limitación del tratamiento.</li>
          <li>Portabilidad: te entregamos tus datos en formato estructurado (JSON).</li>
          <li>Oposición al tratamiento basado en interés legítimo.</li>
          <li>Retirada del consentimiento, sin que esto afecte a la legalidad previa.</li>
        </ul>
        <p>
          También puedes presentar una reclamación ante la{' '}
          <strong>Agencia Española de Protección de Datos</strong> (
          <a
            className="font-bold text-brutal-purple hover:underline"
            href="https://www.aepd.es"
            target="_blank"
            rel="noreferrer"
          >
            aepd.es
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection number="07" title="Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables: contraseñas con BCrypt,
          autenticación JWT, tokens opacos hasheados con SHA-256, conexiones cifradas TLS,
          aislamiento por usuario en la base de datos (Row-Level Security) y revocación de
          sesiones al cambiar la contraseña.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Almacenamiento local">
        <p>
          Usamos <code className="bg-brutal-teal/30 px-1">localStorage</code> del navegador para
          guardar tu sesión (token JWT, idioma, preferencias de panel). No usamos cookies de
          seguimiento ni publicidad. Puedes borrar este almacenamiento en cualquier momento
          desde tu navegador.
        </p>
      </LegalSection>

      <LegalSection number="09" title="Cambios en esta política">
        <p>
          Si modificamos esta política te avisaremos por email con 30 días de antelación cuando
          el cambio sea sustancial. La fecha de última actualización aparece arriba.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Contacto">
        <p>
          Para cualquier duda sobre privacidad escribe a{' '}
          <a
            className="font-bold text-brutal-purple hover:underline"
            href="mailto:privacidad@aura-ia.es"
          >
            privacidad@aura-ia.es
          </a>
          . Respondemos en un plazo máximo de 30 días.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

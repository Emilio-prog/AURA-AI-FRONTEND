import { LegalLayout, LegalSection } from './LegalLayout';

export function TermsPage() {
  return (
    <LegalLayout
      badge="ID: TÉRMINOS_DE_SERVICIO"
      title="TÉRMINOS DE SERVICIO"
      subtitle="// CONDICIONES DE USO DE AURA IA"
      lastUpdated="10/05/2026"
    >
      <div className="border-3 border-brutal-coral bg-brutal-coral/10 p-4 font-mono text-[12px] font-bold uppercase leading-relaxed tracking-wider text-brutal-black">
        ⚠ AVISO_CRÍTICO: AURA IA NO ES UN SERVICIO DE EMERGENCIA NI SUSTITUYE LA AYUDA
        PSICOLÓGICA O MÉDICA PROFESIONAL. SI TÚ O ALGUIEN CERCANO ESTÁ EN PELIGRO LLAMA AL 112.
        TELÉFONO DE PREVENCIÓN DEL SUICIDIO: 024.
      </div>

      <p>
        Bienvenido/a a AURA IA. Estos términos regulan el uso del servicio. Al crear una cuenta
        confirmas haberlos leído y aceptado. Si no estás conforme, no utilices el servicio.
      </p>

      <LegalSection number="01" title="Naturaleza del servicio">
        <p>
          AURA IA es una plataforma digital de <strong>apoyo emocional</strong>: ofrece un
          espacio para escribir un diario, registrar tu estado de ánimo y conversar con un
          asistente de inteligencia artificial. <strong>No es un servicio sanitario</strong>, no
          ofrece diagnóstico ni tratamiento, no sustituye la consulta con un profesional de la
          salud mental ni con un médico.
        </p>
        <p>
          La IA puede equivocarse, generar respuestas inexactas o no adecuadas a tu situación.
          Úsala como complemento, nunca como única fuente de orientación en momentos críticos.
        </p>
      </LegalSection>

      <LegalSection number="02" title="Edad mínima y requisitos">
        <p>
          Para crear una cuenta debes ser <strong>mayor de edad</strong> y tener al menos{' '}
          <strong>18 años</strong>. Al registrarte declaras que cumples este requisito. Si
          descubrimos cuentas de menores de edad, las eliminaremos.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Tu cuenta">
        <p>
          Eres responsable de mantener tus credenciales seguras. Notifícanos en{' '}
          <a className="font-bold text-brutal-purple hover:underline" href="mailto:soporte@aura-ia.es">
            soporte@aura-ia.es
          </a>{' '}
          si sospechas que tu cuenta ha sido comprometida. AURA IA no es responsable de daños
          derivados del uso no autorizado de tu cuenta cuando esté causado por negligencia tuya
          al custodiar la contraseña.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Uso aceptable">
        <p>Te comprometes a no utilizar AURA IA para:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Suplantar a otra persona o crear cuentas falsas.</li>
          <li>Acosar, amenazar o dañar a otros usuarios o terceros.</li>
          <li>Generar contenido ilegal, discurso de odio o material sexual con menores.</li>
          <li>Intentar vulnerar la seguridad del servicio (scraping masivo, ataques, etc.).</li>
          <li>Usar la IA para evadir sistemas de seguridad o automatizar abuso.</li>
        </ul>
        <p>
          El incumplimiento puede suponer la suspensión inmediata de tu cuenta sin reembolso.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Tu contenido">
        <p>
          El contenido que escribes en AURA IA (diario, mood logs, mensajes a la IA) es{' '}
          <strong>tuyo</strong>. Solo nos concedes una licencia limitada para almacenarlo,
          procesarlo y mostrártelo en el servicio. No lo vendemos, no lo cedemos a terceros con
          fines comerciales y no lo usamos para entrenar modelos de IA.
        </p>
        <p>
          Puedes eliminar tu contenido o tu cuenta en cualquier momento desde la configuración.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Inteligencia artificial y limitaciones">
        <p>
          Las respuestas de la IA se generan automáticamente y pueden contener errores. AURA IA
          no garantiza la exactitud, idoneidad o seguridad de cada respuesta. Si percibes que la
          IA te ofrece información peligrosa o claramente errónea, repórtalo a{' '}
          <a className="font-bold text-brutal-purple hover:underline" href="mailto:soporte@aura-ia.es">
            soporte@aura-ia.es
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection number="07" title="Disponibilidad">
        <p>
          Hacemos esfuerzos razonables para mantener el servicio operativo 24/7, pero no podemos
          garantizar disponibilidad ininterrumpida. Pueden producirse paradas por mantenimiento,
          fallos de proveedores externos o causas de fuerza mayor.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Suspensión y cancelación">
        <p>
          Puedes cancelar tu cuenta en cualquier momento. Nosotros podemos suspender o cancelar
          tu cuenta si incumples estos términos, con notificación previa salvo en casos de
          riesgo grave o ilegalidad evidente.
        </p>
      </LegalSection>

      <LegalSection number="09" title="Limitación de responsabilidad">
        <p>
          AURA IA se ofrece "tal cual". En la medida permitida por la ley aplicable, no seremos
          responsables de daños indirectos, lucro cesante, pérdida de datos derivada del uso del
          servicio, ni de decisiones que tomes basándote en las respuestas de la IA. Esta
          cláusula no limita responsabilidades que por ley no puedan excluirse (consumidores,
          dolo o negligencia grave).
        </p>
      </LegalSection>

      <LegalSection number="10" title="Modificaciones">
        <p>
          Podemos actualizar estos términos. Cuando el cambio sea sustancial te avisaremos por
          email con 30 días de antelación. Si continúas usando el servicio tras la entrada en
          vigor, aceptas la nueva versión.
        </p>
      </LegalSection>

      <LegalSection number="11" title="Ley aplicable y jurisdicción">
        <p>
          Estos términos se rigen por la legislación española. Para cualquier conflicto, las
          partes se someten a los juzgados del domicilio del consumidor cuando proceda según la
          normativa de consumo.
        </p>
      </LegalSection>

      <LegalSection number="12" title="Contacto">
        <p>
          Para cuestiones contractuales o sobre el servicio escríbenos a{' '}
          <a
            className="font-bold text-brutal-purple hover:underline"
            href="mailto:soporte@aura-ia.es"
          >
            soporte@aura-ia.es
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}

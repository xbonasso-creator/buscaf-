@AGENTS.md

# Buscafé — Reglas de trabajo para Claude Code

## Contexto del producto

Buscafé es una aplicación móvil para descubrir cafeterías de especialidad.

El MVP se lanza inicialmente en Montevideo, Uruguay.

La aplicación permite:

- registrarse con email, contraseña o Google;
- completar un onboarding de preferencias;
- descubrir cafeterías desde Inicio y Explorar;
- buscar por nombre, barrio y preferencias;
- aplicar filtros por servicios y ambiente;
- visualizar cafeterías en listado y mapa;
- consultar la ficha de cada cafetería;
- guardar cafeterías como favoritas;
- crear colecciones con las favoritas;
- abrir la ubicación en Maps;
- redireccionar al instagram de las cafeterías;
- compartir cafeterías por whatsapp.

Por el momento no incluye:

- reseñas de usuarios;
- comentarios públicos;
- fotos cargadas por usuarios;
- pagos;
- reservas;
- ubicación obligatoria;
- contenido generado por usuarios.

## Stack técnico esperado

- React Native
- Expo
- Expo Router
- TypeScript
- Supabase
- EAS Build
- GitHub
- Netlify para la versión web - landing page

Antes de asumir una librería, versión o estructura, verificá siempre el código existente.

## Reglas de trabajo

- No reemplaces la arquitectura completa sin explicar antes el motivo.
- No elimines archivos ni dependencias sin solicitar confirmación.
- No cambies versiones de Expo, React Native, Node o Supabase automáticamente.
- No ejecutes migraciones destructivas.
- No modifiques tablas de producción de Supabase sin mostrar primero el SQL.
- Nunca incluyas claves privadas, service role keys o secretos en el código.
- Las variables sensibles deben permanecer en archivos de entorno que no se suban a Git.
- No cambies el Bundle ID, slug, projectId, scheme o package name sin avisar.
- No modifiques eas.json, app.json o app.config.ts sin explicar el impacto.
- No hagas commits, pushes, deploys ni builds de producción sin autorización explícita.
- Antes de instalar una dependencia, explicá para qué se necesita y verificá compatibilidad con la versión de Expo.
- Evitá agregar dependencias cuando la solución pueda resolverse con herramientas ya instaladas.
- Mantené TypeScript estricto y evitá usar any.
- No ocultes errores con @ts-ignore salvo que esté justificado y documentado.
- Reutilizá componentes existentes antes de crear componentes nuevos.
- Evitá duplicar estilos, constantes y lógica.
- Mantené separación entre UI, lógica, datos y navegación.
- Usá nombres descriptivos y consistentes.
- Conservá el diseño y los textos existentes salvo que la tarea solicite modificarlos.
- No inventes datos de cafeterías.
- No cambies textos de UX sin señalarlo.
- Toda interfaz debe contemplar loading, error, vacío y éxito cuando corresponda.
- Priorizá accesibilidad, legibilidad, contraste y áreas táctiles adecuadas.
- Considerá iOS y Android - mobile first, no es una app web.

## Forma de trabajar en cada solicitud

Antes de editar:

1. Revisá los archivos relacionados.
2. Explicá brevemente qué entendiste.
3. Indicá qué archivos planeás modificar.
4. Señalá riesgos o dudas relevantes.
5. Si el cambio es grande, proponé un plan antes de implementarlo.

Durante la implementación:

- Hacé cambios pequeños y localizados.
- No modifiques archivos que no estén relacionados.
- Respetá los patrones actuales del repositorio.
- Agregá manejo de errores.
- Mantené compatibilidad con TypeScript y Expo.

Después de implementar:

1. Enumerá los archivos modificados.
2. Resumí qué cambió.
3. Indicá cómo probarlo.
4. Ejecutá, cuando corresponda:
   - TypeScript check
   - lint
   - tests existentes
5. Informá claramente cualquier error que no hayas podido resolver.
6. No afirmes que algo funciona si no fue probado.

## Diseño y UX

La interfaz debe sentirse:

- clara;
- cálida;
- contemporánea;
- simple;
- enfocada en cafeterías de especialidad.

No rediseñes componentes solo por preferencia personal.

Al recibir una captura o referencia de Figma:

- analizá primero la jerarquía;
- reutilizá tokens y componentes existentes;
- evitá valores visuales dispersos;
- conservá los textos proporcionados;
- indicá cuando una decisión visual no pueda inferirse con certeza.

## Supabase

- Centralizá las consultas y mutaciones.
- No hagas llamadas directas duplicadas desde múltiples pantallas.
- Usá los tipos generados de Supabase si ya existen.
- Revisá autenticación y sesión antes de agregar nuevas funciones.
- Mostrá el SQL antes de crear o modificar tablas, políticas o funciones.
- No desactives Row Level Security.
- No uses service_role en la aplicación cliente.
- No supongas nombres de tablas o columnas: verificá el esquema existente.

## Git

- Trabajá sobre el estado actual del repositorio.
- Antes de cambios grandes, recomendá crear una rama.
- No descartes cambios locales existentes.
- No uses comandos destructivos como git reset --hard o git clean sin autorización.
- No hagas commit ni push salvo que se solicite explícitamente.

## Objetivo general

Ayudar a desarrollar Buscafé de manera progresiva, mantenible y preparada para que en el futuro otro desarrollador pueda tomar el proyecto sin tener que rehacerlo desde cero. Va a ser una app que salga como MVP y luego se vayan sumando funcionalidades.

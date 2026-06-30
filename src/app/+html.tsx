import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* DM Sans — Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* DM Sans a todos los elementos de texto EXCEPTO fuentes de iconos.
                 RN Web aplica fontFamily via inline styles, por eso necesitamos !important.
                 El :not() excluye elementos cuyo style contiene el nombre de la fuente de íconos. */
              *:not([style*="Ionicons"])
              *:not([style*="Ionicons"])::before,
              *:not([style*="Ionicons"])::after {
                font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }

              /* Preservar explícitamente Ionicons */
              [style*="Ionicons"] {
                font-family: Ionicons !important;
              }

              /* Evita que el ancho desktop rompa el layout centrado */
              body {
                background-color: #E8E0D5;
                overflow-x: hidden;
              }

              /* Quita el outline azul del browser en inputs y botones */
              input:focus, button:focus, [role="button"]:focus {
                outline: none !important;
                box-shadow: none !important;
              }

              /* Scrollbar sutil */
              ::-webkit-scrollbar { width: 4px; height: 4px; }
              ::-webkit-scrollbar-track { background: transparent; }
              ::-webkit-scrollbar-thumb { background: #C8A882; border-radius: 4px; }
            `,
          }}
        />

        {/* Mapbox GL CSS */}
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.3.0/mapbox-gl.css"
          rel="stylesheet"
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

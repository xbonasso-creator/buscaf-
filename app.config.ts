import { ExpoConfig, ConfigContext } from "expo/config";

// app.json sigue siendo la config base (bundle id, slug, scheme, projectId, etc).
// Este archivo solo inyecta el token secreto de Mapbox desde una variable de
// entorno para que nunca quede hardcodeado en el repo.
export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = (config.plugins ?? []).map((plugin) => {
    if (Array.isArray(plugin) && plugin[0] === "@rnmapbox/maps") {
      return [
        "@rnmapbox/maps",
        {
          ...plugin[1],
          RNMapboxMapsDownloadToken: process.env.RNMAPBOX_DOWNLOAD_TOKEN,
        },
      ];
    }
    return plugin;
  }) as ExpoConfig["plugins"];

  return { ...config, plugins } as ExpoConfig;
};

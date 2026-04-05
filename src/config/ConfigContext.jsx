import { createContext, useContext, useReducer, useEffect, useRef } from "react";
import {
  fetchConfig,
  persistConfig,
  resetConfig,
  applyConfigToDOM,
  THEME_PRESETS,
  DEFAULT_CONFIG,
} from "./storeConfig";
import devAuthService from "../dev/services/devAuthService";

const ConfigContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "UPDATE":
      return { ...state, ...action.patch };
    case "APPLY_THEME": {
      const preset = THEME_PRESETS[action.preset];
      if (!preset) return state;
      return {
        ...state,
        themePreset: action.preset,
        colorPrimary:      preset.colorPrimary,
        colorPrimaryLight: preset.colorPrimaryLight,
        colorPrimaryDark:  preset.colorPrimaryDark,
        colorAccent:       preset.colorAccent,
        colorAccentLight:  preset.colorAccentLight,
        colorBackground:   preset.colorBackground,
        colorSurface:      preset.colorSurface,
      };
    }
    case "RESET":
      return { ...DEFAULT_CONFIG };
    default:
      return state;
  }
}

export function ConfigProvider({ children, applyToDOM = false }) {
  const [config, dispatch] = useReducer(reducer, DEFAULT_CONFIG);

  // true once the initial remote fetch is done
  const initialized = useRef(false);
  // true for exactly one effect cycle — the one triggered by the fetch dispatch
  const skipNextPersist = useRef(false);

  // On mount: fetch config from API, overwrite the default state
  useEffect(() => {
    fetchConfig().then(remote => {
      skipNextPersist.current = true;
      dispatch({ type: "UPDATE", patch: remote });
      initialized.current = true;
    });
  }, []);

  // Apply to DOM and persist whenever config changes
  useEffect(() => {
    if (applyToDOM) applyConfigToDOM(config);

    // Skip the effect cycle caused by the initial remote fetch
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }

    // Only persist user-initiated changes when a dev session is active
    if (!initialized.current) return;
    const session = devAuthService.getSession();
    if (session?.token) {
      persistConfig(config, session.token);
    }
  }, [config, applyToDOM]);

  const update = (patch) => dispatch({ type: "UPDATE", patch });
  const applyTheme = (preset) => dispatch({ type: "APPLY_THEME", preset });

  const reset = () => {
    const session = devAuthService.getSession();
    resetConfig(session?.token).then(defaults => {
      dispatch({ type: "UPDATE", patch: defaults });
    });
  };

  const fmt = (n) => `${config.currencySymbol} ${Number(n).toFixed(2)}`;

  return (
    <ConfigContext.Provider value={{ config, update, applyTheme, reset, fmt }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}

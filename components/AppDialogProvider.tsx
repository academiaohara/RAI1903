"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type DialogKind = "alert" | "confirm" | "prompt";

type DialogRequest = {
  kind: DialogKind;
  message: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  resolve: (value: boolean | string | null | void) => void;
};

type AppDialogContextValue = {
  alert: (message: string) => Promise<void>;
  confirm: (message: string, options?: { confirmLabel?: string; cancelLabel?: string }) => Promise<boolean>;
  prompt: (
    message: string,
    defaultValue?: string,
    options?: { confirmLabel?: string; cancelLabel?: string },
  ) => Promise<string | null>;
};

const AppDialogContext = createContext<AppDialogContextValue | null>(null);

export function useAppDialog(): AppDialogContextValue {
  const context = useContext(AppDialogContext);
  if (!context) {
    throw new Error("useAppDialog debe usarse dentro de AppDialogProvider");
  }
  return context;
}

function AppDialogOverlay({
  request,
  onClose,
}: {
  request: DialogRequest;
  onClose: (value: boolean | string | null | void) => void;
}) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [promptValue, setPromptValue] = useState(request.defaultValue ?? "");

  useEffect(() => {
    if (request.kind !== "prompt") return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [request.kind]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (request.kind === "alert") onClose();
        else if (request.kind === "confirm") onClose(false);
        else onClose(null);
        return;
      }

      if (event.key === "Enter" && request.kind === "prompt") {
        event.preventDefault();
        const trimmed = promptValue.trim();
        if (trimmed) onClose(trimmed);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, promptValue, request.kind]);

  const confirmLabel = request.confirmLabel ?? (request.kind === "alert" ? "Aceptar" : "Confirmar");
  const cancelLabel = request.cancelLabel ?? "Cancelar";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          if (request.kind === "alert") onClose();
          else if (request.kind === "confirm") onClose(false);
          else onClose(null);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-[#214C9B]/25 bg-white p-5 shadow-2xl shadow-slate-950/30 sm:rounded-3xl sm:p-6"
      >
        <p id={titleId} className="whitespace-pre-line text-sm font-semibold leading-relaxed text-slate-700">
          {request.message}
        </p>

        {request.kind === "prompt" ? (
          <input
            ref={inputRef}
            type="text"
            value={promptValue}
            onChange={(event) => setPromptValue(event.target.value)}
            className="mt-4 w-full rounded-xl border border-[#214C9B]/25 px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#214C9B] focus:ring-2 focus:ring-[#214C9B]/15"
          />
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {request.kind !== "alert" ? (
            <button
              type="button"
              onClick={() => onClose(request.kind === "confirm" ? false : null)}
              className="rounded-xl border border-[#214C9B]/25 px-4 py-2.5 text-xs font-extrabold uppercase text-slate-600 transition hover:bg-slate-50"
            >
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (request.kind === "prompt") {
                const trimmed = promptValue.trim();
                if (!trimmed) return;
                onClose(trimmed);
                return;
              }
              onClose(request.kind === "confirm" ? true : undefined);
            }}
            className="rounded-xl bg-[#981915] px-4 py-2.5 text-xs font-extrabold uppercase text-white transition hover:bg-[#7f1512] disabled:opacity-50"
            disabled={request.kind === "prompt" && !promptValue.trim()}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);

  const close = useCallback((value: boolean | string | null | void) => {
    setRequest((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const alert = useCallback((message: string) => {
    return new Promise<void>((resolve) => {
      setRequest({
        kind: "alert",
        message,
        resolve: () => resolve(),
      });
    });
  }, []);

  const confirm = useCallback(
    (message: string, options?: { confirmLabel?: string; cancelLabel?: string }) => {
      return new Promise<boolean>((resolve) => {
        setRequest({
          kind: "confirm",
          message,
          confirmLabel: options?.confirmLabel,
          cancelLabel: options?.cancelLabel,
          resolve: (value) => resolve(value === true),
        });
      });
    },
    [],
  );

  const prompt = useCallback(
    (
      message: string,
      defaultValue = "",
      options?: { confirmLabel?: string; cancelLabel?: string },
    ) => {
      return new Promise<string | null>((resolve) => {
        setRequest({
          kind: "prompt",
          message,
          defaultValue,
          confirmLabel: options?.confirmLabel ?? "Añadir",
          cancelLabel: options?.cancelLabel,
          resolve: (value) => resolve(typeof value === "string" ? value : null),
        });
      });
    },
    [],
  );

  return (
    <AppDialogContext.Provider value={{ alert, confirm, prompt }}>
      {children}
      {request ? <AppDialogOverlay request={request} onClose={close} /> : null}
    </AppDialogContext.Provider>
  );
}

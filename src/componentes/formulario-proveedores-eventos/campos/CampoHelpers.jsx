import { useFormContext, Controller } from "react-hook-form";

export function Seccion({ id, titulo, children, subtitulo }) {
  return (
    <section id={id} className="mb-10 rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
      <h2 className="font-haas text-xl font-semibold text-neutral-900 mb-1">{titulo}</h2>
      {subtitulo ? (
        <p className="text-sm text-neutral-500 mb-4">{subtitulo}</p>
      ) : (
        <div className="mb-4" />
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-neutral-800 mb-1">
      {children}
      {required ? <span className="text-red-500 ml-0.5">*</span> : null}
    </label>
  );
}

export function CampoTexto({ name, label, required, maxLength, rows, type = "text", placeholder }) {
  const { register } = useFormContext();
  const common =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFF200]";
  return (
    <div>
      <Label required={required}>{label}</Label>
      {rows ? (
        <textarea
          className={common}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          {...register(name)}
        />
      ) : (
        <input
          className={common}
          type={type}
          maxLength={maxLength}
          placeholder={placeholder}
          {...register(name)}
        />
      )}
      {maxLength ? (
        <p className="text-xs text-neutral-400 mt-1">Máx. {maxLength} caracteres</p>
      ) : null}
    </div>
  );
}

export function CampoSelect({ name, label, required, options, placeholder = "Selecciona…" }) {
  const { register } = useFormContext();
  return (
    <div>
      <Label required={required}>{label}</Label>
      <select
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFF200]"
        {...register(name)}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => {
          const value = typeof opt === "string" ? opt : opt.value;
          const text = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export function CampoMulti({ name, label, required, options }) {
  const { control } = useFormContext();
  return (
    <div>
      <Label required={required}>{label}</Label>
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field }) => {
          const value = Array.isArray(field.value) ? field.value : [];
          const toggle = (opt) => {
            if (value.includes(opt)) {
              field.onChange(value.filter((v) => v !== opt));
            } else {
              field.onChange([...value, opt]);
            }
          };
          return (
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => {
                const active = value.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className={`rounded-full px-3 py-1.5 text-xs border transition ${
                      active
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
}

export function CampoSiNo({ name, label, required, triState = false }) {
  const { control } = useFormContext();
  const opciones = triState
    ? [
        { value: "si", label: "Sí" },
        { value: "no", label: "No" },
        { value: "depende", label: "Depende" },
      ]
    : [
        { value: true, label: "Sí" },
        { value: false, label: "No" },
      ];
  return (
    <div>
      <Label required={required}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex gap-2">
            {opciones.map((opt) => {
              const active = field.value === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => field.onChange(opt.value)}
                  className={`rounded-lg px-4 py-2 text-sm border ${
                    active
                      ? "bg-[#FFF200] border-neutral-900 font-medium"
                      : "bg-white border-neutral-300"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      />
    </div>
  );
}

export function CampoArchivo({
  nameFile,
  namePreview,
  label,
  required,
  accept = "image/*",
  hint,
}) {
  const { setValue, watch } = useFormContext();
  const preview = watch(namePreview);
  return (
    <div>
      <Label required={required}>{label}</Label>
      {preview ? (
        <div className="mb-2">
          {String(preview).endsWith(".pdf") || accept.includes("pdf") ? (
            <a
              href={preview}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 underline"
            >
              Ver archivo actual
            </a>
          ) : (
            <img
              src={preview}
              alt=""
              className="h-24 w-24 object-cover rounded-lg border border-neutral-200"
            />
          )}
        </div>
      ) : null}
      <input
        type="file"
        accept={accept}
        className="block w-full text-sm"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          setValue(nameFile, file, { shouldDirty: true });
          if (file && file.type.startsWith("image/")) {
            setValue(namePreview, URL.createObjectURL(file), { shouldDirty: true });
          } else if (file) {
            setValue(namePreview, file.name, { shouldDirty: true });
          }
        }}
      />
      {hint ? <p className="text-xs text-neutral-400 mt-1">{hint}</p> : null}
    </div>
  );
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

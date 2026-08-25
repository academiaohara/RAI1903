import { cn } from "@/lib/utils";

type PreferredFootIconProps = {
  foot: "Derecha" | "Izquierda" | "Ambidiestro";
  size?: number;
  className?: string;
  title?: string;
};

function FootShape({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 36"
      width="100%"
      height="100%"
      className={className}
      aria-hidden
    >
      <path
        d="M12 2c-2.8 0-5 2-5 5.2 0 1.8.7 3.4 1.8 4.6-.9.8-1.8 2-1.8 3.4v2.2c0 1.2.8 2.2 1.9 2.4l1.1 8.8c.2 1.6 1.5 2.8 3.1 2.8h.8c1.6 0 2.9-1.2 3.1-2.8l1.1-8.8c1.1-.2 1.9-1.2 1.9-2.4v-2.2c0-1.4-.9-2.6-1.8-3.4 1.1-1.2 1.8-2.8 1.8-4.6C17 4 14.8 2 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PreferredFootIcon({ foot, size = 18, className, title }: PreferredFootIconProps) {
  const leftActive = foot === "Izquierda" || foot === "Ambidiestro";
  const rightActive = foot === "Derecha" || foot === "Ambidiestro";
  const label =
    title ??
    (foot === "Ambidiestro" ? "Ambidiestro" : foot === "Izquierda" ? "Zurdo" : "Diestro");

  return (
    <span
      className={cn("inline-flex items-end gap-0.5", className)}
      style={{ height: size }}
      title={label}
      aria-label={label}
    >
      <span
        className={cn("inline-block", leftActive ? "text-[#214C9B]" : "text-slate-300")}
        style={{ width: size * 0.42, height: size }}
      >
        <FootShape />
      </span>
      <span
        className={cn("inline-block scale-x-[-1]", rightActive ? "text-[#214C9B]" : "text-slate-300")}
        style={{ width: size * 0.42, height: size }}
      >
        <FootShape />
      </span>
    </span>
  );
}

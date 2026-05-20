function Badge({ children, type = "default" }) {
  const styles = {
    default: "bg-[#F6F1E8] text-[#4B5563] border-[#E8DFD2]",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    dark: "bg-[#1E5B4F] text-white border-[#1E5B4F]",
    soft: "bg-[#FFF4D8] text-[#8A5A00] border-[#F4D28A]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${styles[type]}`}
    >
      {children}
    </span>
  );
}

export default Badge;
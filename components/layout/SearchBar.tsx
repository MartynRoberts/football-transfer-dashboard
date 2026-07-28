interface SearchBarProps {
  mobile?: boolean;
}

export default function SearchBar({ mobile = false }: SearchBarProps) {
  const placeholder = mobile ? "Search" : "Search players, clubs and leagues";
  let formClasses = "border-t border-slate-800";
  if (!mobile) {
    formClasses += " hidden lg:flex";
  }

  return (
    <form
      action="/search"
      className={`${formClasses} ${!mobile ? "min-w-[300px]" : ""}`}
    >
      <input
        type="search"
        name="q"
        placeholder={placeholder}
        className="
            w-full
            rounded-lg
            border
            border-white
            bg-slate-900
            px-3
            py-2
            text-sm
            text-white
            placeholder:text-slate-300
            outline-none
            focus:border-blue-500"
      />
    </form>
  );
}

const Loader = ({ text, size = "md" }) => {
  const dotSize = size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3";

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <div className={`${dotSize} bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]`} />
        <div className={`${dotSize} bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]`} />
        <div className={`${dotSize} bg-blue-600 rounded-full animate-bounce`} />
      </div>
      {text && <p className="text-gray-500 text-sm font-medium">{text}</p>}
    </div>
  );
};

export default Loader;

export const Button = ({ children, type = "button", isLoading, ...props }) => {
    return (
        <button
            type={type}
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            {...props}
        >
            {isLoading ? "Memproses..." : children}
        </button>
    );
};
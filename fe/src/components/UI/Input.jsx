export const Input = ({ label, id, type = "text", required, ...props }) => {
    return (
        <div className="space-y-2 text-left">
            <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                id={id}
                required={required}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-neutral-900 placeholder-neutral-400"
                {...props}
            />
        </div>
    );
};
export const Alert = ({ message }) => {
    if (!message) return null;
    return (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 slide-up text-left">
            <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">Gagal Masuk:</h3>
                    <p className="text-sm text-red-700">{message}</p>
                </div>
            </div>
        </div>
    );
};
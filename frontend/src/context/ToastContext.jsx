import { createContext, useCallback, useContext, useRef, useState } from 'react';

const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const show = useCallback((message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-md px-4 py-3 text-sm text-white shadow-lg ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-brand'
          }`}
        >
          {toast.message}
        </div>
      )}
    </Ctx.Provider>
  );
}

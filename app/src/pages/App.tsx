import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="text-center">
        <h1 className="mb-8 text-6xl font-bold text-white">
          Project Starter
        </h1>
        <p className="mb-8 text-xl text-white/90">
          Modern monorepo template with React, TypeScript, and Capacitor
        </p>
        <div className="rounded-lg bg-white p-8 shadow-2xl">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="rounded-md bg-primary-600 px-6 py-3 text-white transition-colors hover:bg-primary-700 active:bg-primary-800"
          >
            Count is {count}
          </button>
          <p className="mt-4 text-gray-600">
            Edit <code className="rounded bg-gray-100 px-2 py-1">src/pages/App.tsx</code> and save to test HMR
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

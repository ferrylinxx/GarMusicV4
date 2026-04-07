import { Database, Terminal, ExternalLink } from "lucide-react";

export default function DbSetupBanner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      <div className="max-w-xl w-full bg-[#181818] rounded-2xl p-8 border border-[#282828]">
        {/* Icono */}
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Database size={32} className="text-yellow-400" />
        </div>

        <h1 className="text-white text-2xl font-bold mb-2">
          Conecta tu base de datos
        </h1>
        <p className="text-[#b3b3b3] text-sm mb-8">
          GarMusic necesita una base de datos PostgreSQL para funcionar. Sigue uno de estos pasos:
        </p>

        {/* Opción A: Neon */}
        <div className="bg-[#282828] rounded-xl p-5 mb-4 text-left">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-green-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">Recomendado</span>
            <span className="text-white font-semibold">Opción A — Neon (gratis)</span>
          </div>
          <ol className="space-y-2 text-sm text-[#b3b3b3]">
            <li className="flex gap-2">
              <span className="text-green-500 font-bold flex-shrink-0">1.</span>
              <span>
                Ve a{" "}
                <a
                  href="https://neon.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 inline-flex items-center gap-1"
                >
                  neon.tech <ExternalLink size={11} />
                </a>{" "}
                → Crea una cuenta gratis → Nuevo proyecto
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold flex-shrink-0">2.</span>
              <span>Copia tu <strong className="text-white">Connection string</strong> (empieza con <code className="text-yellow-400">postgresql://</code>)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-500 font-bold flex-shrink-0">3.</span>
              <span>Pégala en <code className="text-yellow-400 bg-black/30 px-1 rounded">.env</code> como <code className="text-yellow-400 bg-black/30 px-1 rounded">DATABASE_URL=...</code></span>
            </li>
          </ol>
        </div>

        {/* Opción B: Local */}
        <div className="bg-[#282828] rounded-xl p-5 mb-6 text-left">
          <p className="text-white font-semibold mb-3">Opción B — PostgreSQL local</p>
          <p className="text-[#b3b3b3] text-sm mb-2">
            Instala PostgreSQL y configura en <code className="text-yellow-400">.env</code>:
          </p>
          <code className="block bg-black/40 rounded-lg p-3 text-xs text-green-400 break-all">
            DATABASE_URL=&quot;postgresql://postgres:password@localhost:5432/garmusic&quot;
          </code>
        </div>

        {/* Paso final */}
        <div className="bg-black/40 rounded-xl p-4 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={16} className="text-[#b3b3b3]" />
            <span className="text-white text-sm font-semibold">Paso final: crear las tablas</span>
          </div>
          <p className="text-[#b3b3b3] text-xs mb-2">Ejecuta en la terminal (dentro de <code className="text-yellow-400">garmusic/</code>):</p>
          <code className="block bg-black/60 rounded-lg p-3 text-sm text-green-400">
            npx prisma migrate dev --name init
          </code>
          <p className="text-[#6a6a6a] text-xs mt-2">
            Después recarga esta página → la app estará lista ✓
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Barra de tabs con el mismo lenguaje visual del breadcrumb del sitio:
 * fondo claro, texto pequeno, separadores chevron y el activo en gris oscuro.
 *
 * tabs: [{ id, label }]
 */
const HistoryTabs = ({ tabs, activo, onChange }) => (
    <nav className="w-full border-b border-gray-200 bg-gray-50/70">
        <ul className="flex items-center gap-1 px-1 py-2 overflow-x-auto">
            {tabs.map((tab, index) => {
                const esActivo = tab.id === activo;
                return (
                    <li key={tab.id} className="flex items-center gap-1 flex-shrink-0">
                        {index > 0 && (
                            <span
                                aria-hidden="true"
                                className="icon-[material-symbols--chevron-right-rounded] h-4 w-4 text-gray-400"
                            ></span>
                        )}
                        <button
                            type="button"
                            onClick={() => onChange(tab.id)}
                            aria-current={esActivo ? "page" : undefined}
                            className={`px-2 py-0.5 text-sm rounded transition-colors ${esActivo
                                ? "text-gray-700 font-medium cursor-default"
                                : "text-blue-600 hover:text-blue-800 hover:underline"
                                }`}
                        >
                            {tab.label}
                        </button>
                    </li>
                );
            })}
        </ul>
    </nav>
);

export default HistoryTabs;

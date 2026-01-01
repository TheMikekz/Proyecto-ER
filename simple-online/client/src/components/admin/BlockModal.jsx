const BlockModal = ({ setShowBlockModal, blockForm, setBlockForm, abogados, handleCreateBloqueo }) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-900">Crear Bloqueo</h3>
                    <p className="text-sm text-slate-500 mt-1">Bloquea fechas u horarios no disponibles</p>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                            Tipo de Bloqueo
                        </label>
                        <select
                            value={blockForm.tipo}
                            onChange={(e) => setBlockForm({ ...blockForm, tipo: e.target.value })}
                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none"
                        >
                            <option value="dia_completo">Día completo</option>
                            <option value="horas_especificas">Horas específicas</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                            Abogado <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={blockForm.abogado_id}
                            onChange={(e) => setBlockForm({ ...blockForm, abogado_id: e.target.value })}
                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none"
                        >
                            <option value="">Seleccionar abogado</option>
                            {abogados.map(abogado => (
                                <option key={abogado.id} value={abogado.id}>
                                    {abogado.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                            Fecha <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={blockForm.fecha}
                            onChange={(e) => setBlockForm({ ...blockForm, fecha: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none"
                        />
                    </div>

                    {blockForm.tipo === 'horas_especificas' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-slate-900 font-semibold mb-2 text-sm">
                                    Hora inicio
                                </label>
                                <input
                                    type="time"
                                    value={blockForm.hora_inicio}
                                    onChange={(e) => setBlockForm({ ...blockForm, hora_inicio: e.target.value })}
                                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-900 font-semibold mb-2 text-sm">
                                    Hora fin
                                </label>
                                <input
                                    type="time"
                                    value={blockForm.hora_fin}
                                    onChange={(e) => setBlockForm({ ...blockForm, hora_fin: e.target.value })}
                                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-slate-900 font-semibold mb-2 text-sm">
                            Motivo (opcional)
                        </label>
                        <input
                            type="text"
                            value={blockForm.motivo}
                            onChange={(e) => setBlockForm({ ...blockForm, motivo: e.target.value })}
                            placeholder="Ej: Audiencia en tribunal, vacaciones..."
                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => {
                                setShowBlockModal(false);
                                setBlockForm({ abogado_id: '', fecha: '', hora_inicio: '', hora_fin: '', motivo: '', tipo: 'dia_completo' });
                            }}
                            className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateBloqueo}
                            className="flex-1 px-4 py-3 bg-olive-600 hover:bg-olive-700 text-white rounded-lg font-semibold transition-all"
                        >
                            Crear Bloqueo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlockModal;
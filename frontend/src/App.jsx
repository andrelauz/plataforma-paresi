function ActionDetail({ action, onBack }) {
  const [mod, setMod] = useState(action.modules[0]);
  const [responses, setResponses] = useState({});
  const [wasteEntries, setWasteEntries] = useState([{ type: '', volume: '' }]);
  const [trainingEntries, setTrainingEntries] = useState([{ name: '' }]);
  
  const questions = getModuleQuestions(mod);
  const allMods = [...MODULE_GROUPS.environmental, ...MODULE_GROUPS.social];
  const enabledQs = action.enabledQuestions?.[mod] || {};
  const filteredQuestions = questions.filter(q => enabledQs[q.id]);
  
  const addWasteEntry = () => {
    setWasteEntries([...wasteEntries, { type: '', volume: '' }]);
  };
  
  const updateWasteEntry = (index, field, value) => {
    const updated = [...wasteEntries];
    updated[index][field] = value;
    setWasteEntries(updated);
  };
  
  const removeWasteEntry = (index) => {
    if (wasteEntries.length > 1) {
      setWasteEntries(wasteEntries.filter((_, i) => i !== index));
    }
  };
  
  const addTrainingEntry = () => {
    setTrainingEntries([...trainingEntries, { name: '' }]);
  };
  
  const updateTrainingEntry = (index, value) => {
    const updated = [...trainingEntries];
    updated[index].name = value;
    setTrainingEntries(updated);
  };
  
  const removeTrainingEntry = (index) => {
    if (trainingEntries.length > 1) {
      setTrainingEntries(trainingEntries.filter((_, i) => i !== index));
    }
  };
  
  const handleSave = () => {
    const data = {
      ...responses,
      wasteEntries: mod === 'waste' ? wasteEntries : undefined,
      trainingEntries: mod === 'compliance' ? trainingEntries : undefined
    };
    console.log('Dados salvos:', data);
    alert('Respostas salvas com sucesso!');
  };
  
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-gray-600 hover:text-gray-900">← Voltar</button>
      
      <div className="bg-white rounded-xl p-6 border">
        <h2 className="text-2xl font-bold mb-4">{action.name}</h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {action.modules.map(m => {
            const info = allMods.find(x => x.id === m);
            return (
              <button key={m} onClick={() => setMod(m)} className={`px-4 py-2 rounded-lg ${mod === m ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
                {info?.icon} {info?.name}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma pergunta habilitada para este módulo</p>
          ) : (
            (() => {
              let questionCounter = 0;
              return filteredQuestions.map((q) => {
                if (q.type === 'subtitle') {
                  questionCounter = 0;
                  return (
                    <div key={q.id} className="mt-6 mb-3 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border-l-4 border-emerald-600">
                      <h4 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                        <span>🔹</span>
                        {q.text.replace('🔹 ', '')}
                      </h4>
                      <div className="flex gap-2 mt-1">
                        {q.gri && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">GRI {q.gri}</span>}
                        {q.ods && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">{q.ods}</span>}
                      </div>
                    </div>
                  );
                }
                
                // Lógica condicional para RESÍDUOS (waste module)
                if (mod === 'waste' && (q.id === 'r1' || q.id === 'r2')) {
                  return null; // Estas perguntas são renderizadas na lógica especial abaixo
                }
                
                // Lógica condicional para TREINAMENTOS (compliance module)
                if (mod === 'compliance' && q.id === 'c7') {
                  return null; // Esta pergunta é renderizada na lógica especial abaixo
                }
                
                questionCounter++;
                
                return (
                  <div key={q.id} className="p-4 border rounded-lg">
                    <div className="flex gap-2 mb-2">
                      <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {questionCounter}
                      </span>
                      <p className="font-medium flex-1">{q.text}</p>
                    </div>
                    
                    <div className="flex gap-2 ml-8 mb-2">
                      {q.gri && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">GRI {q.gri}</span>}
                      {q.ods && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{q.ods}</span>}
                      {q.evidence && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">📎 Evidência</span>}
                    </div>
                    
                    {q.placeholder && (
                      <div className="ml-8 mb-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                        <p className="text-xs text-blue-900">
                          <span className="font-semibold">💡 Contexto:</span> {q.placeholder}
                        </p>
                      </div>
                    )}
                    
                    {q.evidence && (
                      <div className="ml-8 mb-2 flex items-center gap-1 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        <span className="font-semibold">📎 Evidência necessária:</span>
                        <span>{q.evidence}</span>
                      </div>
                    )}
                    
                    {q.type === 'scale' ? (
                      <div className="ml-8">
                        <div className="flex gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map(num => (
                            <button
                              key={num}
                              onClick={() => setResponses({...responses, [q.id]: num})}
                              className={`w-12 h-12 rounded-lg border-2 font-bold transition-colors ${
                                responses[q.id] === num 
                                  ? 'bg-emerald-600 text-white border-emerald-600' 
                                  : 'border-gray-300 hover:border-emerald-400'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="font-semibold">Escala:</span> 1=Inexistente | 2=Inicial | 3=Em desenvolvimento | 4=Consolidado | 5=Exemplar
                        </div>
                      </div>
                    ) : q.type === 'radio' ? (
                      <div className="ml-8 space-y-1">
                        {q.options?.map(o => (
                          <label key={o} className="flex items-center gap-2">
                            <input type="radio" name={q.id} className="w-4 h-4" onChange={() => setResponses({...responses, [q.id]: o})} />
                            <span className="text-sm">{o}</span>
                          </label>
                        ))}
                      </div>
                    ) : q.type === 'checkbox' ? (
                      <div className="ml-8 space-y-1">
                        {q.options?.map(o => (
                          <label key={o} className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4" />
                            <span className="text-sm">{o}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={responses[q.id] || ''}
                        onChange={(e) => setResponses({...responses, [q.id]: e.target.value})}
                        placeholder={q.placeholder || 'Digite sua resposta...'}
                        className="w-full ml-8 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        rows={3}
                      />
                    )}
                  </div>
                );
              });
            })()
          )}
          
          {/* LÓGICA CONDICIONAL 1: RESÍDUOS (Waste Module) */}
          {mod === 'waste' && enabledQs['r1'] && enabledQs['r2'] && (
            <div className="p-4 border-2 border-blue-400 rounded-lg bg-blue-50">
              <div className="bg-blue-600 text-white p-3 rounded-lg mb-4">
                <p className="font-bold text-sm">🔄 LÓGICA CONDICIONAL - RESÍDUOS</p>
                <p className="text-xs mt-1">Adicione todos os tipos de resíduos gerados no mês</p>
              </div>
              
              {wasteEntries.map((entry, index) => (
                <div key={index} className="p-4 mb-4 border-2 border-emerald-300 rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-bold text-emerald-800">Resíduo #{index + 1}</h5>
                    {wasteEntries.length > 1 && (
                      <button
                        onClick={() => removeWasteEntry(index)}
                        className="text-red-600 text-sm hover:bg-red-50 px-2 py-1 rounded"
                      >
                        ✕ Remover
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">1. Qual tipo de resíduo foi gerado neste mês?</label>
                      <input
                        type="text"
                        value={entry.type}
                        onChange={(e) => updateWasteEntry(index, 'type', e.target.value)}
                        placeholder="Ex: Papelão, Plástico, Metal, Vidro, Orgânico..."
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">2. Qual o volume desse resíduo foi gerado nesse mês?</label>
                      <input
                        type="text"
                        value={entry.volume}
                        onChange={(e) => updateWasteEntry(index, 'volume', e.target.value)}
                        placeholder="Ex: 10 toneladas, 500 kg..."
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addWasteEntry}
                className="w-full py-3 border-2 border-dashed border-emerald-500 rounded-lg text-emerald-700 font-medium hover:bg-emerald-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                3. Adicionar outro tipo de resíduo
              </button>
            </div>
          )}
          
          {/* LÓGICA CONDICIONAL 2: TREINAMENTOS (Compliance Module) */}
          {mod === 'compliance' && enabledQs['c7'] && (
            <div className="p-4 border-2 border-purple-400 rounded-lg bg-purple-50">
              <div className="bg-purple-600 text-white p-3 rounded-lg mb-4">
                <p className="font-bold text-sm">🔄 LÓGICA CONDICIONAL - TREINAMENTOS</p>
                <p className="text-xs mt-1">Adicione todos os treinamentos ambientais oferecidos</p>
              </div>
              
              {trainingEntries.map((entry, index) => (
                <div key={index} className="p-4 mb-4 border-2 border-purple-300 rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-medium text-purple-800">7. Qual treinamento foi oferecido? #{index + 1}</label>
                    {trainingEntries.length > 1 && (
                      <button
                        onClick={() => removeTrainingEntry(index)}
                        className="text-red-600 text-sm hover:bg-red-50 px-2 py-1 rounded"
                      >
                        ✕ Remover
                      </button>
                    )}
                  </div>
                  <textarea
                    value={entry.name}
                    onChange={(e) => updateTrainingEntry(index, e.target.value)}
                    placeholder="Ex: Workshop de Gestão de Resíduos, Treinamento de Primeiros Socorros Ambientais..."
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                  <p className="text-xs text-gray-600 mt-1 italic">📎 Evidência: Lista de presença e registros fotográficos</p>
                </div>
              ))}
              
              <button
                onClick={addTrainingEntry}
                className="w-full py-3 border-2 border-dashed border-purple-500 rounded-lg text-purple-700 font-medium hover:bg-purple-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                8. Adicionar outro treinamento
              </button>
            </div>
          )}
        </div>

        {filteredQuestions.length > 0 && (
          <button onClick={handleSave} className="w-full bg-emerald-600 text-white py-3 rounded-lg mt-6 hover:bg-emerald-700">
            Salvar Respostas
          </button>
        )}
      </div>
    </div>
  );
}

function PublicForm({ formData, onBack }) {
  const [responses, setResponses] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  
  const { module, config, action } = formData;
  
  // Debug: mostrar informações no console
  console.log('=== PUBLIC FORM DEBUG ===');
  console.log('Módulo:', module);
  console.log('Config:', config);
  console.log('Action:', action);
  console.log('enabledQuestions para este módulo:', action.enabledQuestions?.[module.id]);
  
  // Buscar todas as perguntas do módulo
  const allQuestions = getModuleQuestions(module.id);
  console.log('Total de perguntas disponíveis:', allQuestions.length);
  
  // Filtrar apenas as perguntas habilitadas (excluindo subtítulos)
  const questions = allQuestions.filter(q => {
    const isEnabled = action.enabledQuestions?.[module.id]?.[q.id] === true;
    const isNotSubtitle = q.type !== 'subtitle';
    return isEnabled && isNotSubtitle;
  });
  
  console.log('Perguntas habilitadas filtradas:', questions.length);
  console.log('IDs das perguntas:', questions.map(q => q.id));
  console.log('======================');
  
  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);
  const progress = questions.length > 0 ? ((Object.keys(responses).length / questions.length) * 100).toFixed(0) : 0;
  
  const handleSubmit = () => {
    if (Object.keys(responses).length < questions.length) {
      alert(`Por favor, responda todas as perguntas antes de enviar. (${Object.keys(responses).length}/${questions.length} respondidas)`);
      return;
    }
    console.log('Respostas enviadas:', responses);
    setSubmitted(true);
  };
  
  const saveDraft = () => {
    console.log('Rascunho salvo:', responses);
    alert(`Rascunho salvo! ${Object.keys(responses).length} respostas salvas. Você pode voltar depois para continuar.`);
  };
  
  // Se não houver perguntas, mostrar mensagem de erro
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Ops! Nenhuma pergunta encontrada</h2>
          <p className="text-gray-600 mb-6 text-center">
            Este formulário ainda não tem perguntas habilitadas. Entre em contato com o administrador.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900 font-semibold mb-2">📋 Informações de Debug:</p>
            <div className="text-xs text-blue-800 font-mono space-y-1">
              <p><strong>Módulo:</strong> {module.name} ({module.id})</p>
              <p><strong>Ação ID:</strong> {action.id}</p>
              <p><strong>Ação Nome:</strong> {action.name}</p>
              <p><strong>Total de perguntas no módulo:</strong> {allQuestions.length}</p>
              <p><strong>Perguntas habilitadas:</strong> {Object.keys(action.enabledQuestions?.[module.id] || {}).length}</p>
              <p><strong>Perguntas com valor true:</strong> {Object.values(action.enabledQuestions?.[module.id] || {}).filter(v => v === true).length}</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-900 font-semibold mb-2">💡 Possível Solução:</p>
            <p className="text-xs text-yellow-800">
              No painel de administração, ao criar/editar a ação, vá até o <strong>Passo 3 "Configurar Perguntas"</strong> e certifique-se de marcar as perguntas que deseja incluir no formulário.
            </p>
          </div>
          
          <button onClick={onBack} className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium">
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }
  
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckSquare className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Obrigado!</h2>
          <p className="text-gray-600 mb-6">
            Sua resposta foi enviada com sucesso. Agradecemos sua participação!
          </p>
          {config.allowEdit && (
            <p className="text-sm text-blue-600 mb-4">
              💡 Você pode editar suas respostas acessando o link novamente
            </p>
          )}
          <button onClick={onBack} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
            Fechar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Leaf className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paresi Platform</h1>
              <p className="text-gray-600">Pesquisa de {module.name}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900 font-medium mb-1">{action.name}</p>
            <p className="text-xs text-blue-700">{action.goal}</p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>⏱️ Tempo estimado: {Math.ceil(questions.length / 2)} minutos</span>
            {config.anonymous && <span className="text-emerald-600">🔒 Respostas anônimas</span>}
          </div>
          
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Progresso</span>
              <span className="text-gray-900 font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-emerald-600 rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Página {currentPage + 1} de {totalPages}
          </p>
        </div>
        
        {/* Questions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          {currentQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhuma pergunta nesta página</p>
              <p className="text-sm text-gray-400">Total de perguntas: {questions.length}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentQuestions.map((q, idx) => {
                const questionNumber = currentPage * questionsPerPage + idx + 1;
                
                return (
                  <div key={q.id} className="pb-6 border-b last:border-b-0">
                    <div className="flex gap-3 mb-3">
                      <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {questionNumber}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{q.text}</p>
                        {q.placeholder && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-3 rounded">
                            <p className="text-sm text-blue-900">
                              <span className="font-semibold">💡 Dica:</span> {q.placeholder}
                            </p>
                          </div>
                        )}
                        
                        {q.type === 'scale' ? (
                          <div>
                            <div className="flex gap-2 mb-2">
                              {[1, 2, 3, 4, 5].map(num => (
                                <button
                                  key={num}
                                  onClick={() => setResponses({...responses, [q.id]: num})}
                                  className={`w-14 h-14 rounded-lg border-2 font-bold transition-colors ${
                                    responses[q.id] === num 
                                      ? 'bg-emerald-600 text-white border-emerald-600' 
                                      : 'border-gray-300 hover:border-emerald-400'
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">1=Inexistente | 2=Inicial | 3=Em desenvolvimento | 4=Consolidado | 5=Exemplar</p>
                          </div>
                        ) : q.type === 'radio' ? (
                          <div className="space-y-2">
                            {q.options?.map(o => (
                              <label key={o} className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input 
                                  type="radio" 
                                  name={q.id} 
                                  checked={responses[q.id] === o}
                                  onChange={() => setResponses({...responses, [q.id]: o})}
                                  className="w-5 h-5"
                                />
                                <span className="text-sm">{o}</span>
                              </label>
                            ))}
                          </div>
                        ) : q.type === 'checkbox' ? (
                          <div className="space-y-2">
                            {q.options?.map(o => (
                              <label key={o} className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={responses[q.id]?.includes(o) || false}
                                  onChange={(e) => {
                                    const current = responses[q.id] || [];
                                    if (e.target.checked) {
                                      setResponses({...responses, [q.id]: [...current, o]});
                                    } else {
                                      setResponses({...responses, [q.id]: current.filter(item => item !== o)});
                                    }
                                  }}
                                  className="w-5 h-5"
                                />
                                <span className="text-sm">{o}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            value={responses[q.id] || ''}
                            onChange={(e) => setResponses({...responses, [q.id]: e.target.value})}
                            placeholder={q.placeholder ? `Ex: ${q.placeholder.substring(0, 100)}...` : "Digite sua resposta..."}
                            className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            rows={4}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            
            {config.allowDraft !== false && (
              <button 
                onClick={saveDraft}
                className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
              >
                💾 Salvar Rascunho
              </button>
            )}
            
            {currentPage < totalPages - 1 ? (
              <button 
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Próxima →
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                ✓ Enviar Respostas
              </button>
            )}
          </div>
        </div>
        
        <div className="text-center mt-6">
          <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-900">
            Voltar ao Painel
          </button>
        </div>
      </div>
    </div>
  );
}

function Scorecard({ action, onBack, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showGoals, setShowGoals] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  
  const allMods = [...MODULE_GROUPS.environmental, ...MODULE_GROUPS.social];
  const envModules = ['water', 'energy', 'waste', 'biodiversity', 'pollutants', 'compliance'];
  const socialModules = ['demographics', 'living_wage', 'diversity', 'mental_health', 'community'];
  
  const calculateScore = () => {
    const envScore = action.modules?.filter(m => envModules.includes(m)).length * 16.67;
    const socialScore = action.modules?.filter(m => socialModules.includes(m)).length * 20;
    const overall = (envScore + socialScore) / 2;
    const compliance = 85;
    
    return { 
      overall: Math.min(overall, 100), 
      environmental: Math.min(envScore, 100), 
      social: Math.min(socialScore, 100),
      compliance 
    };
  };
  
  const scores = calculateScore();
  
  const getScoreLabel = (score) => {
    if (score >= 90) return { text: 'Excelente', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 80) return { text: 'Bom', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 60) return { text: 'Em Desenvolvimento', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 40) return { text: 'Atenção', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: 'Crítico', color: 'text-red-600', bg: 'bg-red-100' };
  };
  
  const label = getScoreLabel(scores.overall);
  
  const moduleKPIs = {
    water: [
      { name: 'Eficiência Hídrica', value: '2.5 m³/ton', trend: 'down', good: true },
      { name: 'Água Reusada', value: '35%', trend: 'up', good: true },
      { name: 'Efluentes Tratados', value: '100%', trend: 'stable', good: true },
      { name: 'Conformidade DBO', value: 'Conforme', trend: 'stable', good: true }
    ],
    energy: [
      { name: 'Intensidade Energética', value: '0.8 MWh/ton', trend: 'down', good: true },
      { name: 'Energia Renovável', value: '45%', trend: 'up', good: true },
      { name: 'Emissões CO₂', value: '12 tCO₂e', trend: 'down', good: true },
      { name: 'Eficiência da Frota', value: '8 km/L', trend: 'up', good: true }
    ],
    waste: [
      { name: 'Taxa de Reciclagem', value: '78%', trend: 'up', good: true },
      { name: 'Resíduos/Produção', value: '0.15 kg/un', trend: 'down', good: true },
      { name: 'Destinação Adequada', value: '95%', trend: 'up', good: true },
      { name: 'Matéria-prima Reciclada', value: '22%', trend: 'up', good: true }
    ],
    diversity: [
      { name: 'Índice de Diversidade', value: '72/100', trend: 'up', good: true },
      { name: 'Mulheres em Liderança', value: '38%', trend: 'up', good: true },
      { name: 'PcD Contratadas', value: '5.2%', trend: 'stable', good: true },
      { name: 'Diversidade Étnico-racial', value: '45%', trend: 'up', good: true }
    ],
    mental_health: [
      { name: 'Score Saúde Mental', value: '78/100', trend: 'up', good: true },
      { name: 'Participação em Programas', value: '65%', trend: 'up', good: true },
      { name: 'Líderes Treinados', value: '85%', trend: 'up', good: true },
      { name: 'Satisfação Colaboradores', value: '4.2/5', trend: 'up', good: true }
    ],
    community: [
      { name: 'Empregos Locais', value: '120', trend: 'up', good: true },
      { name: 'Fornecedores Locais', value: '62%', trend: 'up', good: true },
      { name: 'Investimento Comunitário', value: 'R$ 45k', trend: 'up', good: true },
      { name: 'Beneficiários Diretos', value: '350', trend: 'up', good: true }
    ]
  };
  
  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };
  
  const getTrendColor = (trend, good) => {
    if (trend === 'stable') return 'text-gray-600';
    if ((trend === 'up' && good) || (trend === 'down' && !good)) return 'text-emerald-600';
    return 'text-red-600';
  };
  
  const exportPDF = () => {
    alert('Funcionalidade de exportar PDF será implementada em breve!');
  };
  
  const copyToClipboard = (text, moduleId) => {
    // Tentar usar a API moderna primeiro
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedLink(moduleId);
          setTimeout(() => setCopiedLink(null), 2000);
        })
        .catch(() => {
          // Fallback para método antigo
          fallbackCopy(text, moduleId);
        });
    } else {
      // Fallback para método antigo
      fallbackCopy(text, moduleId);
    }
  };
  
  const fallbackCopy = (text, moduleId) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedLink(moduleId);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      alert('Não foi possível copiar. Link: ' + text);
    }
    document.body.removeChild(textArea);
  };
  
  const generateQRCode = (link) => {
    alert(`QR Code para: ${link}\n\nFuncionalidade será implementada em breve!`);
  };
  
  const getFrequencyLabel = (freq) => {
    const labels = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      yearly: 'Anual'
    };
    return labels[freq] || freq;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
          ← Voltar ao Dashboard
        </button>
        <button onClick={exportPDF} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>
      
      {/* Hero Section - Score Geral */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Scorecard da Ação</p>
            <h2 className="text-3xl font-bold mb-2">{action.name}</h2>
            <p className="text-blue-100 text-sm">{action.goal}</p>
          </div>
          <div className={`px-4 py-2 rounded-full ${label.bg} ${label.color} font-bold text-sm`}>
            {label.text}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <p className="text-blue-100 text-xs mb-2">Score Geral</p>
            <p className="text-5xl font-bold mb-2">{scores.overall.toFixed(0)}</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2" style={{ width: `${scores.overall}%` }} />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <p className="text-blue-100 text-xs mb-2 flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Ambiental
            </p>
            <p className="text-4xl font-bold mb-2">{scores.environmental.toFixed(0)}</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-emerald-300 rounded-full h-2" style={{ width: `${scores.environmental}%` }} />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <p className="text-blue-100 text-xs mb-2 flex items-center gap-1">
              <Users className="w-3 h-3" /> Social
            </p>
            <p className="text-4xl font-bold mb-2">{scores.social.toFixed(0)}</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-blue-300 rounded-full h-2" style={{ width: `${scores.social}%` }} />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <p className="text-blue-100 text-xs mb-2 flex items-center gap-1">
              <CheckSquare className="w-3 h-3" /> Conformidade
            </p>
            <p className="text-4xl font-bold mb-2">{scores.compliance}</p>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-yellow-300 rounded-full h-2" style={{ width: `${scores.compliance}%` }} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex border-b overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('modules')}
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'modules' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Indicadores por Módulo
          </button>
          <button 
            onClick={() => setActiveTab('collection')}
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'collection' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Coleta de Dados
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'alerts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Alertas & Recomendações
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Breakdown de Performance</h3>
                  <button 
                    onClick={() => setShowGoals(!showGoals)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    {showGoals ? 'Ocultar' : 'Configurar'} Metas
                  </button>
                </div>
                
                {showGoals && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-3">⚙️ Metas Personalizadas</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Meta Ambiental (%)</label>
                        <input type="number" defaultValue="85" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Meta Social (%)</label>
                        <input type="number" defaultValue="80" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Meta Conformidade (%)</label>
                        <input type="number" defaultValue="95" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </div>
                    </div>
                    <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                      Salvar Metas
                    </button>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Ambiental */}
                  <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                          <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">Ambiental</p>
                          <p className="text-xs text-emerald-600">6 módulos ativos</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-emerald-700 mb-2">{scores.environmental.toFixed(0)}</p>
                    <div className="space-y-1 text-xs">
                      {action.modules?.filter(m => envModules.includes(m)).map(m => {
                        const mod = allMods.find(x => x.id === m);
                        return (
                          <div key={m} className="flex items-center gap-2">
                            <span>{mod?.icon}</span>
                            <span className="text-emerald-800">{mod?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Social */}
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Social</p>
                          <p className="text-xs text-blue-600">5 módulos ativos</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-blue-700 mb-2">{scores.social.toFixed(0)}</p>
                    <div className="space-y-1 text-xs">
                      {action.modules?.filter(m => socialModules.includes(m)).map(m => {
                        const mod = allMods.find(x => x.id === m);
                        return (
                          <div key={m} className="flex items-center gap-2">
                            <span>{mod?.icon}</span>
                            <span className="text-blue-800">{mod?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Conformidade */}
                  <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                          <CheckSquare className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-yellow-700 font-medium">Conformidade</p>
                          <p className="text-xs text-yellow-600">Status legal</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-yellow-700 mb-2">{scores.compliance}</p>
                    <div className="space-y-1 text-xs text-yellow-800">
                      <p>✓ 0 não conformidades</p>
                      <p>✓ 0 multas pendentes</p>
                      <p>✓ Auditorias em dia</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Informações da Ação */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Público-Alvo</p>
                  <p className="font-medium">{action.target_audience || 'Não especificado'}</p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Duração</p>
                  <p className="font-medium">{action.duration || 'Não especificado'}</p>
                </div>
                <div className="bg-white border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Investimento</p>
                  <p className="font-medium text-emerald-600">R$ {(action.investment || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'modules' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold mb-4">Indicadores-Chave por Módulo</h3>
              
              {action.modules?.map(moduleId => {
                const mod = allMods.find(x => x.id === moduleId);
                const kpis = moduleKPIs[moduleId] || [];
                
                return (
                  <div key={moduleId} className="border rounded-xl p-6 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{mod?.icon}</span>
                      <div>
                        <h4 className="text-lg font-bold">{mod?.name}</h4>
                        <p className="text-xs text-gray-600">{kpis.length} indicadores principais</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {kpis.map((kpi, idx) => (
                        <div key={idx} className="bg-white border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-xs text-gray-600 font-medium">{kpi.name}</p>
                            <span className={`text-lg ${getTrendColor(kpi.trend, kpi.good)}`}>
                              {getTrendIcon(kpi.trend)}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-emerald-600 rounded-full h-1.5" style={{ width: '75%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {kpis.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">Nenhum dado registrado ainda para este módulo</p>
                        <p className="text-xs mt-1">Preencha o formulário para visualizar os indicadores</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {activeTab === 'collection' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Gestão de Coleta de Dados</h3>
                  <p className="text-sm text-gray-600">Gerencie formulários e preenchimentos</p>
                </div>
              </div>
              
              {/* Formulários Individuais */}
              {action.modules?.filter(m => action.collectionConfig?.[m]?.type === 'individual').length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    📊 Formulários Individuais
                    <span className="text-sm font-normal text-gray-600">
                      ({action.modules.filter(m => action.collectionConfig?.[m]?.type === 'individual').length})
                    </span>
                  </h4>
                  
                  <div className="space-y-4">
                    {action.modules.filter(m => action.collectionConfig?.[m]?.type === 'individual').map(moduleId => {
                      const modInfo = allMods.find(x => x.id === moduleId);
                      const config = action.collectionConfig[moduleId];
                      const link = `paresi.app/f/${action.id}/${moduleId}/${Math.random().toString(36).substring(2, 8)}`;
                      const responses = Math.floor(Math.random() * (config.targetResponses || 100));
                      const progress = ((responses / (config.targetResponses || 100)) * 100).toFixed(0);
                      
                      return (
                        <div key={moduleId} className="border-2 border-blue-200 rounded-xl p-5 bg-gradient-to-r from-blue-50 to-white">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{modInfo?.icon}</span>
                              <div>
                                <h5 className="font-bold text-lg">{modInfo?.name}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✓ Ativo</span>
                                  {config.anonymous && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">Anônimo</span>}
                                  {config.allowEdit && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Editável</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 mb-4 border">
                            <p className="text-xs text-gray-600 mb-2">Link do Formulário:</p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                              <p className="text-xs text-yellow-900">
                                <strong>⚠️ Atenção:</strong> Este é um link simulado para demonstração. Em produção, este seria um link real acessível externamente. 
                                Use o botão <strong>👁️ Preview</strong> abaixo para visualizar o formulário.
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <input 
                                  id={`link-${moduleId}`}
                                  type="text" 
                                  value={link} 
                                  readOnly 
                                  onClick={(e) => e.target.select()}
                                  className="w-full px-3 py-2 bg-gray-50 border rounded-lg text-sm font-mono cursor-pointer hover:bg-gray-100"
                                />
                              </div>
                              <button 
                                onClick={() => copyToClipboard(link, moduleId)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                                  copiedLink === moduleId 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                              >
                                {copiedLink === moduleId ? (
                                  <>
                                    <CheckSquare className="w-4 h-4" />
                                    Copiado!
                                  </>
                                ) : (
                                  <>
                                    📋 Copiar
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => {
                                  const input = document.getElementById(`link-${moduleId}`);
                                  input.select();
                                  document.execCommand('copy');
                                  setCopiedLink(moduleId);
                                  setTimeout(() => setCopiedLink(null), 2000);
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                                title="Copiar (alternativo)"
                              >
                                📄
                              </button>
                              <button 
                                onClick={() => generateQRCode(link)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                              >
                                📱 QR
                              </button>
                              <button 
                                onClick={() => onNavigate('public-form', { link, module: modInfo, config, action })}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center gap-1"
                              >
                                👁️ Preview
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              💡 Dica: Use o botão <strong>Preview</strong> para visualizar como o formulário aparecerá para os respondentes
                            </p>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-700 font-medium">📈 Status da Coleta</span>
                              <span className="text-gray-900 font-bold">{responses}/{config.targetResponses || 100} respostas ({progress}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full h-3 transition-all" 
                                style={{ width: `${progress}%` }} 
                              />
                            </div>
                            <p className="text-xs text-gray-600 mt-2">Última resposta: há 2 horas</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm">
                              Ver Todas as Respostas ({responses})
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                              📊 Exportar
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                              ⚙️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Coleta Interna */}
              {action.modules?.filter(m => action.collectionConfig?.[m]?.type === 'internal').length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    🏢 Coleta Interna
                    <span className="text-sm font-normal text-gray-600">
                      ({action.modules.filter(m => action.collectionConfig?.[m]?.type === 'internal').length})
                    </span>
                  </h4>
                  
                  <div className="space-y-4">
                    {action.modules.filter(m => action.collectionConfig?.[m]?.type === 'internal').map(moduleId => {
                      const modInfo = allMods.find(x => x.id === moduleId);
                      const config = action.collectionConfig[moduleId];
                      const daysUntilDue = Math.floor(Math.random() * 15);
                      const isPending = daysUntilDue <= 5;
                      const lastUpdate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
                      
                      return (
                        <div key={moduleId} className="border-2 border-purple-200 rounded-xl p-5 bg-gradient-to-r from-purple-50 to-white">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{modInfo?.icon}</span>
                              <div>
                                <h5 className="font-bold text-lg">{modInfo?.name}</h5>
                                <p className="text-sm text-gray-600">
                                  Responsável: <span className="font-medium text-gray-900">{config.responsible || 'Não definido'}</span>
                                </p>
                              </div>
                            </div>
                            {isPending && (
                              <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                ⚠️ Vence em {daysUntilDue} dias
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-3 border">
                              <p className="text-xs text-gray-600 mb-1">Frequência</p>
                              <p className="font-bold text-gray-900">{getFrequencyLabel(config.frequency)}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border">
                              <p className="text-xs text-gray-600 mb-1">Última Atualização</p>
                              <p className="font-bold text-gray-900">{lastUpdate}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border">
                              <p className="text-xs text-gray-600 mb-1">Próximo Prazo</p>
                              <p className="font-bold text-gray-900">{daysUntilDue} dias</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-4 text-sm">
                            {config.reminder && <span className="flex items-center gap-1 text-blue-700"><span>🔔</span> Lembretes ativos</span>}
                            {config.allowDraft && <span className="flex items-center gap-1 text-purple-700"><span>💾</span> Rascunho disponível</span>}
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                              ✏️ Preencher Dados
                            </button>
                            <button className="px-4 py-2 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium">
                              📊 Ver Histórico
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                              ⚙️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {action.modules?.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>Nenhum módulo configurado para coleta de dados</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">Alertas e Não Conformidades</h3>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckSquare className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="font-medium text-emerald-900">Tudo em conformidade!</p>
                  <p className="text-sm text-emerald-700 mt-1">Não há alertas ou pendências no momento</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Recomendações de Melhoria</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">💡</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 mb-1">Aumentar uso de energia renovável</p>
                        <p className="text-sm text-blue-700">Sua empresa utiliza 45% de energia renovável. Considere aumentar para 60% para melhorar o score ambiental.</p>
                        <p className="text-xs text-blue-600 mt-2">Impacto estimado: +8 pontos no score ambiental</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">📊</span>
                      </div>
                      <div>
                        <p className="font-medium text-purple-900 mb-1">Expandir programas de diversidade</p>
                        <p className="text-sm text-purple-700">Aumentar a representatividade em cargos de liderança pode elevar o índice de diversidade.</p>
                        <p className="text-xs text-purple-600 mt-2">Impacto estimado: +5 pontos no score social</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">♻️</span>
                      </div>
                      <div>
                        <p className="font-medium text-amber-900 mb-1">Otimizar gestão de resíduos</p>
                        <p className="text-sm text-amber-700">Com 78% de taxa de reciclagem, você está próximo da excelência. Busque atingir 85% para conquistar a certificação.</p>
                        <p className="text-xs text-amber-600 mt-2">Impacto estimado: +3 pontos no score ambiental</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-4">Próximas Ações Sugeridas</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                    <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Realizar auditoria de eficiência energética</p>
                      <p className="text-xs text-gray-600">Prazo sugerido: 30 dias</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                    <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Implementar programa de compostagem</p>
                      <p className="text-xs text-gray-600">Prazo sugerido: 60 dias</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-md transition-shadow">
                    <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Criar comitê de diversidade e inclusão</p>
                      <p className="text-xs text-gray-600">Prazo sugerido: 45 dias</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Gráfico Radial - Visão Dimensional */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h3 className="text-xl font-bold mb-6">Radar de Performance</h3>
        <div className="flex items-center justify-center py-8">
          <div className="relative w-full max-w-md aspect-square">
            <svg viewBox="0 0 240 240" className="w-full h-full">
              {/* Grid de fundo */}
              <circle cx="120" cy="120" r="90" fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
              <circle cx="120" cy="120" r="70" fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
              <circle cx="120" cy="120" r="50" fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
              <circle cx="120" cy="120" r="30" fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
              
              {/* Eixos (6 dimensões) */}
              <line x1="120" y1="120" x2="120" y2="30" stroke="#d1d5db" strokeWidth="1.5" />
              <line x1="120" y1="120" x2="197.9" y2="67.5" stroke="#d1d5db" strokeWidth="1.5" />
              <line x1="120" y1="120" x2="197.9" y2="172.5" stroke="#d1d5db" strokeWidth="1.5" />
              <line x1="120" y1="120" x2="120" y2="210" stroke="#d1d5db" strokeWidth="1.5" />
              <line x1="120" y1="120" x2="42.1" y2="172.5" stroke="#d1d5db" strokeWidth="1.5" />
              <line x1="120" y1="120" x2="42.1" y2="67.5" stroke="#d1d5db" strokeWidth="1.5" />
              
              {/* Polígono de dados (valores simulados: 80-95%) */}
              <polygon
                points="120,39 189,72 189,168 120,192 51,168 51,72"
                fill="rgba(16, 185, 129, 0.25)"
                stroke="rgb(16, 185, 129)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              
              {/* Pontos nos vértices */}
              <circle cx="120" cy="39" r="4" fill="rgb(16, 185, 129)" />
              <circle cx="189" cy="72" r="4" fill="rgb(16, 185, 129)" />
              <circle cx="189" cy="168" r="4" fill="rgb(16, 185, 129)" />
              <circle cx="120" cy="192" r="4" fill="rgb(16, 185, 129)" />
              <circle cx="51" cy="168" r="4" fill="rgb(16, 185, 129)" />
              <circle cx="51" cy="72" r="4" fill="rgb(16, 185, 129)" />
              
              {/* Labels das dimensões */}
              <text x="120" y="22" textAnchor="middle" className="text-xs font-semibold fill-gray-700">Água</text>
              <text x="210" y="75" textAnchor="start" className="text-xs font-semibold fill-gray-700">Energia</text>
              <text x="210" y="178" textAnchor="start" className="text-xs font-semibold fill-gray-700">Resíduos</text>
              <text x="120" y="230" textAnchor="middle" className="text-xs font-semibold fill-gray-700">Social</text>
              <text x="30" y="178" textAnchor="end" className="text-xs font-semibold fill-gray-700">Diversidade</text>
              <text x="30" y="75" textAnchor="end" className="text-xs font-semibold fill-gray-700">Comunidade</text>
            </svg>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Visualização equilibrada das principais dimensões da ação
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-xs text-gray-600">Performance Atual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
            <span className="text-xs text-gray-600">Meta (100%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}import React, { useState, useEffect } from 'react';
import { Leaf, Users, DollarSign, Target, Plus, Eye, LogOut, Settings, CheckSquare, Square, FileText } from 'lucide-react';

const MODULE_GROUPS = {
  environmental: [
    { id: 'water', name: 'Gestão de Recursos Hídricos', icon: '💧', questions: 7 },
    { id: 'energy', name: 'Energia e Emissões Atmosféricas', icon: '⚡', questions: 19 },
    { id: 'waste', name: 'Gestão de Resíduos', icon: '♻️', questions: 10 },
    { id: 'biodiversity', name: 'Biodiversidade', icon: '🌿', questions: 4 },
    { id: 'pollutants', name: 'Poluentes', icon: '🏭', questions: 5 },
    { id: 'compliance', name: 'Conformidade', icon: '📋', questions: 11 }
  ],
  social: [
    { id: 'demographics', name: 'Dados Sociodemográficos', icon: '👥', questions: 17 },
    { id: 'living_wage', name: 'Salário Digno', icon: '💰', questions: 9 },
    { id: 'diversity', name: 'Diversidade', icon: '🌈', questions: 24 },
    { id: 'mental_health', name: 'Saúde Mental', icon: '🧠', questions: 18 },
    { id: 'community', name: 'Envolvimento Comunitário', icon: '🤝', questions: 11 }
  ]
};

const getModuleQuestions = (moduleId) => {
  const questions = {
    water: [
      { id: 'w1', text: 'Qual foi o consumo total de água (em m³) no mês de referência?', placeholder: 'É o volume total de água (da companhia de saneamento, poço ou outra fonte) que a empresa utilizou em todas as suas atividades no mês. É o ponto de partida para calcular a economia.', gri: '303-5', ods: 'ODS 6.3, 6.4, 12.2, 2.4, 14.1, 15.1', evidence: 'Conta de água ou medição interna' },
      { id: 'w2', text: 'Qual foi o volume de água de reuso (em m³) no mês de referência?', placeholder: 'É a quantidade de água que, após ser usada e tratada internamente, é usada novamente para fins não potáveis (como limpeza de pátio, irrigação ou descargas). Este dado mostra o esforço da empresa em reduzir a captação de água nova.', gri: '303-3', ods: 'ODS 6.3, 6.4, 12.2, 2.4, 14.1, 15.1' },
      { id: 'w3', text: 'Qual foi a produção total (toneladas, peças, etc.) no mês de referência?', placeholder: 'É o volume de produção da empresa no mês. Ele é essencial para calcular a Eficiência Hídrica: quanto de água foi gasto para produzir cada unidade ou tonelada. (Ex: 10m3 de água por tonelada de produto).', gri: '303-5', ods: 'ODS 6.3, 6.4, 12.2, 2.4, 14.1, 15.1' },
      { id: 'w4', text: 'Qual foi o volume total de efluentes gerados (m³) no mês de referência?', placeholder: 'É a quantidade total de esgoto industrial e sanitário gerada pela empresa. Este volume deve ser rastreado para garantir que todo efluente gerado receba o tratamento correto.', gri: '303-4', ods: 'ODS 6.3, 6.4, 12.2, 2.4, 14.1, 15.1', evidence: 'Relatórios da ETE' },
      { id: 'w5', text: 'Qual foi o volume total de efluentes tratados (m³) no mês de referência?', placeholder: 'É a quantidade total de esgoto industrial e sanitário que foi processada e tratada no sistema da empresa (ETE). Este volume deve ser rastreado para garantir que todo efluente gerado receba o tratamento correto.', gri: '303-4', ods: 'ODS 6.3, 6.4, 12.2, 2.4, 14.1, 15.1', evidence: 'Relatórios da ETE' },
      { id: 'w6', text: 'Quais ações ou tecnologias foram utilizadas no tratamento de efluentes neste mês?', placeholder: 'Descreva o método ou o processo utilizado para "limpar" o efluente (ex: filtros, produtos químicos, membranas). Informar o funcionamento da ETE garante a conformidade contínua.', gri: '303-2', ods: 'ODS 6.3, 6.4, 12.2, 2.4, 14.1, 15.1', evidence: 'Relatório de operação da ETE, laudos técnicos' },
      { id: 'w7', text: 'O efluente tratado neste mês atendeu a quais parâmetros legais (DBO, DQO, pH, etc.)?', placeholder: 'Confirmação de que a água devolvida ao meio ambiente ou à rede pública está "limpa" o suficiente e cumpre todas as exigências da lei (que são medidas por parâmetros como o nível de oxigênio necessário – DBO ou outro parâmetro exigido pela lei).', gri: '303-4', ods: 'ODS 6.3, 6.4, 12.2, 2.4, 14.1, 15.1', evidence: 'Laudos de análises laboratoriais' }
    ],
    energy: [
      { id: 'e1', text: 'Qual foi o consumo total de energia elétrica da rede (MWh) no mês de referência?', placeholder: 'O quanto de eletricidade a empresa consumiu da rede (da concessionária ou via Geração Distribuída). Este dado é a base para o cálculo de emissões indiretas (Inventário do Escopo 2).', gri: '302-1', ods: 'ODS 7.3, ODS 12.2', evidence: 'Conta de energia elétrica, medição interna' },
      { id: 'e2', text: 'Volume de eletricidade proveniente da Concessionária (Rede Principal) – em MWh', placeholder: 'É a energia elétrica que sua empresa recebe diretamente da rede de distribuição local (Ex: Copel, CEMIG, etc.). Esta energia utiliza o Fator Médio da Rede (Fator SIN).', gri: '302-1, 305-2', ods: 'ODS 7.3, ODS 12.2', evidence: 'Conta de energia elétrica (parte que não é de GD)' },
      { id: 'e3', text: 'Volume de eletricidade proveniente de Geração Distribuída (GD) – em MWh', placeholder: 'É a energia gerada por fontes limpas (como solar ou eólica) em locais remotos, que é injetada na rede e gera créditos para sua empresa.', gri: '302-1, 302-3, 305-2', ods: 'ODS 7.3, ODS 12.2', evidence: 'Fatura da concessionária indicando a compensação de créditos de GD' },
      { id: 'e4', text: 'Volume de energia gerada pela própria empresa (Autogeração no local) – em MWh', placeholder: 'É a energia produzida dentro dos limites da sua propriedade (Ex: Painéis solares no telhado, gerador a biogás).', gri: '302-1, 302-3, 305-2', ods: 'ODS 7.3, ODS 12.2', evidence: 'Relatórios de medição interna da geração' },
      { id: 'e5', text: 'Qual foi o consumo de energia de fontes renováveis (MWh) no mês de referência?', placeholder: 'O quanto de energia foi gerado ou comprado de fontes limpas (solar, eólica, biogás). Este valor indica o seu esforço para usar fontes de baixa emissão.', gri: '302-1, 302-3', ods: 'ODS 7.2', evidence: 'Contrato/nota fiscal de fornecedor de energia renovável, relatórios internos de geração (ex.: solar)' },
      { id: 'e6', text: 'Diesel (litros)', placeholder: 'O volume de diesel usado na frota, geradores ou máquinas.', gri: '302-1, 305-1', ods: 'ODS 12, ODS 13.2', evidence: 'Notas fiscais, relatórios de abastecimento' },
      { id: 'e7', text: 'Gás natural (m³)', placeholder: 'O volume de gás natural consumido (usado em caldeiras ou fornos).', gri: '302-1, 305-1', ods: 'ODS 12, ODS 13.2', evidence: 'Notas fiscais, relatórios de abastecimento' },
      { id: 'e8', text: 'GLP (kg)', placeholder: 'O volume de Gás Liquefeito de Petróleo (gás de cozinha/industrial) consumido.', gri: '302-1, 305-1', ods: 'ODS 12, ODS 13.2', evidence: 'Notas fiscais, relatórios de abastecimento' },
      { id: 'e9', text: 'Gasolina (L)', placeholder: 'O volume de Gasolina consumido.', gri: '302-1, 305-1', ods: 'ODS 12, ODS 13.2', evidence: 'Notas fiscais, relatórios de abastecimento' },
      { id: 'e10', text: 'Carvão (kg)', placeholder: 'O volume de Carvão consumido.', gri: '302-1, 305-1', ods: 'ODS 12, ODS 13.2', evidence: 'Notas fiscais, relatórios de abastecimento' },
      { id: 'e11', text: 'Qual foi o volume total de COVs emitidos (kg) no mês de referência?', placeholder: 'COVs são Compostos Orgânicos Voláteis (gases poluentes, vapores) emitidos por atividades como pintura ou uso de produtos químicos. Eles afetam a qualidade do ar local.', gri: '305-7', ods: 'ODS 12.2', evidence: 'Relatórios de emissões atmosféricas, laudos ambientais, inventário de emissões' },
      { id: 'e12', text: 'Qual é o número total de veículos da frota no mês de referência?', placeholder: 'Mede o tamanho total da frota (carros, caminhões, etc.) da empresa.', gri: '305-5', evidence: 'Registro da frota, notas fiscais de aquisição/locação' },
      { id: 'e13', text: 'Quantos veículos da frota são elétricos?', placeholder: 'Mede quantos veículos usam fontes de energia mais limpas (não fósseis), indicando o esforço para reduzir as emissões no transporte da empresa.', gri: '305-5', evidence: 'Registro da frota, notas fiscais de aquisição/locação' },
      { id: 'e14', text: 'Quantos veículos da frota são híbridos?', placeholder: 'Mede quantos veículos usam fontes de energia mais limpas (não fósseis), indicando o esforço para reduzir as emissões no transporte da empresa.', gri: '305-5', evidence: 'Registro da frota, notas fiscais de aquisição/locação' },
      { id: 'e15', text: 'Quantos veículos da frota são movidos a GNV?', placeholder: 'Mede quantos veículos usam fontes de energia mais limpas (não fósseis), indicando o esforço para reduzir as emissões no transporte da empresa.', gri: '305-5', evidence: 'Registro da frota, notas fiscais de aquisição/locação' },
      { id: 'e16', text: 'Quantos veículos da frota são movidos a Etanol?', placeholder: 'Mede quantos veículos usam fontes de energia mais limpas (não fósseis), indicando o esforço para reduzir as emissões no transporte da empresa.', gri: '305-5', evidence: 'Registro da frota, notas fiscais de aquisição/locação' },
      { id: 'e17', text: 'Quantos veículos da frota são movidos a Biodiesel?', placeholder: 'Mede quantos veículos usam fontes de energia mais limpas (não fósseis), indicando o esforço para reduzir as emissões no transporte da empresa.', gri: '305-5', evidence: 'Registro da frota, notas fiscais de aquisição/locação' }
    ],
    waste: [
      { id: 'r1', text: 'Qual tipo de resíduo foi gerado neste mês?', placeholder: 'A quantidade total de "lixo"/resíduos sólidos gerados em todo o processo produtivo da empresa.', gri: '306', ods: 'ODS 12, ODS 12.2', evidence: 'Notas fiscais de destinação, certificados de destinação final (CADRI, MTR), relatórios de coleta' },
      { id: 'r2', text: 'Qual o volume desse resíduo foi gerado nesse mês?', placeholder: 'Informe o volume em toneladas', gri: '306', ods: 'ODS 12, ODS 12.2', evidence: 'Notas fiscais de destinação, certificados de destinação final (CADRI, MTR), relatórios de coleta' },
      { id: 'r3', text: 'Qual foi o volume de resíduos perigosos gerados? (toneladas)', placeholder: 'É a quantidade de resíduos que, por serem tóxicos ou inflamáveis (ex: óleos, solventes, pilhas), exigem um cuidado e um tratamento especial para não contaminarem o meio ambiente.', gri: '306', ods: 'ODS 12, ODS 12.2', evidence: 'Notas fiscais de destinação, certificados de destinação final (CADRI, MTR), relatórios de coleta' },
      { id: 'r4', text: 'Qual foi o volume total de resíduos destinados à reciclagem? (toneladas)', placeholder: 'A quantidade de resíduos que foi separada, limpa e enviada a empresas que a transformarão em matéria-prima para novos produtos. Esta é a melhor destinação possível.', gri: '306', ods: 'ODS 12, ODS 12.2', evidence: 'Notas fiscais de destinação, certificados de destinação final (CADRI, MTR), relatórios de coleta' },
      { id: 'r5', text: 'Qual foi o volume total de resíduos enviados para aterro? (toneladas)', placeholder: 'A quantidade de resíduos que foi enviada aterros sanitários. Este é o destino menos desejado na economia circular e o objetivo é sempre reduzir esse número.', gri: '306', ods: 'ODS 12, ODS 12.2', evidence: 'Notas fiscais de destinação, certificados de destinação final (CADRI, MTR), relatórios de coleta' },
      { id: 'r6', text: 'Houve iniciativas de redução de resíduos na fonte?', placeholder: 'Ações implementadas para evitar que o resíduo seja gerado (ex: substituição de embalagens descartáveis por retornáveis, otimização de cortes de material para menos sobras).', gri: '306', ods: 'ODS 12, ODS 12.2', type: 'radio', options: ['Sim', 'Não'], evidence: 'Fotos ou imagens da iniciativa de redução de resíduos na fonte' },
      { id: 'r7', text: 'Qual foi o volume de matéria-prima reciclada utilizada no processo produtivo? (toneladas)', placeholder: 'A quantidade de material que já foi "lixo" uma vez e que a empresa comprou de volta (ou gerou internamente) para usar na fabricação de novos produtos. Isso fecha o ciclo da Economia Circular.', gri: '306', ods: 'ODS 12, ODS 12.2' },
      { id: 'r8', text: 'Qual foi a geração de sucata metálica por unidade produzida? (kg/unidade produzida)', placeholder: 'Mede o quanto de sucata metálica (restos de metal, ferro) é gerada para cada peça ou unidade que sua empresa fabrica. É um indicador de eficiência que mostra se o processo está gerando muito ou pouco desperdício.', gri: '306', ods: 'ODS 12, ODS 12.2' },
      { id: 'r9', text: 'Qual foi a geração de aparas/refugo plástico? (toneladas)', placeholder: 'A quantidade de plástico que virou "lixo" no processo (sobras, embalagens descartadas). Este dado ajuda a empresa a medir o desperdício de um material de grande impacto ambiental.', gri: '306', ods: 'ODS 12, ODS 12.2' }
    ],
    biodiversity: [
      { id: 'b1', text: 'Qual a área total ocupada pela planta industrial? (m²)', placeholder: 'O tamanho total do terreno onde a empresa está instalada.', gri: '304', ods: 'ODS 15.1, ODS 15.5', evidence: 'Plantas de ocupação, registros ambientais, laudos de flora/fauna' },
      { id: 'b2', text: 'Qual a área permeável do terreno? (m²)', placeholder: 'É o espaço no seu terreno onde a água da chuva pode penetrar no solo (gramados, jardins, áreas sem concreto). Isso é vital para evitar enchentes e recarregar os lençóis freáticos.', gri: '304', ods: 'ODS 15.1, ODS 15.5', evidence: 'Plantas de ocupação, registros ambientais, laudos de flora/fauna' },
      { id: 'b3', text: 'Qual a área de vegetação nativa preservada no terreno? (m²)', placeholder: 'É o tamanho da área de mata original do local que a empresa se compromete a manter. Esta área é crucial para a biodiversidade.', gri: '304', ods: 'ODS 15.1, ODS 15.5', evidence: 'Plantas de ocupação, registros ambientais, laudos de flora/fauna' },
      { id: 'b4', text: 'Houve intervenção ou supressão vegetal no período?', placeholder: 'Se a empresa cortou árvores, moveu terra ou modificou alguma área verde no período. A supressão vegetal é um impacto direto na biodiversidade e exige licença.', gri: '304', ods: 'ODS 15.1, ODS 15.5', type: 'radio', options: ['Sim', 'Não'], evidence: 'Plantas de ocupação, registros ambientais, laudos de flora/fauna' }
    ],
    pollutants: [
      { id: 'p1', text: 'Número de incidentes de vazamento de produtos perigosos?', placeholder: 'O número de vezes que líquidos ou produtos químicos perigosos (combustíveis, óleos) vazaram no ambiente.', gri: '305-7, 306-3', ods: 'ODS 3.9, ODS 11.6, ODS 15.1', evidence: 'Relatórios de monitoramento ambiental, laudos de medição de ruído, inventários de SDO' },
      { id: 'p2', text: 'Qual foi o volume de produtos perigosos vazados? (litros/kg)', placeholder: 'A quantidade de material perigoso que foi derramada nesse incidente.', gri: '305-7, 306-3', ods: 'ODS 3.9, ODS 11.6, ODS 15.1', evidence: 'Relatórios de monitoramento ambiental, laudos de medição de ruído, inventários de SDO' },
      { id: 'p3', text: 'Qual foi o nível de emissão de ruído nos limites da propriedade? (dB)', placeholder: 'O volume de barulho (em decibéis) que a operação está gerando nos limites do terreno, que pode incomodar a vizinhança.', gri: '305-7, 306-3', ods: 'ODS 3.9, ODS 11.6, ODS 15.1', evidence: 'Relatórios de monitoramento ambiental, laudos de medição de ruído, inventários de SDO' },
      { id: 'p4', text: 'Qual foi o volume de emissão de material particulado (MP)? (μg/m³)', placeholder: 'A quantidade de partículas sólidas ou líquidas (poeira, fumaça) liberadas na atmosfera. Excesso de MP prejudica a respiração e a qualidade do ar.', gri: '305-7, 306-3', ods: 'ODS 3.9, ODS 11.6, ODS 15.1', evidence: 'Relatórios de monitoramento ambiental, laudos de medição de ruído, inventários de SDO' },
      { id: 'p5', text: 'Qual foi o consumo de Substâncias que Destroem a Camada de Ozônio (SDOs)? (kg)', placeholder: 'O quanto de gases (como gases refrigerantes em equipamentos antigos de ar condicionado) prejudiciais à camada de ozônio foi utilizado/reposto.', gri: '305-7, 306-3', ods: 'ODS 3.9, ODS 11.6, ODS 15.1', evidence: 'Relatórios de monitoramento ambiental, laudos de medição de ruído, inventários de SDO' }
    ],
    compliance: [
      { id: 'c1', text: 'Qual foi o investimento total em melhorias e gestão ambiental no período? (R$)', placeholder: 'O total de dinheiro gasto em ações como compra de equipamentos mais limpos, consultoria ambiental, certificação, novos filtros e projetos de sustentabilidade.', gri: '307, 308, 302, 305', ods: 'ODS 12.6, ODS 16.6', evidence: 'Relatórios de auditoria e contratos de fornecedores' },
      { id: 'c2', text: 'Quais melhorias/ações de gestão ambiental foram implementadas?', placeholder: 'Descrição clara das ações (ex: "Instalação de uma nova ETE", "Troca da frota por veículos elétricos").', gri: '307, 308, 302, 305', ods: 'ODS 12.6, ODS 16.6', evidence: 'Relatórios de auditoria e contratos de fornecedores' },
      { id: 'c3', text: 'Quantas não conformidades ambientais foram identificadas em auditorias internas/externas? (nº)', placeholder: 'O número de vezes que a empresa falhou em atender a uma lei, norma ou regra interna, identificada em uma fiscalização.', gri: '307, 308, 302, 305', ods: 'ODS 12.6, ODS 16.6', evidence: 'Relatórios de auditoria' },
      { id: 'c4', text: 'Quantas dessas não conformidades foram resolvidas no prazo? (nº)', placeholder: 'O número de problemas identificados que foram corrigidos dentro do prazo estipulado, demonstrando a agilidade da gestão.', gri: '307, 308, 302, 305', ods: 'ODS 12.6, ODS 16.6', evidence: 'Relatórios de auditoria' },
      { id: 'c5', text: 'Houve multas ou sanções ambientais recebidas no período?', placeholder: 'Se a empresa foi multada ou penalizada por não cumprir uma lei ambiental.', gri: '307, 308, 302, 305', ods: 'ODS 12.6, ODS 16.6', type: 'radio', options: ['Sim', 'Não'], evidence: 'Relatórios de auditoria' },
      { id: 'c6', text: 'Quantos colaboradores receberam treinamento ambiental? (nº)', placeholder: 'O número de pessoas que participaram de cursos ou palestras sobre temas de sustentabilidade (ex: descarte correto, emergências, uso racional).', gri: '307, 308, 302, 305', ods: 'ODS 12.6, ODS 16.6', evidence: 'Relatórios de auditoria' },
      { id: 'c7', text: 'Qual treinamento foi oferecido?', placeholder: 'A descrição dos temas ensinados (ex: "Treinamento de Primeiros Socorros Ambientais", "Workshop de Resíduos").', gri: '307, 308, 302, 305', ods: 'ODS 12.6, ODS 16.6', evidence: 'Lista de presença e registros fotográficos' },
      { id: 'c8', text: 'Quantos fornecedores críticos foram avaliados sob critérios ambientais? (nº)', placeholder: 'O número de fornecedores essenciais para a operação que foram verificados quanto às suas práticas ambientais.', gri: '307, 308, 302, 305', ods: 'ODS 12.6, ODS 16.6', evidence: 'Relatórios de auditoria' },
      { id: 'c9', text: 'Quantos fornecedores críticos foram avaliados sob critérios sociais? (nº)', placeholder: 'O número de fornecedores essenciais para a operação que foram verificados quanto às suas práticas sociais.', gri: '307, 308, 302, 305', ods: 'ODS 12.6, ODS 16.6', evidence: 'Relatórios de auditoria' },
      { id: 'c10', text: 'A empresa possui um Sistema de Gestão Ambiental (SGA)?', placeholder: 'Se a empresa tem um sistema formal para gerenciar seus impactos ambientais, como a certificação ISO 14001, que é o padrão mundial.', gri: '307, 308, 302, 305', ods: 'ODS 12.6, ODS 16.6', type: 'radio', options: ['Sim - ISO 14001', 'Sim - Outro', 'Não'], evidence: 'Relatórios de auditoria' }
    ],
    demographics: [
      { id: 'd1', text: 'Idade', type: 'radio', options: ['Menos de 18 anos', '18-24', '25-34', '35-44', '45-59', '60+'] },
      { id: 'd2', text: 'Sexo/Gênero', type: 'radio', options: ['Feminino', 'Masculino', 'Prefere não responder', 'Outro'] },
      { id: 'd3', text: 'Estado civil', type: 'radio', options: ['Solteiro(a)', 'Casado(a)/união estável', 'Separado(a)/divorciado(a)', 'Viúvo(a)'] },
      { id: 'd4', text: 'Quantas pessoas moram na sua casa?', type: 'radio', options: ['1 pessoa', '2-3 pessoas', '4-5 pessoas', '6 ou mais'] },
      { id: 'd5', text: 'Quantas crianças vivem no domicílio (até 12 anos)?', type: 'radio', options: ['Nenhuma', '1', '2', '3 ou mais'] },
      { id: 'd6', text: 'Quantos idosos vivem no domicílio (60+ anos)?', type: 'radio', options: ['Nenhum', '1', '2 ou mais'] },
      { id: 'd7', text: 'Qual o nível mais alto de escolaridade concluído?', type: 'radio', options: ['Nunca frequentou a escola', 'Ensino Fundamental incompleto', 'Ensino Fundamental completo', 'Ensino Médio incompleto', 'Ensino Médio completo', 'Ensino Técnico', 'Ensino Superior incompleto', 'Ensino Superior completo', 'Pós-graduação'] },
      { id: 'd8', text: 'Situação de trabalho atual', type: 'radio', options: ['Empregado(a) com carteira assinada', 'Autônomo(a)/trabalhador(a) informal', 'Desempregado(a)', 'Estudante', 'Dona(o) de casa', 'Aposentado(a)/pensionista'] },
      { id: 'd9', text: 'Renda familiar mensal aproximada', type: 'radio', options: ['Sem renda', 'Até 1 salário mínimo', 'De 1 a 2 salários mínimos', 'De 2 a 3 salários mínimos', 'Mais de 3 salários mínimos'] },
      { id: 'd10', text: 'Principal fonte de renda da família', type: 'radio', options: ['Trabalho formal', 'Trabalho informal/autônomo', 'Benefícios sociais (Bolsa Família, BPC, etc.)', 'Aposentadoria/pensão', 'Outra'] },
      { id: 'd11', text: 'Tipo de moradia', type: 'radio', options: ['Casa própria', 'Casa alugada', 'Cedida por terceiros', 'Ocupação/sem regularização'] },
      { id: 'd12', text: 'Material predominante da casa', type: 'radio', options: ['Alvenaria', 'Madeira', 'Mista (madeira + alvenaria)', 'Outro'] },
      { id: 'd13', text: 'Na sua casa há alguém com doença crônica ou deficiência?', type: 'radio', options: ['Sim', 'Não', 'Não sei'] },
      { id: 'd14', text: 'Você ou alguém da família usa o SUS para atendimento de saúde?', type: 'radio', options: ['Sim, mas também temos plano de saúde privada', 'Sim, dependemos do SUS', 'Não'] },
      { id: 'd15', text: 'Marque abaixo quais destes você frequenta', type: 'checkbox', options: ['Associação', 'Cooperativa', 'Igreja', 'ONGs', 'Coletivos locais'] },
      { id: 'd16', text: 'Tem acesso regular à internet no domicílio?', type: 'radio', options: ['Sim (wifi ou dados móveis)', 'Não'] }
    ],
    living_wage: [
      { id: 'lw1', text: 'Você sabe o que é Salário Digno?', type: 'radio', options: ['Sim', 'Não'], gri: '402-1', evidence: 'Políticas formal de respeito de liberdade formal e ao direito de negociação coletiva assinada pela alta direção' },
      { id: 'lw2', text: 'A empresa que você representa aplica o Salário Digno?', type: 'radio', options: ['Não', 'Não, mas planejamos fazer', 'Sim, implementa mas não completamente', 'Sim, implementa corretamente'], gri: '402-1', evidence: 'Termo de adesão aos princípios da OIT e/ou ao Pacto Global da ONU' },
      { id: 'lw3', text: 'Você pode dizer que, os salários praticados na empresa:', type: 'radio', options: ['Abaixo do Salário Mínimo', 'Compatíveis com o Salário Mínimo', 'Entre o Salário Mínimo e o Salário Digno', 'Compatíveis com o Salário Digno', 'Acima do Salário Digno'] },
      { id: 'lw4', text: 'Quais modelos de contrato são praticados da empresa?', type: 'checkbox', options: ['CLT', 'PJ', 'Terceirizado', 'Jovem Aprendiz', 'Estágio', 'Temporários', 'Informais'], evidence: 'Demonstração de comissões internas existentes, como por exemplo: CIPA, comitês de diversidade, etc' },
      { id: 'lw5', text: 'Sua empresa divulga práticas formais que garantem aviso prévio aos trabalhadores e sindicatos sobre mudanças que possam afetar o emprego?', type: 'radio', options: ['Sim', 'Não'], gri: '402-1' },
      { id: 'lw6', text: 'Sua empresa verifica se seus fornecedores respeitam os direitos sindicais?', type: 'radio', options: ['Sim', 'Não'] },
      { id: 'lw7', text: 'Sua empresa adota medidas para prevenir riscos de violação da liberdade de associação e negociação coletiva?', type: 'radio', options: ['Sim', 'Não'] },
      { id: 'lw8', text: 'Relato e transparência: Demonstrar casos, resultados e melhorias nas relações sindicais e negociações coletivas.', placeholder: 'Campo aberto para comentários', evidence: 'Termo de adesão aos princípios da OIT e/ou ao Pacto Global da ONU' },
      { id: 'lw9', text: 'Qual a taxa de rotatividade?', placeholder: 'Informe a porcentagem' }
    ],
    diversity: [
      { id: 'div_subtitle1', text: '🔹 Sobre diversidade de Gênero', type: 'subtitle', gri: '405, 406', ods: 'ODS 5, ODS 10' },
      { id: 'div1', text: 'Quantas mulheres há na empresa?', evidence: 'Cópia de contratos de trabalho ou modelo de contrato.', gri: '405, 406', ods: 'ODS 5, ODS 10' },
      { id: 'div2', text: 'Destas, quantas estão em cargos de liderança, STEM?', gri: '405, 406', ods: 'ODS 5, ODS 10' },
      { id: 'div3', text: 'Quantas são pessoas trans?', gri: '405, 406', ods: 'ODS 5, ODS 10' },
      { id: 'div4', text: 'Quantos são travestis?', gri: '405, 406', ods: 'ODS 5, ODS 10' },
      
      { id: 'div_subtitle2', text: '🔹 Sobre diversidade étnico-racial', type: 'subtitle', gri: '405-1', ods: 'ODS 10, ODS 16' },
      { id: 'div5', text: 'Quantos funcionários são pessoas negras (pretas e pardas)?', evidence: 'Políticas escritas de diversidade e inclusão.', gri: '405-1', ods: 'ODS 10, ODS 16' },
      { id: 'div6', text: 'Quantos pertencem a povos indígenas?', evidence: 'Relatórios anuais de sustentabilidade (GRI/ISSB/TCFD).', gri: '405-1', ods: 'ODS 10, ODS 16' },
      { id: 'div7', text: 'Quantos pertencem a povos e comunidades tradicionais (Quilombolas, ribeirinhos, caiçaras, extrativistas, etc)?', gri: '405-1', ods: 'ODS 10, ODS 16' },
      { id: 'div8', text: 'Quantas pessoas de origem asiática, árabe ou de minorias étnicas?', gri: '405-1', ods: 'ODS 10, ODS 16' },
      
      { id: 'div_subtitle3', text: '🔹 Sobre diversidade de pessoas com deficiência', type: 'subtitle', gri: '405, 406', ods: 'ODS 8, ODS 10' },
      { id: 'div9', text: 'Quantas pessoas têm deficiência física?', gri: '405, 406', ods: 'ODS 8, ODS 10' },
      { id: 'div10', text: 'Quantas pessoas têm deficiência visual?', gri: '405, 406', ods: 'ODS 8, ODS 10' },
      { id: 'div11', text: 'Quantas pessoas têm deficiência auditiva?', gri: '405, 406', ods: 'ODS 8, ODS 10' },
      { id: 'div12', text: 'Quantas pessoas têm deficiência intelectual?', gri: '405, 406', ods: 'ODS 8, ODS 10' },
      { id: 'div13', text: 'Quantas pessoas têm deficiência psicossocial?', gri: '405, 406', ods: 'ODS 8, ODS 10' },
      { id: 'div14', text: 'Quantas pessoas têm deficiências múltiplas?', gri: '405, 406', ods: 'ODS 8, ODS 10' },
      
      { id: 'div_subtitle4', text: '🔹 Sobre diversidade geracional', type: 'subtitle', gri: '405, 406', ods: 'ODS 4, ODS 8' },
      { id: 'div15', text: 'Quantos jovens aprendizes e estagiários há na empresa?', gri: '405, 406', ods: 'ODS 4, ODS 8' },
      { id: 'div16', text: 'Quantas pessoas com mais de 50 anos estão ativas na empresa?', gri: '405, 406', ods: 'ODS 4, ODS 8' },
      
      { id: 'div_subtitle5', text: '🔹 Sobre diversidade sexual e de orientação afetiva', type: 'subtitle', gri: '406', ods: 'ODS 5, ODS 10' },
      { id: 'div17', text: 'Quantos representantes do grupo LGBTQIAPN+ existem na sua empresa?', gri: '406', ods: 'ODS 5, ODS 10' },
      
      { id: 'div_subtitle6', text: '🔹 Diversidade cultural e religiosa', type: 'subtitle', ods: 'ODS 16, ODS 10' },
      { id: 'div18', text: 'Quantas religiões ou crenças espirituais, incluindo pessoas sem religião, são praticadas por seus colaboradores?', ods: 'ODS 16, ODS 10' },
      { id: 'div19', text: 'Há ações de suporte a tradições e idiomas de imigrantes e refugiados colaboradores da empresa?', type: 'radio', options: ['Sim', 'Não'], ods: 'ODS 16, ODS 10' },
      
      { id: 'div_subtitle7', text: '🔹 Diversidade socioeconômica', type: 'subtitle', ods: 'ODS 1, ODS 8, ODS 10' },
      { id: 'div20', text: 'Quantas pessoas de baixa renda ou em situação de vulnerabilidade social trabalham na empresa?', ods: 'ODS 1, ODS 8, ODS 10' },
      { id: 'div21', text: 'Das pessoas abaixo, quais fazem parte da sua empresa?', type: 'checkbox', options: ['Ex-detentos(a)', 'Pessoas que estavam em situação de rua', 'Migrantes econômicos'], ods: 'ODS 1, ODS 8, ODS 10' },
      { id: 'div22', text: 'Apresente depoimentos/testemunhos de trabalhadores ou beneficiários.', evidence: 'Fotos e lista de presença', ods: 'ODS 1, ODS 8, ODS 10' },
      { id: 'div23', text: 'Compartilhe casos internos de promoção de diversidade.', evidence: 'Fotos e lista de presença', ods: 'ODS 1, ODS 8, ODS 10' }
    ],
    mental_health: [
      { id: 'mh_subtitle1', text: '🔹 Sobre política e governança de saúde mental', type: 'subtitle', gri: '401-2, 403-1, 403-8', ods: 'ODS 3, ODS 8, ODS 16' },
      { id: 'mh1', text: 'A empresa possui política formal ou diretriz sobre saúde mental e bem-estar dos colaboradores?', placeholder: 'Escala 1-5: 1=inexistente, 2=inicial, 3=em desenvolvimento, 4=consolidado, 5=exemplar', gri: '401-2, 403-1, 403-8', ods: 'ODS 3, ODS 8, ODS 16', type: 'scale' },
      { id: 'mh2', text: 'Existe algum responsável ou comitê que acompanha o tema de saúde mental?', placeholder: 'Escala 1-5', gri: '401-2, 403-1, 403-8', ods: 'ODS 3, ODS 8, ODS 16', type: 'scale' },
      { id: 'mh3', text: 'As lideranças recebem capacitação específica sobre gestão emocional e prevenção de adoecimento mental?', placeholder: 'Escala 1-5', gri: '401-2, 403-1, 403-8', ods: 'ODS 3, ODS 8, ODS 16', type: 'scale' },
      
      { id: 'mh_subtitle2', text: '🔹 Sobre ações e programa de bem-estar', type: 'subtitle', gri: '403-6, 403-7', ods: 'ODS 3, ODS 8' },
      { id: 'mh4', text: 'A empresa realiza ações ou campanhas regulares sobre saúde mental (como Setembro Amarelo, Janeiro Branco, etc.)?', placeholder: 'Escala 1-5', gri: '403-6, 403-7', ods: 'ODS 3, ODS 8', type: 'scale' },
      { id: 'mh5', text: 'São oferecidos benefícios relacionados à saúde mental, como psicoterapia, apoio emocional, mindfulness ou atividades físicas?', placeholder: 'Escala 1-5', gri: '403-6, 403-7', ods: 'ODS 3, ODS 8', type: 'scale' },
      { id: 'mh6', text: 'Existem programas internos de prevenção ao estresse, burnout ou assédio moral?', placeholder: 'Escala 1-5', gri: '403-6, 403-7', ods: 'ODS 3, ODS 8', type: 'scale' },
      { id: 'mh7', text: 'A empresa oferece flexibilidade de jornada, home office ou pausas programadas visando equilíbrio emocional?', placeholder: 'Escala 1-5', gri: '403-6, 403-7', ods: 'ODS 3, ODS 8', type: 'scale' },
      { id: 'mh8', text: 'Como são avaliados os resultados dessas ações (questionários, absenteísmo, feedback, etc.)?', placeholder: 'Escala 1-5', gri: '403-6, 403-7', ods: 'ODS 3, ODS 8', type: 'scale' },
      
      { id: 'mh_subtitle3', text: '🔹 Comunicação e Cultura Organizacional', type: 'subtitle', gri: '406', ods: 'ODS 16' },
      { id: 'mh9', text: 'A empresa promove comunicação aberta e sem estigma sobre saúde mental?', placeholder: 'Escala 1-5', gri: '406', ods: 'ODS 16', type: 'scale' },
      { id: 'mh10', text: 'Há canais de escuta e acolhimento para colaboradores em sofrimento emocional?', placeholder: 'Escala 1-5', gri: '406', ods: 'ODS 16', type: 'scale' },
      { id: 'mh11', text: 'O tema é discutido entre lideranças e equipes com regularidade (reuniões, campanhas, diálogos)?', placeholder: 'Escala 1-5', gri: '406', ods: 'ODS 16', type: 'scale' },
      { id: 'mh12', text: 'São adotadas ações de combate ao assédio moral, sexual e à discriminação psicológica?', placeholder: 'Escala 1-5', gri: '406', ods: 'ODS 16', type: 'scale' },
      
      { id: 'mh_subtitle4', text: '🔹 Diversidade inclusão e saúde mental', type: 'subtitle', gri: '405, 406', ods: 'ODS 5, ODS 10, ODS 16' },
      { id: 'mh13', text: 'As ações de saúde mental consideram diferenças de gênero, raça, idade e deficiência?', placeholder: 'Escala 1-5', gri: '405, 406', ods: 'ODS 5, ODS 10, ODS 16', type: 'scale' },
      { id: 'mh14', text: 'A empresa oferece suporte específico a grupos vulneráveis (mulheres, PcD, LGBTQIA+, etc.) em relação à saúde emocional?', placeholder: 'Escala 1-5', gri: '405, 406', ods: 'ODS 5, ODS 10, ODS 16', type: 'scale' },
      { id: 'mh15', text: 'Existe acompanhamento diferenciado para populações expostas a maiores riscos (como operários, motoristas, teleatendentes)?', placeholder: 'Escala 1-5', gri: '405, 406', ods: 'ODS 5, ODS 10, ODS 16', type: 'scale' },
      { id: 'mh16', text: 'Descreva ações de promoção de equilíbrio vida-trabalho (home office, flexibilidade, pausas).', gri: '405, 406', ods: 'ODS 5, ODS 10, ODS 16' },
      { id: 'mh17', text: 'Qual o número médio de trabalhadores que participam dessas ações?', gri: '405, 406', ods: 'ODS 5, ODS 10, ODS 16' },
      { id: 'mh18', text: 'Qual o número de líderes/gestores treinados para identificar sinais de sofrimento mental?', gri: '405, 406', ods: 'ODS 5, ODS 10, ODS 16' }
    ],
    community: [
      { id: 'com1', text: 'Nº de empregos locais gerados', placeholder: 'Informe o número de empregos criados na comunidade local', ods: 'ODS 8, ODS 10' },
      { id: 'com2', text: '% de fornecedores locais contratados', placeholder: 'Informe a porcentagem de fornecedores da região', ods: 'ODS 8, ODS 10' },
      { id: 'com3', text: 'Iniciativas de capacitação e empreendedorismo na comunidade', placeholder: 'Descreva as ações de capacitação oferecidas', ods: 'ODS 8, ODS 10' },
      { id: 'com4', text: 'Investimentos em escolas locais, programas de bolsas, treinamentos', placeholder: 'Descreva os investimentos em educação', ods: 'ODS 4' },
      { id: 'com5', text: 'Parcerias com universidades, cursos técnicos', placeholder: 'Liste as parcerias educacionais', ods: 'ODS 4' },
      { id: 'com6', text: 'Programas de saúde e bem-estar comunitário', placeholder: 'Descreva os programas de saúde oferecidos', ods: 'ODS 3' },
      { id: 'com7', text: 'Clínicas ou campanhas de prevenção apoiadas', placeholder: 'Liste as iniciativas de saúde preventiva', ods: 'ODS 3' },
      { id: 'com8', text: 'Apoio a transporte público/local', placeholder: 'Descreva o apoio ao transporte', ods: 'ODS 11' },
      { id: 'com9', text: 'Obras de infraestrutura (iluminação, saneamento, acessibilidade)', placeholder: 'Liste as melhorias de infraestrutura', ods: 'ODS 11' },
      { id: 'com10', text: 'Conselhos comunitários, fóruns de diálogo, consulta a stakeholders', placeholder: 'Descreva os canais de participação comunitária', ods: 'ODS 16' },
      { id: 'com11', text: 'Frequência de engajamento com lideranças locais', placeholder: 'Informe com que frequência ocorrem os encontros', ods: 'ODS 16' }
    ]
  };
  return questions[moduleId] || [];
};

export default function ParesiPlatform() {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState(null);
  const [actions, setActions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [scorecardAction, setScorecardAction] = useState(null);
  const [formLink, setFormLink] = useState(null);
  const [publicFormData, setPublicFormData] = useState(null);

  const handleLogin = () => {
    if (!email) return;
    // Simula empresa cadastrada
    const mockCompany = {
      name: 'Empresa Exemplo',
      city: 'São Paulo',
      state: 'SP',
      contact: 'contato@exemplo.com'
    };
    setCompany(mockCompany);
    setView('dashboard');
  };

  const handleRegister = (data) => {
    setCompany(data);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCompany(null);
    setEmail('');
    setActions([]);
    setScorecardAction(null);
    setView('login');
  };

  const handleCreateAction = (data) => {
    const newAction = { 
      id: Date.now(), 
      ...data, 
      createdAt: new Date().toISOString(),
      collectionConfig: data.collectionConfig || {},
      responses: {},
      internalData: {}
    };
    setActions([...actions, newAction]);
    setView('actions');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-900 via-blue-800 to-emerald-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Leaf className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Paresi Platform</h1>
            <p className="text-gray-600 mt-2">Gestão Socioambiental</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="seu@email.com"
            />
            
            <button onClick={handleLogin} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700">
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return <RegisterForm onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Paresi Platform</h1>
              <p className="text-sm text-gray-600">{company?.name}</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-2">
            <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-lg ${view === 'dashboard' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600'}`}>
              Dashboard
            </button>
            <button onClick={() => setView('actions')} className={`px-4 py-2 rounded-lg ${view === 'actions' || view === 'new-action' || view === 'view-action' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600'}`}>
              Ações
            </button>
            <button onClick={() => setView('profile')} className="p-2 rounded-lg text-gray-600">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg text-red-600">
              <LogOut className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {view === 'login' && null}
        {view === 'dashboard' && <Dashboard actions={actions} onNavigate={(v, action) => {
          if (v === 'scorecard') {
            setScorecardAction(action);
            setView('scorecard');
          } else {
            setView(v);
          }
        }} />}
        {view === 'profile' && <Profile company={company} onSave={(d) => {
          setCompany(d);
          setView('dashboard');
        }} />}
        {view === 'actions' && <ActionsList actions={actions} onNavigate={setView} onSelect={setSelectedAction} />}
        {view === 'new-action' && <NewAction onSave={handleCreateAction} onCancel={() => setView('actions')} />}
        {view === 'view-action' && selectedAction && <ActionDetail action={selectedAction} onBack={() => setView('actions')} />}
        {view === 'scorecard' && scorecardAction && <Scorecard action={scorecardAction} onBack={() => setView('dashboard')} onNavigate={(v, data) => {
          if (v === 'public-form') {
            setPublicFormData(data);
            setView('public-form');
          }
        }} />}
        {view === 'public-form' && publicFormData && <PublicForm formData={publicFormData} onBack={() => setView('scorecard')} />}
      </main>
    </div>
  );
}

function RegisterForm({ onRegister }) {
  const [data, setData] = useState({ name: '', city: '', state: '', contact: '' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-blue-800 to-emerald-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Cadastro da Empresa</h2>
        
        <div className="space-y-4">
          <input type="text" placeholder="Nome da Empresa" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Cidade" value={data.city} onChange={(e) => setData({...data, city: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
            <input type="text" placeholder="Estado" value={data.state} onChange={(e) => setData({...data, state: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <input type="text" placeholder="Contato" value={data.contact} onChange={(e) => setData({...data, contact: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          
          <button onClick={() => onRegister(data)} className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700">
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ actions, onNavigate }) {
  const total = actions.reduce((s, a) => s + (a.investment || 0), 0);
  
  // Calcular scores médios
  const calculateScore = (action) => {
    const envModules = ['water', 'energy', 'waste', 'biodiversity', 'pollutants', 'compliance'];
    const socialModules = ['demographics', 'living_wage', 'diversity', 'mental_health', 'community'];
    
    const envScore = action.modules?.filter(m => envModules.includes(m)).length * 16.67;
    const socialScore = action.modules?.filter(m => socialModules.includes(m)).length * 20;
    const overall = (envScore + socialScore) / 2;
    
    return { overall: Math.min(overall, 100), environmental: Math.min(envScore, 100), social: Math.min(socialScore, 100) };
  };
  
  const avgScores = actions.length > 0 
    ? actions.reduce((acc, a) => {
        const s = calculateScore(a);
        return {
          overall: acc.overall + s.overall,
          environmental: acc.environmental + s.environmental,
          social: acc.social + s.social
        };
      }, { overall: 0, environmental: 0, social: 0 })
    : { overall: 0, environmental: 0, social: 0 };
  
  if (actions.length > 0) {
    avgScores.overall /= actions.length;
    avgScores.environmental /= actions.length;
    avgScores.social /= actions.length;
  }
  
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-blue-600';
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-blue-100';
    if (score >= 80) return 'bg-emerald-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button onClick={() => onNavigate('new-action')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <Plus className="w-5 h-5" />
          Nova Ação
        </button>
      </div>
      
      {/* Header com Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-blue-100 text-sm mb-1">Score Geral</p>
              <p className="text-4xl font-bold">{avgScores.overall.toFixed(0)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2" style={{ width: `${avgScores.overall}%` }} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-gray-600 text-sm mb-1">Ações Ativas</p>
              <p className="text-3xl font-bold text-gray-900">{actions.length}</p>
            </div>
            <CheckSquare className="w-10 h-10 text-emerald-600" />
          </div>
          <p className="text-xs text-emerald-600">↑ Todas em andamento</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-gray-600 text-sm mb-1">Investimento Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {total.toLocaleString('pt-BR')}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500">Distribuído em {actions.length} ações</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-gray-600 text-sm mb-1">Módulos Ativos</p>
              <p className="text-3xl font-bold text-gray-900">{new Set(actions.flatMap(a => a.modules || [])).size}</p>
            </div>
            <FileText className="w-10 h-10 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500">Em todas as ações</p>
        </div>
      </div>
      
      {/* Scores por Dimensão */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Score Ambiental</h3>
              <p className="text-xs text-gray-500">Água, Energia, Resíduos, Biodiversidade</p>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <p className={`text-5xl font-bold ${getScoreColor(avgScores.environmental)}`}>
              {avgScores.environmental.toFixed(0)}
            </p>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`${getScoreBg(avgScores.environmental).replace('100', '600')} rounded-full h-3 transition-all`} 
                  style={{ width: `${avgScores.environmental}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Score Social</h3>
              <p className="text-xs text-gray-500">Diversidade, Saúde Mental, Comunidade</p>
            </div>
          </div>
          <div className="flex items-end gap-4">
            <p className={`text-5xl font-bold ${getScoreColor(avgScores.social)}`}>
              {avgScores.social.toFixed(0)}
            </p>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`${getScoreBg(avgScores.social).replace('100', '600')} rounded-full h-3 transition-all`} 
                  style={{ width: `${avgScores.social}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Grid de Ações */}
      <div>
        <h3 className="text-xl font-bold mb-4">Minhas Ações</h3>
        {actions.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">Nenhuma ação criada ainda</p>
            <button onClick={() => onNavigate('new-action')} className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Criar Primeira Ação
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actions.map(action => {
              const scores = calculateScore(action);
              const allMods = [...MODULE_GROUPS.environmental, ...MODULE_GROUPS.social];
              const envCount = action.modules?.filter(m => ['water', 'energy', 'waste', 'biodiversity', 'pollutants', 'compliance'].includes(m)).length || 0;
              const socialCount = action.modules?.filter(m => ['demographics', 'living_wage', 'diversity', 'mental_health', 'community'].includes(m)).length || 0;
              
              return (
                <div 
                  key={action.id} 
                  className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => onNavigate('scorecard', action)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-lg text-gray-900 line-clamp-2">{action.name}</h4>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreBg(scores.overall)} ${getScoreColor(scores.overall)}`}>
                      {scores.overall.toFixed(0)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{action.goal}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-emerald-600" />
                        Ambiental
                      </span>
                      <span className="font-bold">{scores.environmental.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-emerald-600 rounded-full h-1.5" style={{ width: `${scores.environmental}%` }} />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-600" />
                        Social
                      </span>
                      <span className="font-bold">{scores.social.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-blue-600 rounded-full h-1.5" style={{ width: `${scores.social}%` }} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-1">
                      <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded">🌊 {envCount}</span>
                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">👥 {socialCount}</span>
                    </div>
                    <span className="text-xs text-gray-500">R$ {(action.investment || 0).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Profile({ company, onSave }) {
  const [data, setData] = useState(company);
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 border">
      <h2 className="text-2xl font-bold mb-6">Perfil da Empresa</h2>
      <div className="space-y-4">
        <input type="text" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
        <button onClick={() => onSave(data)} className="w-full bg-emerald-600 text-white py-3 rounded-lg">Salvar</button>
      </div>
    </div>
  );
}

function ActionsList({ actions, onNavigate, onSelect }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Ações</h2>
        <button onClick={() => onNavigate('new-action')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg">
          <Plus className="w-5 h-5" />
          Nova
        </button>
      </div>
      
      {actions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-4">Nenhuma ação criada</p>
          <button onClick={() => onNavigate('new-action')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
            Criar Ação
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {actions.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-6 border cursor-pointer hover:shadow-md" onClick={() => { onSelect(a); onNavigate('view-action'); }}>
              <h3 className="text-xl font-bold mb-2">{a.name}</h3>
              <p className="text-gray-600 mb-4">{a.goal}</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                  {a.modules?.length || 0} módulos
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  R$ {(a.investment || 0).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewAction({ onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ name: '', target_audience: '', duration: '', goal: '', investment: 0, location: '' });
  const [mods, setMods] = useState([]);
  const [enabledQuestions, setEnabledQuestions] = useState({});
  const [collectionConfig, setCollectionConfig] = useState({});

  const allMods = [...MODULE_GROUPS.environmental, ...MODULE_GROUPS.social];

  const handleModToggle = (modId) => {
    if (mods.includes(modId)) {
      setMods(mods.filter(m => m !== modId));
      const newEnabled = {...enabledQuestions};
      delete newEnabled[modId];
      setEnabledQuestions(newEnabled);
    } else {
      setMods([...mods, modId]);
      const questions = getModuleQuestions(modId);
      setEnabledQuestions({
        ...enabledQuestions,
        [modId]: questions.reduce((acc, q) => ({...acc, [q.id]: true}), {})
      });
    }
  };

  const toggleQuestion = (modId, qId) => {
    setEnabledQuestions({
      ...enabledQuestions,
      [modId]: {
        ...enabledQuestions[modId],
        [qId]: !enabledQuestions[modId]?.[qId]
      }
    });
  };
  
  const updateCollectionConfig = (modId, config) => {
    setCollectionConfig({
      ...collectionConfig,
      [modId]: { ...collectionConfig[modId], ...config }
    });
  };
  
  const generateFormLink = (actionId, moduleId) => {
    const token = Math.random().toString(36).substring(2, 15);
    return `paresi.app/f/${actionId}/${moduleId}/${token}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl p-6 border">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Nova Ação</h2>
        <button onClick={onCancel} className="text-gray-600">✕</button>
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          <input type="text" placeholder="Nome" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          <input type="text" placeholder="Público" value={data.target_audience} onChange={(e) => setData({...data, target_audience: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          <input type="text" placeholder="Duração" value={data.duration} onChange={(e) => setData({...data, duration: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          <textarea placeholder="Objetivo" value={data.goal} onChange={(e) => setData({...data, goal: e.target.value})} className="w-full px-4 py-2 border rounded-lg" rows={3} />
          <input type="number" placeholder="Investimento" value={data.investment} onChange={(e) => setData({...data, investment: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
          <input type="text" placeholder="Local" value={data.location} onChange={(e) => setData({...data, location: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
          <button onClick={() => setStep(2)} className="w-full bg-emerald-600 text-white py-3 rounded-lg">Próximo</button>
        </div>
      ) : step === 2 ? (
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Selecione os Módulos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allMods.map(m => (
              <button key={m.id} onClick={() => handleModToggle(m.id)} type="button"
                className={`p-4 border-2 rounded-lg text-left ${mods.includes(m.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  {mods.includes(m.id) ? <CheckSquare className="w-5 h-5 text-emerald-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                  <span className="text-2xl">{m.icon}</span>
                </div>
                <p className="font-medium mt-2">{m.name}</p>
                <p className="text-xs text-gray-500">{m.questions} perguntas</p>
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 border-2 py-3 rounded-lg">Voltar</button>
            <button onClick={() => mods.length > 0 && setStep(3)} disabled={mods.length === 0} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg disabled:opacity-50">Configurar Perguntas</button>
          </div>
        </div>
      ) : step === 3 ? (
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Configure as Perguntas</h3>
          <p className="text-sm text-gray-600">Selecione quais perguntas deseja habilitar para cada módulo</p>
          
          <div className="max-h-96 overflow-y-auto space-y-6">
            {mods.map(modId => {
              const modInfo = allMods.find(m => m.id === modId);
              const questions = getModuleQuestions(modId);
              const enabled = Object.values(enabledQuestions[modId] || {}).filter(v => v).length;
              
              return (
                <div key={modId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{modInfo?.icon}</span>
                      <h4 className="font-bold">{modInfo?.name}</h4>
                    </div>
                    <span className="text-sm text-gray-600">{enabled}/{questions.length} selecionadas</span>
                  </div>
                  
                  <div className="space-y-2">
                    {questions.map((q, idx) => (
                      q.type !== 'subtitle' && (
                        <label key={q.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={enabledQuestions[modId]?.[q.id] || false}
                            onChange={() => toggleQuestion(modId, q.id)}
                            className="w-5 h-5 mt-0.5 text-emerald-600 rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{q.text}</p>
                            <div className="flex gap-2 mt-1">
                              {q.gri && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">GRI {q.gri}</span>}
                              {q.ods && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">{q.ods}</span>}
                            </div>
                          </div>
                        </label>
                      )
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 border-2 py-3 rounded-lg">Voltar</button>
            <button onClick={() => setStep(4)} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg">Configurar Coleta</button>
          </div>
        </div>
      ) : step === 4 ? (
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Configure a Coleta de Dados</h3>
          <p className="text-sm text-gray-600">Defina como os dados de cada módulo serão coletados</p>
          
          <div className="max-h-96 overflow-y-auto space-y-4">
            {mods.map(modId => {
              const modInfo = allMods.find(m => m.id === modId);
              const config = collectionConfig[modId] || { type: 'internal' };
              
              return (
                <div key={modId} className="border-2 rounded-lg p-5 bg-gray-50">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{modInfo?.icon}</span>
                    <h4 className="font-bold text-lg">{modInfo?.name}</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Coleta:</label>
                      <div className="space-y-2">
                        <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-white transition-colors">
                          <input 
                            type="radio" 
                            name={`type-${modId}`}
                            checked={config.type === 'individual'}
                            onChange={() => updateCollectionConfig(modId, { type: 'individual' })}
                            className="w-5 h-5 mt-0.5"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">📊 Formulário Individual</p>
                            <p className="text-xs text-gray-600">Beneficiários respondem individualmente via link público</p>
                          </div>
                        </label>
                        
                        <label className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-white transition-colors">
                          <input 
                            type="radio" 
                            name={`type-${modId}`}
                            checked={config.type === 'internal'}
                            onChange={() => updateCollectionConfig(modId, { type: 'internal' })}
                            className="w-5 h-5 mt-0.5"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">🏢 Coleta Interna</p>
                            <p className="text-xs text-gray-600">Gestores preenchem os dados internamente</p>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    {config.type === 'individual' && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                        <p className="text-sm font-medium text-blue-900">Configurações do Formulário:</p>
                        
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={config.anonymous || false}
                            onChange={(e) => updateCollectionConfig(modId, { anonymous: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Permitir respostas anônimas</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={config.collectEmail || false}
                            onChange={(e) => updateCollectionConfig(modId, { collectEmail: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Coletar e-mail (opcional)</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={config.onePerPerson || false}
                            onChange={(e) => updateCollectionConfig(modId, { onePerPerson: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Limitar 1 resposta por pessoa</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={config.allowEdit || false}
                            onChange={(e) => updateCollectionConfig(modId, { allowEdit: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Permitir edição após envio</span>
                        </label>
                        
                        <div>
                          <label className="block text-xs text-gray-700 mb-1">Meta de respostas:</label>
                          <input 
                            type="number" 
                            value={config.targetResponses || 100}
                            onChange={(e) => updateCollectionConfig(modId, { targetResponses: Number(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="100"
                          />
                        </div>
                      </div>
                    )}
                    
                    {config.type === 'internal' && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                        <p className="text-sm font-medium text-purple-900">Configurações Internas:</p>
                        
                        <div>
                          <label className="block text-xs text-gray-700 mb-1">Responsável pelo preenchimento:</label>
                          <input 
                            type="text" 
                            value={config.responsible || ''}
                            onChange={(e) => updateCollectionConfig(modId, { responsible: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="Nome do responsável"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-700 mb-1">Frequência de preenchimento:</label>
                          <select 
                            value={config.frequency || 'monthly'}
                            onChange={(e) => updateCollectionConfig(modId, { frequency: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          >
                            <option value="daily">Diário</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensal</option>
                            <option value="quarterly">Trimestral</option>
                            <option value="yearly">Anual</option>
                          </select>
                        </div>
                        
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={config.reminder || false}
                            onChange={(e) => updateCollectionConfig(modId, { reminder: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Notificar 3 dias antes do prazo</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={config.allowDraft || true}
                            onChange={(e) => updateCollectionConfig(modId, { allowDraft: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Permitir salvar como rascunho</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 border-2 py-3 rounded-lg">Voltar</button>
            <button onClick={() => onSave({...data, modules: mods, enabledQuestions, collectionConfig})} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg">Criar Ação</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ActionDetail({ action, onBack }) {
  const [mod, setMod] = useState(action.modules[0]);
  const [responses, setResponses] = useState({});
  const [wasteEntries, setWasteEntries] = useState([{ type: '', volume: '' }]);
  const [trainingEntries, setTrainingEntries] = useState([{ name: '' }]);
  
  const questions = getModuleQuestions(mod);
  const allMods = [...MODULE_GROUPS.environmental, ...MODULE_GROUPS.social];
  const enabledQs = action.enabledQuestions?.[mod] || {};
  const filteredQuestions = questions.filter(q => enabledQs[q.id]);
  
  const addWasteEntry = () => {
    setWasteEntries([...wasteEntries, { type: '', volume: '' }]);
  };
  
  const updateWasteEntry = (index, field, value) => {
    const updated = [...wasteEntries];
    updated[index][field] = value;
    setWasteEntries(updated);
  };
  
  const removeWasteEntry = (index) => {
    if (wasteEntries.length > 1) {
      setWasteEntries(wasteEntries.filter((_, i) => i !== index));
    }
  };
  
  const addTrainingEntry = () => {
    setTrainingEntries([...trainingEntries, { name: '' }]);
  };
  
  const updateTrainingEntry = (index, value) => {
    const updated = [...trainingEntries];
    updated[index].name = value;
    setTrainingEntries(updated);
  };
  
  const removeTrainingEntry = (index) => {
    if (trainingEntries.length > 1) {
      setTrainingEntries(trainingEntries.filter((_, i) => i !== index));
    }
  };
  
  const handleSave = () => {
    const data = {
      ...responses,
      wasteEntries: mod === 'waste' ? wasteEntries : undefined,
      trainingEntries: mod === 'compliance' ? trainingEntries : undefined
    };
    console.log('Dados salvos:', data);
    alert('Respostas salvas com sucesso!');
  };
  
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-gray-600 hover:text-gray-900">← Voltar</button>
      
      <div className="bg-white rounded-xl p-6 border">
        <h2 className="text-2xl font-bold mb-4">{action.name}</h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {action.modules.map(m => {
            const info = allMods.find(x => x.id === m);
            return (
              <button key={m} onClick={() => setMod(m)} className={`px-4 py-2 rounded-lg ${mod === m ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
                {info?.icon} {info?.name}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma pergunta habilitada para este módulo</p>
          ) : (
            (() => {
              let questionCounter = 0;
              return filteredQuestions.map((q) => {
                if (q.type === 'subtitle') {
                  questionCounter = 0;
                  return (
                    <div key={q.id} className="mt-6 mb-3 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border-l-4 border-emerald-600">
                      <h4 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                        <span>🔹</span>
                        {q.text.replace('🔹 ', '')}
                      </h4>
                      <div className="flex gap-2 mt-1">
                        {q.gri && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">GRI {q.gri}</span>}
                        {q.ods && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">{q.ods}</span>}
                      </div>
                    </div>
                  );
                }
                
                // Lógica condicional para RESÍDUOS (waste module)
                if (mod === 'waste' && (q.id === 'r1' || q.id === 'r2')) {
                  return null; // Estas perguntas são renderizadas na lógica especial abaixo
                }
                
                // Lógica condicional para TREINAMENTOS (compliance module)
                if (mod === 'compliance' && q.id === 'c7') {
                  return null; // Esta pergunta é renderizada na lógica especial abaixo
                }
                
                questionCounter++;
                
                return (
                  <div key={q.id} className="p-4 border rounded-lg">
                    <div className="flex gap-2 mb-2">
                      <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {questionCounter}
                      </span>
                      <p className="font-medium flex-1">{q.text}</p>
                    </div>
                    
                    <div className="flex gap-2 ml-8 mb-2">
                      {q.gri && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">GRI {q.gri}</span>}
                      {q.ods && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{q.ods}</span>}
                      {q.evidence && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">📎 Evidência</span>}
                    </div>
                    
                    {q.placeholder && (
                      <p className="text-xs text-gray-600 ml-8 mb-2 italic bg-blue-50 p-2 rounded">{q.placeholder}</p>
                    )}
                    
                    {q.evidence && (
                      <div className="ml-8 mb-2 flex items-center gap-1 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        <span className="font-semibold">📎 Evidência necessária:</span>
                        <span>{q.evidence}</span>
                      </div>
                    )}
                    
                    {q.type === 'scale' ? (
                      <div className="ml-8">
                        <div className="flex gap-2 mb-2">
                          {[1, 2, 3, 4, 5].map(num => (
                            <button
                              key={num}
                              onClick={() => setResponses({...responses, [q.id]: num})}
                              className={`w-12 h-12 rounded-lg border-2 font-bold transition-colors ${
                                responses[q.id] === num 
                                  ? 'bg-emerald-600 text-white border-emerald-600' 
                                  : 'border-gray-300 hover:border-emerald-400'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="font-semibold">Escala:</span> 1=Inexistente | 2=Inicial | 3=Em desenvolvimento | 4=Consolidado | 5=Exemplar
                        </div>
                      </div>
                    ) : q.type === 'radio' ? (
                      <div className="ml-8 space-y-1">
                        {q.options?.map(o => (
                          <label key={o} className="flex items-center gap-2">
                            <input type="radio" name={q.id} className="w-4 h-4" onChange={() => setResponses({...responses, [q.id]: o})} />
                            <span className="text-sm">{o}</span>
                          </label>
                        ))}
                      </div>
                    ) : q.type === 'checkbox' ? (
                      <div className="ml-8 space-y-1">
                        {q.options?.map(o => (
                          <label key={o} className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4" />
                            <span className="text-sm">{o}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={responses[q.id] || ''}
                        onChange={(e) => setResponses({...responses, [q.id]: e.target.value})}
                        placeholder={q.placeholder || 'Digite sua resposta...'}
                        className="w-full ml-8 px-4 py-2 border rounded-lg text-sm"
                        rows={2}
                      />
                    )}
                  </div>
                );
              });
            })()
          )}
          
          {/* LÓGICA CONDICIONAL 1: RESÍDUOS (Waste Module) */}
          {mod === 'waste' && enabledQs['r1'] && enabledQs['r2'] && (
            <div className="p-4 border-2 border-blue-400 rounded-lg bg-blue-50">
              <div className="bg-blue-600 text-white p-3 rounded-lg mb-4">
                <p className="font-bold text-sm">🔄 LÓGICA CONDICIONAL - RESÍDUOS</p>
                <p className="text-xs mt-1">Adicione todos os tipos de resíduos gerados no mês</p>
              </div>
              
              {wasteEntries.map((entry, index) => (
                <div key={index} className="p-4 mb-4 border-2 border-emerald-300 rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-bold text-emerald-800">Resíduo #{index + 1}</h5>
                    {wasteEntries.length > 1 && (
                      <button
                        onClick={() => removeWasteEntry(index)}
                        className="text-red-600 text-sm hover:bg-red-50 px-2 py-1 rounded"
                      >
                        ✕ Remover
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">1. Qual tipo de resíduo foi gerado neste mês?</label>
                      <input
                        type="text"
                        value={entry.type}
                        onChange={(e) => updateWasteEntry(index, 'type', e.target.value)}
                        placeholder="Ex: Papelão, Plástico, Metal, Vidro, Orgânico..."
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">2. Qual o volume desse resíduo foi gerado nesse mês?</label>
                      <input
                        type="text"
                        value={entry.volume}
                        onChange={(e) => updateWasteEntry(index, 'volume', e.target.value)}
                        placeholder="Ex: 10 toneladas, 500 kg..."
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={addWasteEntry}
                className="w-full py-3 border-2 border-dashed border-emerald-500 rounded-lg text-emerald-700 font-medium hover:bg-emerald-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                3. Adicionar outro tipo de resíduo
              </button>
            </div>
          )}
          
          {/* LÓGICA CONDICIONAL 2: TREINAMENTOS (Compliance Module) */}
          {mod === 'compliance' && enabledQs['c7'] && (
            <div className="p-4 border-2 border-purple-400 rounded-lg bg-purple-50">
              <div className="bg-purple-600 text-white p-3 rounded-lg mb-4">
                <p className="font-bold text-sm">🔄 LÓGICA CONDICIONAL - TREINAMENTOS</p>
                <p className="text-xs mt-1">Adicione todos os treinamentos ambientais oferecidos</p>
              </div>
              
              {trainingEntries.map((entry, index) => (
                <div key={index} className="p-4 mb-4 border-2 border-purple-300 rounded-lg bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-medium text-purple-800">7. Qual treinamento foi oferecido? #{index + 1}</label>
                    {trainingEntries.length > 1 && (
                      <button
                        onClick={() => removeTrainingEntry(index)}
                        className="text-red-600 text-sm hover:bg-red-50 px-2 py-1 rounded"
                      >
                        ✕ Remover
                      </button>
                    )}
                  </div>
                  <textarea
                    value={entry.name}
                    onChange={(e) => updateTrainingEntry(index, e.target.value)}
                    placeholder="Ex: Workshop de Gestão de Resíduos, Treinamento de Primeiros Socorros Ambientais..."
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                  <p className="text-xs text-gray-600 mt-1 italic">📎 Evidência: Lista de presença e registros fotográficos</p>
                </div>
              ))}
              
              <button
                onClick={addTrainingEntry}
                className="w-full py-3 border-2 border-dashed border-purple-500 rounded-lg text-purple-700 font-medium hover:bg-purple-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                8. Adicionar outro treinamento
              </button>
            </div>
          )}
        </div>

        {filteredQuestions.length > 0 && (
          <button onClick={handleSave} className="w-full bg-emerald-600 text-white py-3 rounded-lg mt-6 hover:bg-emerald-700">
            Salvar Respostas
          </button>
        )}
      </div>
    </div>
  );
}

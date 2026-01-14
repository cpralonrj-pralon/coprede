$filePath = "c:\Users\copre\OneDrive\Desktop\Projetos _ COp Rede\Site\coprede\pages\Dashboard.tsx"
$content = Get-Content $filePath -Raw

# Find the SGO VIEW section and replace it
$oldSection = @"
      {/* SGO VIEW */}
      {activeTab === 'sgo' && (
        <section className="space-y-6 mt-6">
          <h2 className="text-xl font-bold text-white">Monitoramento SGO</h2>
          <p className="text-sm text-gray-400">Total de tickets: <span className="text-primary font-bold">{sgoIncidents.length}</span></p>

          <div className="overflow-x-auto rounded-3xl border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-dark border-b border-white/5">
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Ticket</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Data Inicio</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Cidade</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Node</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Sintoma</th>
                  <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Impacto</th>
                   <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Observação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-surface-dark/50">
                {sgoIncidents.map((sgo, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-bold text-primary">{sgo.ticket}</td>
                    <td className="p-4 text-xs text-gray-400">{new Date(sgo.dataInicio).toLocaleString()}</td>
                    <td className="p-4 font-bold text-white max-w-[150px] truncate" title={sgo.cidade}>{sgo.cidade}</td>
                    <td className="p-4 text-xs text-gray-300 max-w-[100px] truncate" title={sgo.node}>{sgo.node}</td>
                    <td className="p-4">
                       <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-1 rounded border border-white/10 whitespace-nowrap">
                          {sgo.sintoma}
                       </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400 max-w-[120px] truncate" title={sgo.impacto}>{sgo.impacto}</td>
                     <td className="p-4 text-xs text-gray-500 max-w-[200px] truncate" title={sgo.observacao}>{sgo.observacao}</td>
                  </tr>
                ))}
                {sgoIncidents.length === 0 && (
                   <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">Nenhum incidente SGO encontrado.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
"@

Write-Host "Script created successfully. Please run manually to replace SGO section."
Write-Host "File path: $filePath"

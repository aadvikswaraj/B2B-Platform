'use client';
import { useMemo } from 'react';

export default function PermissionMatrix({ value = {}, onChange, disabled }) {
  const modules = useMemo(()=>Object.keys(value), [value]);

  function toggle(module, perm){
    if(disabled) return;
    onChange(prev => ({
      ...prev,
      [module]: { ...prev[module], [perm]: !prev[module][perm] }
    }));
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-1">
        <thead>
          <tr>
            <th className="text-left text-[11px] uppercase tracking-wide font-semibold text-gray-600 px-3 py-2">Module</th>
            <th className="text-left text-[11px] uppercase tracking-wide font-semibold text-gray-600 px-3 py-2">Permissions</th>
          </tr>
        </thead>
        <tbody>
          {modules.map(m => {
            const perms = Object.entries(value[m]);
            return (
              <tr key={m} className="align-top">
                <td className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap">{m}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {perms.map(([p, active]) => (
                      <button type="button" key={p} disabled={disabled} onClick={()=>toggle(m,p)} className={`px-2 py-1 rounded-md text-[11px] font-medium border transition ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{p}</button>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
          {modules.length===0 && (
            <tr><td colSpan={2} className="px-3 py-6 text-center text-xs text-gray-500">No permissions</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

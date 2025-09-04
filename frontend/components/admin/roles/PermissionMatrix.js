'use client';

export default function PermissionMatrix({ value = {}, onChange, disabled }) {

  function toggle(module, perm){
    if(disabled) return;
    onChange({
      ...value,
      [module]: { ...value[module], [perm]: !value[module][perm] }
    });
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
          {Object.keys(value).map(module => {
            const perms = Object.entries(value[module]);
            return (
              <tr key={module} className="align-top">
                <td className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap">{module}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {perms.map(([perm, active]) => (
                      <button type="button" key={perm} disabled={disabled} onClick={()=>toggle(module, perm)} className={`px-2 py-1 rounded-md text-[11px] font-medium border transition ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>{perm}</button>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
          {Object.keys(value).length===0 && (
            <tr><td colSpan={2} className="px-3 py-6 text-center text-xs text-gray-500">No permissions</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

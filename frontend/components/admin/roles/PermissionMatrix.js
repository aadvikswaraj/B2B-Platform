'use client';
import clsx from 'clsx';

export default function PermissionMatrix({ value = {}, onChange, superAdmin = false }) {

  const readOnly = superAdmin;

  function toggle(module, perm){
    if(readOnly) return;
    onChange?.({
      ...value,
      [module]: { ...value[module], [perm]: !value[module][perm] }
    });
  }

  const modules = Object.keys(value);

  return (
    <div className="overflow-x-auto">
      {superAdmin && (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          Super Admin enabled: granular permissions are bypassed. All capabilities are effectively granted.
        </div>
      )}
      <table className="min-w-full border-separate border-spacing-y-1">
        <thead>
          <tr>
            <th className="text-left text-[11px] uppercase tracking-wide font-semibold text-gray-600 px-3 py-2">Module</th>
            <th className="text-left text-[11px] uppercase tracking-wide font-semibold text-gray-600 px-3 py-2">Permissions</th>
          </tr>
        </thead>
        <tbody>
          {modules.map(module => {
            const perms = Object.entries(value[module] || {});
            return (
              <tr key={module} className="align-top">
                <td className="px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap capitalize">{module}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    {perms.map(([perm, active]) => {
                      const displayedActive = superAdmin ? true : !!active;
                      return (
                        <button
                          type="button"
                          key={perm}
                          aria-disabled={readOnly}
                          disabled={readOnly}
                          onClick={()=>toggle(module, perm)}
                          title={superAdmin ? 'Granted via Super Admin' : undefined}
                          className={clsx(
                            'px-2 py-1 rounded-md text-[11px] font-medium border transition',
                            {
                              'bg-indigo-600 border-indigo-600 text-white shadow': displayedActive,
                              'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600': !displayedActive,
                              'opacity-50 cursor-not-allowed': readOnly
                            }
                          )}
                        >{perm}</button>
                      );
                    })}
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

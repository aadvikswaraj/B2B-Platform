"use client"
export default function LoadingRole(){
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg border border-gray-200 bg-white" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-56 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Array.from({length:4}).map((_,i)=>(<div key={i} className="space-y-2"><div className="h-3 w-24 bg-gray-100 rounded" /><div className="h-4 w-36 bg-gray-200 rounded" /></div>))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({length:4}).map((_,i)=>(
                <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center justify-between"><div className="h-4 w-20 bg-gray-200 rounded" /><div className="h-4 w-12 bg-gray-200 rounded" /></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({length:5}).map((_,j)=>(<div key={j} className="h-5 w-12 bg-gray-100 rounded" />))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="space-y-3">
              <div className="h-8 w-full bg-gray-100 rounded" />
              <div className="h-8 w-full bg-gray-100 rounded" />
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="space-y-2">
              {Array.from({length:3}).map((_,i)=>(<div key={i} className="h-3 w-40 bg-gray-100 rounded" />))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-fadeIn { animation: fadeIn .25s ease; }
        @keyframes fadeIn { from {opacity:0; transform: translateY(4px);} to {opacity:1; transform: translateY(0);} }
      `}</style>
    </div>
  );
}

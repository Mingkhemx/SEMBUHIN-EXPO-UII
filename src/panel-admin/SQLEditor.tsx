import { useState } from "react";
import { Terminal, Database, Play, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function SQLEditor() {
  const [sql, setSql] = useState("SELECT * FROM doctor_registrations;");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSQL = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // First try to execute a regular SELECT query
      if (sql.trim().toUpperCase().startsWith("SELECT")) {
        const { data, error: dbError } = await supabase.rpc('execute_sql', { sql_query: sql });
        if (dbError) throw dbError;
        setResult(data);
      } else {
        // For other queries, use RPC
        const { data, error: dbError } = await supabase.rpc('execute_sql', { sql_query: sql });
        if (dbError) throw dbError;
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickQueries = [
    "SELECT * FROM doctor_registrations;",
    "SELECT status, COUNT(*) FROM doctor_registrations GROUP BY status;",
    "SELECT * FROM doctor_registrations ORDER BY created_at DESC LIMIT 10;",
  ];

  return (
    <div className="w-full h-full bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-100 rounded-xl">
            <Terminal className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">SQL Editor</h3>
            <p className="text-xs text-slate-500">Execute SQL queries directly</p>
          </div>
        </div>
        <button
          onClick={() => setSql("SELECT * FROM doctor_registrations;")}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100%-73px)]">
        {/* Left: Query Editor */}
        <div className="p-4 flex flex-col">
          <div className="flex flex-wrap gap-2 mb-3">
            {quickQueries.map((q, i) => (
              <button
                key={i}
                onClick={() => setSql(q)}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-700 rounded-lg transition-all"
              >
                {q.length > 40 ? q.substring(0, 40) + "..." : q}
              </button>
            ))}
          </div>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-sm bg-slate-900 text-green-400 rounded-2xl border border-slate-700 resize-none focus:outline-none focus:border-sky-500"
            placeholder="Enter your SQL query here..."
          />
          <button
            onClick={executeSQL}
            disabled={loading}
            className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold rounded-2xl hover:from-sky-500 hover:to-blue-500 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RotateCcw className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            Execute SQL
          </button>
        </div>

        {/* Right: Results */}
        <div className="p-4 border-l border-slate-200 bg-white flex flex-col">
          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-500" />
            Results
          </h4>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl mb-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {result && !error && (
            <div className="flex-1 overflow-auto">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl mb-4">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">Query executed successfully!</span>
              </div>
              <pre className="p-4 bg-slate-100 rounded-xl text-xs font-mono text-slate-700 overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Database className="h-16 w-16 mb-4 opacity-20" />
              <p>Execute a query to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

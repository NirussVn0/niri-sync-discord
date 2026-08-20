import { useState, useEffect } from "react";
import { Terminal, Copy, Check, Server, Shield, HardDrive, RefreshCw } from "lucide-react";

export const SettingsView = () => {
  const [healthData, setHealthData] = useState<unknown>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:4242/api/health");
      if (res.ok) {
        const json = await res.json();
        setHealthData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const systemdCommand = `mkdir -p ~/.config/systemd/user
cp systemd/presenced.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now presenced.service`;

  const journalCommand = `journalctl --user -u presenced.service -f`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Settings & System Diagnostics</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Daemon execution configuration, background systemd unit status, and diagnostic health report.
        </p>
      </div>

      {/* Systemd Service Setup */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">systemd User Service</h3>
            <p className="text-xs text-slate-400">Run presenced automatically on desktop login.</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              {systemdCommand}
            </pre>
            <button
              type="button"
              onClick={() => handleCopy(systemdCommand, "systemd")}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy commands"
            >
              {copiedCmd === "systemd" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-xs text-slate-400">To monitor live logs in your terminal:</p>
          <div className="relative">
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              {journalCommand}
            </pre>
            <button
              type="button"
              onClick={() => handleCopy(journalCommand, "journal")}
              className="absolute top-2.5 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Copy command"
            >
              {copiedCmd === "journal" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Live Diagnostics Viewer */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Live Health Telemetry</h3>
              <p className="text-xs text-slate-400">Real-time daemon response from GET /api/health</p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400/90 overflow-x-auto max-h-80 scrollbar-thin">
          {healthData ? JSON.stringify(healthData, null, 2) : "Fetching diagnostics..."}
        </pre>
      </div>

      {/* Storage & Privacy Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl border border-surface-border p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <HardDrive className="w-4 h-4 text-sky-400" />
            SQLite Local Database
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Persistent user configuration and LRCLIB cached lyrics are stored locally in <code className="text-slate-300 font-mono">~/.config/presenced/presenced.db</code> with SQLite WAL mode enabled.
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-surface-border p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Shield className="w-4 h-4 text-amber-400" />
            Privacy & Security Guarantee
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            No window titles or desktop facts are ever sent to remote services. All Discord RPC updates communicate locally via IPC Unix domain socket.
          </p>
        </div>
      </div>
    </div>
  );
};

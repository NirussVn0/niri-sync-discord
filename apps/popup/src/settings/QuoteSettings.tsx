/**
 * QuoteSettings — manage quote files for Discord status rotation.
 */
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { springSnap } from "../lib/animations.js";
import { FileText, Plus, Trash2 } from "lucide-react";

interface QuoteFile {
  id: string;
  name: string;
  path: string;
  lineCount: number;
  enabled: boolean;
}

interface QuoteSettingsProps {
  onSave: (files: QuoteFile[]) => Promise<void>;
  onLoad: () => Promise<QuoteFile[]>;
}

const DEFAULT_FILES: QuoteFile[] = [
  { id: "vietnamese", name: "Vietnamese Wisdom", path: "quotes/vietnamese-wisdom.txt", lineCount: 15, enabled: true },
  { id: "chinese", name: "Chinese Philosophy", path: "quotes/chinese-philosophy.txt", lineCount: 20, enabled: true },
];

export const QuoteSettings = ({ onSave, onLoad }: QuoteSettingsProps) => {
  const [files, setFiles] = useState<QuoteFile[]>(DEFAULT_FILES);
  const [newName, setNewName] = useState("");
  const [newPath, setNewPath] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    onLoad().then((loaded) => {
      if (loaded.length > 0) setFiles(loaded);
    });
  }, [onLoad]);

  const addFile = () => {
    if (!newName.trim() || !newPath.trim()) return;
    setFiles((prev) => [
      ...prev,
      { id: `quote-${Date.now()}`, name: newName, path: newPath, lineCount: 0, enabled: true },
    ]);
    setNewName("");
    setNewPath("");
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleFile = (id: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)));
  };

  const handleSave = async () => {
    await onSave(files);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-3 text-2xs">
      <h3 className="font-bold text-text-primary">Quote Files</h3>
      <p className="text-text-secondary">Quotes are used as Discord status text during rotation.</p>

      {/* File list */}
      <div className="space-y-1.5">
        {files.map((file) => (
          <motion.div key={file.id} className="p-2 rounded-niri glass-surface flex items-center gap-2" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={springSnap}>
            <FileText className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-text-primary font-medium">{file.name}</div>
              <div className="text-2xs text-text-muted font-mono truncate">{file.path}</div>
            </div>
            <span className="text-2xs text-text-muted">{file.lineCount} lines</span>
            <button type="button" onClick={() => toggleFile(file.id)}>
              {file.enabled ? <span className="w-4 h-4 rounded-full bg-status-connected inline-block" /> : <span className="w-4 h-4 rounded-full bg-surface-solid inline-block" />}
            </button>
            <button type="button" onClick={() => removeFile(file.id)} className="p-0.5 rounded hover:bg-status-error/20 text-text-muted hover:text-status-error transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex gap-1.5">
        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className="flex-1 px-2 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary placeholder-text-ghost focus:outline-none focus:border-accent-primary" />
        <input type="text" value={newPath} onChange={(e) => setNewPath(e.target.value)} placeholder="quotes/my-quotes.txt" className="flex-1 px-2 py-1 text-2xs bg-surface-solid border border-border rounded-niri text-text-primary placeholder-text-ghost font-mono focus:outline-none focus:border-accent-primary" />
        <button type="button" onClick={addFile} className="px-2 py-1 rounded-niri glass-surface text-text-secondary hover:text-text-primary transition-colors">
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Save */}
      <motion.button type="button" onClick={handleSave} className="w-full py-1.5 rounded-niri bg-accent-primary hover:bg-accent-glow text-white font-bold text-2xs transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={springSnap}>
        {saved ? "✓ Saved" : "Save Quote Config"}
      </motion.button>
    </div>
  );
};

/**
 * EditHandles — drag/resize handles for widget repositioning.
 * Shows when edit mode is active.
 */
import { motion } from "framer-motion";
import { GripVertical, ChevronUp, ChevronDown, Maximize2, Minimize2 } from "lucide-react";

interface EditHandlesProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onResize?: (delta: number) => void;
}

export const EditHandles = ({ onMoveUp, onMoveDown, onResize }: EditHandlesProps) => {
  return (
    <motion.div
      className="absolute -right-6 top-0 bottom-0 flex flex-col items-center justify-center gap-1 z-20"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
    >
      {onMoveUp && (
        <button type="button" onClick={onMoveUp} className="p-0.5 rounded glass-surface text-text-muted hover:text-text-primary transition-colors" title="Move up">
          <ChevronUp className="w-3 h-3" />
        </button>
      )}
      <GripVertical className="w-3 h-3 text-text-ghost" />
      {onMoveDown && (
        <button type="button" onClick={onMoveDown} className="p-0.5 rounded glass-surface text-text-muted hover:text-text-primary transition-colors" title="Move down">
          <ChevronDown className="w-3 h-3" />
        </button>
      )}
      {onResize && (
        <>
          <div className="w-4 h-px bg-text-ghost my-1" />
          <button type="button" onClick={() => onResize(20)} className="p-0.5 rounded glass-surface text-text-muted hover:text-text-primary transition-colors" title="Make larger">
            <Maximize2 className="w-2.5 h-2.5" />
          </button>
          <button type="button" onClick={() => onResize(-20)} className="p-0.5 rounded glass-surface text-text-muted hover:text-text-primary transition-colors" title="Make smaller">
            <Minimize2 className="w-2.5 h-2.5" />
          </button>
        </>
      )}
    </motion.div>
  );
};

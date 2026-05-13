import { MessageSquarePlus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatSidebar({
  chats,
  activeChatId,
  onSelect,
  onNew,
  onDelete,
  open,
  onClose,
}) {
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            aria-label="Close sidebar"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 dark:border-white/10 bg-white/95 dark:bg-pitch-panel/95 p-4 backdrop-blur-xl transition-all md:static md:z-0 md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="mb-4 flex items-center justify-between md:hidden">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Conversations</span>
          <button type="button" className="rounded-lg p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            onNew();
            onClose();
          }}
          className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-neon/15 py-2.5 text-sm font-semibold text-emerald-800 dark:text-neon ring-1 ring-neon/30 hover:bg-neon/25 transition-colors"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Session
        </button>
        <div className="scroll-thin flex-1 space-y-1 overflow-y-auto pr-1">
          {chats.map((c) => (
            <div
              key={c.id}
              className={`group flex items-stretch gap-1 rounded-xl border transition-colors ${
                activeChatId === c.id ? 'border-neon/40 bg-neon/10' : 'border-transparent hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onSelect(c.id);
                  onClose();
                }}
                className="min-w-0 flex-1 px-3 py-2 text-left"
              >
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{c.title}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{c.preview}</p>
              </button>
              <button
                type="button"
                title="Delete"
                className="px-2 text-slate-400 dark:text-slate-500 opacity-0 transition hover:text-rose-500 dark:hover:text-rose-400 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {!chats.length && <p className="px-2 py-6 text-center text-xs text-slate-500 dark:text-slate-400">No saved threads yet.</p>}
        </div>
      </aside>
    </>
  );
}

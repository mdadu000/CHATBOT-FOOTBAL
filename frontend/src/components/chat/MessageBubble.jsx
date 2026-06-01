import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

/** Returns true for raw Groq tool-call JSON that leaked into the DB from a previous bug */
function isRawToolCall(content) {
  if (!content || typeof content !== 'string') return false;
  const t = content.trim();
  return (t.startsWith('[{"name"') || t.startsWith('[{ "name"')) && t.includes('search_sports_web');
}

export function MessageBubble({ role, content, streaming, fromVoice }) {
  const isUser = role === 'user';

  // Hide any bubble that contains raw tool-call JSON (old artifact from a previous bug)
  if (!isUser && isRawToolCall(content)) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex max-w-[min(100%,52rem)] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
    >
      <div
        dir="auto"
        className={`relative rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all ${
          isUser
            ? 'bg-neon text-emerald-950 font-medium shadow-md'
            : 'border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 backdrop-blur-md shadow-sm dark:shadow-lg'
        }`}
      >
        {fromVoice && isUser && (
          <span className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-900/80">
            <Mic className="h-3 w-3" /> Voice
          </span>
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="markdown-body space-y-2 [&_a]:text-emerald-700 dark:[&_a]:text-neon [&_code]:rounded [&_code]:bg-slate-100 dark:[&_code]:bg-black/40 [&_code]:px-1 [&_code]:text-slate-900 dark:[&_code]:text-slate-100 [&_p]:m-0 [&_ul]:my-1 [&_li]:my-0.5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || (streaming ? '…' : '')}</ReactMarkdown>
          </div>
        )}
        {streaming && (
          <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-neon align-middle" />
        )}
      </div>
    </motion.div>
  );
}

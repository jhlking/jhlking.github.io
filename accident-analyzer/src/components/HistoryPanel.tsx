import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, Clock, ChevronRight } from 'lucide-react';
import { useAccidentStore } from '../stores/accidentStore';

const HistoryPanel: React.FC = () => {
  const { history } = useAccidentStore();

  if (history.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-200">历史记录</h3>
        </div>
        <span className="text-sm text-slate-400">{history.length} 条</span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence>
          {history.slice(0, 5).map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(report.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                    {report.damages.length}处损伤
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {report.images.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover border-2 border-slate-800"
                      />
                    ))}
                    {report.images.length > 3 && (
                      <div className="w-8 h-8 rounded-lg bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs text-slate-400">
                        +{report.images.length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-200 font-medium">
                      ¥{report.estimate.totalCost.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">预估费用</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {history.length > 5 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          查看全部 {history.length} 条记录
        </motion.button>
      )}
    </div>
  );
};

export default HistoryPanel;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  FileText,
  Phone,
  Wrench,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { useAccidentStore } from '../stores/accidentStore';
import { ActionStep } from '../types';

const iconMap: Record<string, React.ReactNode> = {
  shield: <Shield className="w-5 h-5" />,
  'file-text': <FileText className="w-5 h-5" />,
  phone: <Phone className="w-5 h-5" />,
  wrench: <Wrench className="w-5 h-5" />,
  'credit-card': <CreditCard className="w-5 h-5" />
};

const priorityColors = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

const ActionGuide: React.FC = () => {
  const { actionSteps } = useAccidentStore();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (actionSteps.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
          <FileText className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">行动指南</h3>
        <p className="text-sm text-slate-500">
          分析损伤后，系统将为您提供详细的处理步骤
        </p>
      </div>
    );
  }

  const completedCount = actionSteps.filter(s => s.completed).length;

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-200">事故处理指南</h3>
          <p className="text-sm text-slate-400">
            已完成 {completedCount}/{actionSteps.length} 步
          </p>
        </div>
        <div className="w-full max-w-[120px] h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / actionSteps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {actionSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                rounded-xl border overflow-hidden transition-colors
                ${step.completed
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : step.priority === 'high'
                  ? 'bg-slate-900/50 border-slate-700 hover:border-red-500/30'
                  : 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                }
              `}
            >
              <button
                onClick={() => setExpandedId(expandedId === step.id ? null : step.id)}
                className="w-full px-4 py-3 flex items-center gap-3"
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                  ${step.completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : step.priority === 'high'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-slate-700/50 text-slate-300'
                  }
                `}>
                  {step.completed ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    iconMap[step.icon] || <FileText className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-400 text-sm font-mono">
                      {String(step.id).padStart(2, '0')}
                    </span>
                    <h4 className={`font-semibold ${step.completed ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {step.title}
                    </h4>
                    {!step.completed && step.priority === 'high' && (
                      <span className={`px-2 py-0.5 rounded text-xs border ${priorityColors.high}`}>
                        重要
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-1">
                    {step.description}
                  </p>
                </div>

                <div className="flex-shrink-0 text-slate-500">
                  {expandedId === step.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expandedId === step.id && step.details && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-slate-700/50">
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-blue-400 mt-0.5">▸</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActionGuide;

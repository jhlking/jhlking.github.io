import React from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, Triangle, CircleDot, Waves } from 'lucide-react';
import { DamageArea, DamageType, DAMAGE_LABELS, DAMAGE_COLORS } from '../types';
import { useAccidentStore } from '../stores/accidentStore';

interface DamageCardProps {
  damage: DamageArea;
  index: number;
}

const iconMap: Record<DamageType, React.ReactNode> = {
  scratch: <AlertCircle className="w-5 h-5" />,
  dent: <CircleDot className="w-5 h-5" />,
  crack: <Triangle className="w-5 h-5" />,
  deform: <Waves className="w-5 h-5" />
};

const DamageCard: React.FC<DamageCardProps> = ({ damage, index }) => {
  const { removeDamage } = useAccidentStore();

  const severityLabel = damage.severity <= 3 ? '轻微' : damage.severity <= 6 ? '中等' : '严重';
  const severityColor = damage.severity <= 3 ? 'text-green-400' : damage.severity <= 6 ? 'text-yellow-400' : 'text-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: DAMAGE_COLORS[damage.type] + '20', color: DAMAGE_COLORS[damage.type] }}
          >
            {iconMap[damage.type]}
          </div>
          <div>
            <h4 className="font-semibold text-slate-200">{DAMAGE_LABELS[damage.type]}</h4>
            <p className={`text-sm ${severityColor}`}>
              严重程度: {severityLabel} ({damage.severity}/10)
            </p>
          </div>
        </div>
        <motion.button
          onClick={() => removeDamage(damage.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">损伤面积</p>
          <p className="text-lg font-mono font-semibold text-slate-200">
            {damage.realArea.toFixed(1)} <span className="text-sm text-slate-400">cm²</span>
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">预估费用</p>
          <p className="text-lg font-mono font-semibold text-emerald-400">
            ¥{damage.estimatedCost.toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DamageCard;

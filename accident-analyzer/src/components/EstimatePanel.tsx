import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import { useAccidentStore } from '../stores/accidentStore';

const EstimatePanel: React.FC = () => {
  const { damages, estimate } = useAccidentStore();

  if (!estimate || damages.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
          <DollarSign className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">暂无估算数据</h3>
        <p className="text-sm text-slate-500">
          上传图片并标注损伤区域后，系统将自动计算维修费用
        </p>
      </div>
    );
  }

  const severityColor = estimate.severityScore <= 3
    ? 'text-green-400'
    : estimate.severityScore <= 6
    ? 'text-yellow-400'
    : 'text-red-400';

  const severityBg = estimate.severityScore <= 3
    ? 'from-green-500/20 to-green-600/10'
    : estimate.severityScore <= 6
    ? 'from-yellow-500/20 to-yellow-600/10'
    : 'from-red-500/20 to-red-600/10';

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br rounded-2xl p-6 border border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-200 mb-1">损伤评估</h3>
            <p className="text-sm text-slate-400">基于图像分析的预估结果</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="35"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-slate-700"
              />
              <motion.circle
                cx="40"
                cy="40"
                r="35"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                className={severityColor}
                strokeDasharray={`${2 * Math.PI * 35}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 35 * (1 - estimate.severityScore / 10)
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className={`text-2xl font-bold ${severityColor}`}
              >
                {estimate.severityScore}
              </motion.span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-400">损伤数量</span>
            </div>
            <p className="text-2xl font-bold text-slate-200">{damages.length} 处</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-slate-400">损伤等级</span>
            </div>
            <p className={`text-2xl font-bold ${severityColor}`}>
              {estimate.severityScore <= 3 ? '轻微' : estimate.severityScore <= 6 ? '中等' : '严重'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">预估维修总费用</span>
            <span className="text-xl font-bold text-slate-200">
              ¥{estimate.totalCost.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-700">
            <span className="text-slate-400">保险可赔付</span>
            <span className="text-lg font-semibold text-emerald-400">
              ¥{Math.round(estimate.insuranceCoverage).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">预计自付</span>
            <span className="text-lg font-semibold text-amber-400">
              ¥{Math.round(estimate.selfPay).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`bg-gradient-to-r ${severityBg} rounded-xl p-4 border border-slate-700`}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${estimate.severityScore > 6 ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
            <AlertTriangle className={`w-5 h-5 ${estimate.severityScore > 6 ? 'text-red-400' : 'text-blue-400'}`} />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 mb-1">处理建议</h4>
            <p className="text-sm text-slate-300">{estimate.recommendation}</p>
          </div>
        </div>
      </motion.div>

      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-400" />
          费用说明
        </h4>
        <ul className="space-y-2 text-xs text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>以上为参考估价，实际费用以维修厂定损为准</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>4S店维修通常比普通修理厂高30-50%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>保险赔付比例根据您的投保方案而定</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EstimatePanel;

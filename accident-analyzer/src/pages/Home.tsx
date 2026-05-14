import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Camera,
  Save,
  Share2,
  RefreshCw,
  Lightbulb,
  Zap,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  Info,
  X
} from 'lucide-react';
import { useAccidentStore } from '../stores/accidentStore';
import ImageUploader from '../components/ImageUploader';
import DamageCanvas from '../components/DamageCanvas';
import DamageCard from '../components/DamageCard';
import EstimatePanel from '../components/EstimatePanel';
import ActionGuide from '../components/ActionGuide';
import LocationSearch from '../components/LocationSearch';
import HistoryPanel from '../components/HistoryPanel';

const Home: React.FC = () => {
  const {
    currentImage,
    images,
    damages,
    estimate,
    saveToHistory,
    clearCurrentReport,
    history
  } = useAccidentStore();

  const [showTips, setShowTips] = React.useState(false);
  const [showMobilePanel, setShowMobilePanel] = React.useState(false);

  const handleSave = () => {
    saveToHistory();
  };

  const handleShare = async () => {
    if (!estimate) return;

    const text = `车辆损伤分析报告\n\n损伤数量: ${damages.length}处\n预估费用: ¥${estimate.totalCost.toLocaleString()}\n严重程度: ${estimate.severityScore}/10\n处理建议: ${estimate.recommendation}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '车辆损伤分析报告',
          text
        });
      } catch (err) {
        console.log('分享取消');
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('报告已复制到剪贴板');
    }
  };

  const handleNew = () => {
    if (images.length > 0 && !confirm('确定要清除当前分析并开始新的报告吗？')) {
      return;
    }
    clearCurrentReport();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100">事故分析</h1>
                <p className="text-xs text-slate-500">车辆损伤智能评估</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {images.length > 0 && (
                <>
                  <motion.button
                    onClick={handleSave}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
                    title="保存到历史"
                  >
                    <Save className="w-5 h-5" />
                  </motion.button>
                  {estimate && (
                    <motion.button
                      onClick={handleShare}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
                      title="分享报告"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handleNew}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
                    title="新建报告"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-slate-200">事故现场</h2>
              </div>
              <ImageUploader />
            </motion.section>

            {currentImage && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-slate-200">损伤标注</h2>
                </div>
                <DamageCanvas />
              </motion.section>
            )}

            {damages.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-slate-200">损伤详情</h2>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {damages.map((damage, index) => (
                      <DamageCard key={damage.id} damage={damage} index={index} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>
            )}

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <LocationSearch />
            </motion.section>
          </div>

          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <EstimatePanel />
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ActionGuide />
            </motion.section>

            <HistoryPanel />

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20">
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-slate-200">使用技巧</h3>
                  </div>
                  {showTips ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                <AnimatePresence>
                  {showTips && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 text-sm text-slate-300">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-200 mb-1">准确标注</h4>
                            <p className="text-slate-400">使用画笔仔细圈出损伤区域，闭合的曲线区域会自动计算面积</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Camera className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-200 mb-1">多角度拍摄</h4>
                            <p className="text-slate-400">建议从多个角度拍摄车辆损伤，包括正面、侧面和细节特写</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-200 mb-1">及时处理</h4>
                            <p className="text-slate-400">事故后尽快完成分析，保存记录以便后续理赔使用</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      {showMobilePanel && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          className="fixed inset-x-0 bottom-0 bg-slate-900 rounded-t-3xl border-t border-slate-700 p-4 lg:hidden max-h-[70vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">分析结果</h3>
            <button
              onClick={() => setShowMobilePanel(false)}
              className="p-2 bg-slate-800 rounded-xl"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <EstimatePanel />
          <div className="mt-4">
            <ActionGuide />
          </div>
        </motion.div>
      )}

      {damages.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowMobilePanel(true)}
          className="fixed bottom-6 right-6 lg:hidden p-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30 text-white"
        >
          <Shield className="w-6 h-6" />
        </motion.button>
      )}

      <footer className="mt-12 py-6 border-t border-slate-800 text-center text-sm text-slate-500">
        <p>本工具仅供参考，实际维修费用以维修厂定损为准</p>
      </footer>
    </div>
  );
};

export default Home;

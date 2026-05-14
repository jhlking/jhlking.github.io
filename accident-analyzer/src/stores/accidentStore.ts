import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DamageArea,
  InsuranceEstimate,
  ActionStep,
  GeoPosition,
  ServicePoint,
  AccidentReport,
  DamageType,
  DAMAGE_COLORS
} from '../types';

interface AccidentStore {
  currentImage: string | null;
  currentImageIndex: number;
  images: string[];
  damages: DamageArea[];
  estimate: InsuranceEstimate | null;
  actionSteps: ActionStep[];
  location: GeoPosition | null;
  nearbyServices: ServicePoint[];
  history: AccidentReport[];
  selectedDamageType: DamageType;

  setImage: (image: string, index?: number) => void;
  addImage: (image: string) => void;
  removeImage: (index: number) => void;
  setCurrentImageIndex: (index: number) => void;

  addDamage: (damage: DamageArea) => void;
  updateDamage: (id: string, damage: Partial<DamageArea>) => void;
  removeDamage: (id: string) => void;
  clearDamages: () => void;
  setSelectedDamageType: (type: DamageType) => void;

  calculateEstimate: () => void;
  setLocation: (location: GeoPosition) => void;
  searchNearbyServices: (type: string) => Promise<void>;

  saveToHistory: () => void;
  clearCurrentReport: () => void;
}

const BASE_RATES = {
  scratch: { perCm2: 15, minCost: 200, maxCost: 500 },
  dent: { perCm2: 35, minCost: 500, maxCost: 1500 },
  crack: { perCm2: 50, minCost: 1500, maxCost: 5000 },
  deform: { perCm2: 80, minCost: 5000, maxCost: 20000 }
};

export const useAccidentStore = create<AccidentStore>()(
  persist(
    (set, get) => ({
      currentImage: null,
      currentImageIndex: 0,
      images: [],
      damages: [],
      estimate: null,
      actionSteps: [],
      location: null,
      nearbyServices: [],
      history: [],
      selectedDamageType: 'scratch',

      setImage: (image: string, index?: number) => {
        const images = index !== undefined ? get().images : [...get().images, image];
        set({
          currentImage: image,
          images: index !== undefined ? images : images,
          currentImageIndex: index ?? images.length - 1
        });
      },

      addImage: (image: string) => {
        set(state => ({
          images: [...state.images, image],
          currentImage: image,
          currentImageIndex: state.images.length
        }));
      },

      removeImage: (index: number) => {
        const images = get().images.filter((_, i) => i !== index);
        set({
          images,
          currentImage: images[0] || null,
          currentImageIndex: 0
        });
      },

      setCurrentImageIndex: (index: number) => {
        const image = get().images[index];
        if (image) {
          set({ currentImageIndex: index, currentImage: image });
        }
      },

      addDamage: (damage: DamageArea) => {
        set(state => ({ damages: [...state.damages, damage] }));
        get().calculateEstimate();
      },

      updateDamage: (id: string, updates: Partial<DamageArea>) => {
        set(state => ({
          damages: state.damages.map(d => d.id === id ? { ...d, ...updates } : d)
        }));
        get().calculateEstimate();
      },

      removeDamage: (id: string) => {
        set(state => ({ damages: state.damages.filter(d => d.id !== id) }));
        get().calculateEstimate();
      },

      clearDamages: () => {
        set({ damages: [], estimate: null, actionSteps: [] });
      },

      setSelectedDamageType: (type: DamageType) => {
        set({ selectedDamageType: type });
      },

      calculateEstimate: () => {
        const { damages } = get();

        if (damages.length === 0) {
          set({ estimate: null, actionSteps: [] });
          return;
        }

        let totalCost = 0;
        let totalSeverity = 0;

        damages.forEach(damage => {
          const rate = BASE_RATES[damage.type];
          const areaCost = damage.realArea * rate.perCm2;
          damage.estimatedCost = Math.max(rate.minCost, Math.min(areaCost, rate.maxCost));
          damage.severity = Math.min(10, Math.max(1, Math.round(damage.realArea / 10 + damage.type === 'deform' ? 4 : 0)));
          totalCost += damage.estimatedCost;
          totalSeverity += damage.severity;
        });

        const avgSeverity = totalSeverity / damages.length;
        const insuranceCoverage = totalCost * (avgSeverity > 5 ? 0.7 : 0.5);
        const selfPay = totalCost - insuranceCoverage;

        let recommendation = '';
        if (totalCost < 500) {
          recommendation = '建议私下协商处理，节省保险报案时间';
        } else if (totalCost < 2000) {
          recommendation = '可考虑走交强险，影响较小';
        } else {
          recommendation = '建议走商业险，保障更全面';
        }

        const severityScore = Math.round(avgSeverity);

        const actionSteps: ActionStep[] = [
          {
            id: 1,
            title: '现场安全确认',
            description: '确保人员安全，开启双闪灯，摆放三角警示牌',
            icon: 'shield',
            priority: 'high',
            completed: false,
            details: [
              '在安全情况下拍照记录现场',
              '将车辆移至安全位置',
              '确保所有人员远离车道'
            ]
          },
          {
            id: 2,
            title: '信息交换',
            description: '交换驾驶证、行驶证、保险信息',
            icon: 'file-text',
            priority: 'high',
            completed: false,
            details: [
              '拍摄对方车牌照片',
              '记录对方联系方式',
              '核对保险投保信息'
            ]
          },
          {
            id: 3,
            title: '报案流程',
            description: severityScore > 6 ? '建议报警处理' : '可选择快速处理',
            icon: 'phone',
            priority: severityScore > 6 ? 'high' : 'medium',
            completed: false,
            details: severityScore > 6
              ? ['损失较大，建议报警', '等待交警出具事故认定书', '按责论处，索赔有据']
              : ['轻微事故可快速处理', '下载交管12123 APP', '线上定责更便捷']
          },
          {
            id: 4,
            title: '维修指引',
            description: '选择合适的维修方案',
            icon: 'wrench',
            priority: 'medium',
            completed: false,
            details: [
              '可选择4S店或正规修理厂',
              '询价对比，选择性价比高的',
              '确认维修方案后再送修'
            ]
          },
          {
            id: 5,
            title: '理赔指导',
            description: '准备材料，顺利完成理赔',
            icon: 'credit-card',
            priority: 'medium',
            completed: false,
            details: [
              '准备身份证、银行卡、事故认定书',
              '维修发票、定损单',
              '联系保险公司提交材料'
            ]
          }
        ];

        set({
          estimate: {
            totalCost,
            severityScore,
            insuranceCoverage,
            selfPay,
            recommendation
          },
          actionSteps
        });
      },

      setLocation: (location: GeoPosition) => {
        set({ location });
      },

      searchNearbyServices: async (type: string) => {
        const mockServices: ServicePoint[] = [
          {
            id: '1',
            name: '途虎养车工场店',
            type: type as 'repair' | 'insurance' | 'police',
            address: '北京市朝阳区建国路89号',
            distance: '1.2km',
            rating: 4.8,
            phone: '400-888-1234'
          },
          {
            id: '2',
            name: '中鑫之宝汽车服务',
            type: type as 'repair' | 'insurance' | 'police',
            address: '北京市朝阳区光华路甲9号',
            distance: '2.5km',
            rating: 4.6,
            phone: '010-88886666'
          }
        ];
        set({ nearbyServices: mockServices });
      },

      saveToHistory: () => {
        const { images, damages, estimate, actionSteps, location } = get();
        if (images.length === 0) return;

        const report: AccidentReport = {
          id: Date.now().toString(),
          images,
          damages,
          estimate: estimate || {
            totalCost: 0,
            severityScore: 0,
            insuranceCoverage: 0,
            selfPay: 0,
            recommendation: ''
          },
          actions: actionSteps,
          createdAt: new Date().toISOString(),
          location
        };

        set(state => ({
          history: [report, ...state.history].slice(0, 30)
        }));
      },

      clearCurrentReport: () => {
        set({
          currentImage: null,
          currentImageIndex: 0,
          images: [],
          damages: [],
          estimate: null,
          actionSteps: []
        });
      }
    }),
    {
      name: 'accident-analyzer-storage',
      partialize: (state) => ({
        history: state.history,
        selectedDamageType: state.selectedDamageType
      })
    }
  )
);

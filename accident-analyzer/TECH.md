# 车辆事故智能分析工具 - 技术架构文档

## 1. 项目概述

### 项目名称
AutoAccidentAnalyzer - 车辆事故智能分析工具

### 核心功能
通过图片分析实现车辆损伤标注、面积计算、赔偿估算，并提供完整的事故处理指导流程。

### 目标用户
- 交通事故当事人
- 车主日常检查
- 二手车评估参考

## 2. 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | React 18 + TypeScript | 类型安全 + 现代响应式开发 |
| 构建 | Vite | 快速热更新 + 优化的生产构建 |
| 样式 | Tailwind CSS | 原子化CSS + 响应式支持 |
| 状态 | Zustand | 轻量级状态管理 |
| 图标 | Lucide React | 统一风格图标库 |
| 地图 | 高德地图 Web API | 位置服务和周边查询 |
| 存储 | localStorage | 本地数据持久化 |

## 3. 项目结构

```
accident-analyzer/
├── src/
│   ├── components/
│   │   ├── ImageUploader.tsx       # 图片上传组件
│   │   ├── DamageCanvas.tsx        # Canvas绑图绘制
│   │   ├── DamageCard.tsx          # 损伤信息卡片
│   │   ├── EstimatePanel.tsx       # 费用估算面板
│   │   ├── ActionGuide.tsx         # 行动指南组件
│   │   ├── LocationSearch.tsx     # 位置搜索组件
│   │   └── ui/                     # 通用UI组件
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   ├── pages/
│   │   └── Home.tsx                # 主页面
│   ├── hooks/
│   │   ├── useDamageCanvas.ts      # Canvas绑图逻辑
│   │   ├── useEstimate.ts          # 估算逻辑
│   │   └── useLocation.ts          # 地理位置逻辑
│   ├── stores/
│   │   └── accidentStore.ts        # Zustand状态存储
│   ├── utils/
│   │   ├── areaCalculator.ts       # 面积计算工具
│   │   ├── costEstimator.ts         # 费用估算
│   │   └── storage.ts              # 本地存储工具
│   ├── types/
│   │   └── index.ts                # TypeScript类型定义
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 4. 核心模块设计

### 4.1 ImageUploader 组件
```typescript
// 功能流程
1. 监听拖拽/点击事件
2. 验证文件类型（image/jpeg, image/png）
3. 使用 FileReader 读取文件
4. 转换为 base64 存储
5. 触发 onUpload 回调

// 状态
- default: 等待上传状态
- dragging: 拖拽悬停状态
- uploading: 上传中（显示进度）
- uploaded: 上传完成（显示预览）
- error: 上传失败（显示错误信息）
```

### 4.2 DamageCanvas 组件
```typescript
// 绑定工具
- 画笔工具：绘制损伤区域（自由绘制）
- 橡皮擦：擦除绑图
- 撤销/重做：操作历史记录
- 清空：重置画布

// 区域类型切换
- scratch: 刮擦（红色）
- dent: 凹陷（橙色）
- crack: 破裂（蓝色）
- deform: 变形（紫色）

// 事件处理
- onMouseDown: 开始绘制
- onMouseMove: 连续绘制
- onMouseUp: 结束绘制
- 计算闭合区域面积
```

### 4.3 面积计算算法
```typescript
// 基于像素统计的面积估算
function calculateArea(points: Point[]): number {
  // 使用Shoelace公式计算多边形面积
  // 将像素面积转换为实际面积（假设参考物尺寸）
}

// 实际面积估算
// 基于常见参照物（如车牌尺寸 44cm x 14cm）
function pixelsToRealArea(pixelArea: number, imageWidth: number): number {
  const referenceObject = {
    name: 'license_plate',
    width: 44, // cm
    pixelWidth: measureFromImage()
  };
  const scale = referenceObject.width / referenceObject.pixelWidth;
  return pixelArea * scale * scale;
}
```

### 4.4 费用估算算法
```typescript
// 基础费率表
const BASE_RATES = {
  scratch: { perCm2: 15, minCost: 200, maxCost: 500 },
  dent: { perCm2: 35, minCost: 500, maxCost: 1500 },
  crack: { perCm2: 50, minCost: 1500, maxCost: 5000 },
  deform: { perCm2: 80, minCost: 5000, maxCost: 20000 }
};

// 估算逻辑
function estimateCost(damage: DamageArea): number {
  const rate = BASE_RATES[damage.type];
  const areaCost = damage.realArea * rate.perCm2;
  return Math.max(rate.minCost, Math.min(areaCost, rate.maxCost));
}
```

### 4.5 行动指南逻辑
```typescript
// 根据损伤情况生成个性化指南
function generateActionGuide(report: AccidentReport): ActionStep[] {
  const steps = [
    { id: 1, title: '现场安全确认', ... },
    { id: 2, title: '信息交换', ... },
    { id: 3, title: '报案流程', ... },
    { id: 4, title: '维修指引', ... },
    { id: 5, title: '理赔指导', ... }
  ];

  // 根据损伤类型和金额调整优先级
  if (report.totalEstimate > 5000) {
    steps[2].priority = 'high'; // 建议报警
  }

  return steps;
}
```

### 4.6 位置服务
```typescript
// 获取当前位置
async function getCurrentLocation(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }),
      (error) => reject(error)
    );
  });
}

// 逆地理编码（使用高德API）
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // 调用高德逆地理编码API
}

// 周边搜索
async function searchNearby(lat: number, lng: number, type: string) {
  // 调用高德POI搜索API
}
```

## 5. 状态管理 (Zustand)

```typescript
interface AccidentStore {
  // 当前图片
  currentImage: string | null;

  // 损伤列表
  damages: DamageArea[];

  // 估算结果
  estimate: {
    totalCost: number;
    severityScore: number;
    insuranceCoverage: number;
    selfPay: number;
  };

  // 行动指南
  actionSteps: ActionStep[];

  // 位置信息
  location: GeoPosition | null;
  nearbyServices: ServicePoint[];

  // 操作
  setImage: (image: string) => void;
  addDamage: (damage: DamageArea) => void;
  removeDamage: (id: string) => void;
  clearDamages: () => void;
  calculateEstimate: () => void;
  setLocation: (location: GeoPosition) => void;
  searchNearbyServices: (type: string) => Promise<void>;
}
```

## 6. 数据持久化

```typescript
// localStorage 结构
interface StorageSchema {
  'accident_history': AccidentReport[];
  'accident_draft': AccidentReport | null; // 未完成的事故报告
  'user_preferences': {
    defaultDamageType: DamageType;
    measurementUnit: 'cm' | 'inch';
  };
}

// 保存历史记录
function saveToHistory(report: AccidentReport): void {
  const history = getFromStorage('accident_history') || [];
  history.unshift(report);
  // 保留最近30条
  setToStorage('accident_history', history.slice(0, 30));
}
```

## 7. 响应式适配

### 断点定义
```javascript
// Tailwind 默认断点
sm: 640px   // 大手机
md: 768px   // 平板竖屏
lg: 1024px  // 平板横屏 / 小桌面
xl: 1280px  // 桌面
2xl: 1536px // 大桌面
```

### 移动端优化
- **触摸手势**：支持双指缩放画布
- **底部抽屉**：分析结果使用抽屉组件
- **虚拟键盘**：地址输入时自动调整布局
- **离线支持**：Service Worker缓存关键资源

## 8. 性能优化

1. **图片压缩**：上传前压缩到合理尺寸（最大1920px）
2. **Canvas优化**：使用离屏Canvas减少重绘
3. **懒加载**：非首屏组件使用 React.lazy
4. **防抖**：搜索和估算计算使用防抖
5. **虚拟列表**：历史记录使用虚拟滚动

## 9. 无障碍考虑

- 所有交互元素有清晰的焦点状态
- 图片有替代文本描述
- 颜色对比度符合 WCAG 2.1 AA 标准
- 支持键盘导航
- ARIA 标签完整

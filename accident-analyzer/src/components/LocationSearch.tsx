import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  Navigation,
  Phone,
  Star,
  Wrench,
  Building2,
  AlertTriangle,
  Loader2,
  Locate
} from 'lucide-react';
import { useAccidentStore } from '../stores/accidentStore';
import { ServicePoint } from '../types';

type ServiceType = 'repair' | 'insurance' | 'police';

const serviceIcons = {
  repair: <Wrench className="w-4 h-4" />,
  insurance: <Building2 className="w-4 h-4" />,
  police: <AlertTriangle className="w-4 h-4" />
};

const serviceLabels = {
  repair: '维修厂',
  insurance: '保险公司',
  police: '交警部门'
};

const LocationSearch: React.FC = () => {
  const { location, setLocation, nearbyServices, searchNearbyServices } = useAccidentStore();
  const [address, setAddress] = useState(location?.address || '');
  const [selectedType, setSelectedType] = useState<ServiceType>('repair');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!address.trim() && !location) return;
    setIsSearching(true);

    if (address.trim()) {
      setLocation({
        lat: 39.9042 + (Math.random() - 0.5) * 0.1,
        lng: 116.4074 + (Math.random() - 0.5) * 0.1,
        address: address
      });
    }

    await new Promise(resolve => setTimeout(resolve, 800));
    await searchNearbyServices(selectedType);
    setIsSearching(false);
  }, [address, location, selectedType, setLocation, searchNearbyServices]);

  const handleLocate = useCallback(async () => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持定位功能');
      return;
    }

    setIsLocating(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });

      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        address: '当前位置'
      });

      await searchNearbyServices(selectedType);
    } catch (error) {
      console.error('定位失败:', error);
      alert('定位失败，请手动输入地址或检查定位权限');
    } finally {
      setIsLocating(false);
    }
  }, [selectedType, setLocation, searchNearbyServices]);

  const handleCall = useCallback((phone: string) => {
    window.location.href = `tel:${phone}`;
  }, []);

  const handleNavigate = useCallback((service: ServicePoint) => {
    const url = `https://maps.apple.com/?daddr=${service.address}`;
    window.open(url, '_blank');
  }, []);

  const handleTypeChange = useCallback(async (type: ServiceType) => {
    setSelectedType(type);
    if (location) {
      setIsSearching(true);
      await searchNearbyServices(type);
      setIsSearching(false);
    }
  }, [location, searchNearbyServices]);

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-slate-200">周边服务查询</h3>
      </div>

      <div className="flex gap-2">
        {(Object.keys(serviceLabels) as ServiceType[]).map(type => (
          <motion.button
            key={type}
            onClick={() => handleTypeChange(type)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2
              ${selectedType === type
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }
            `}
          >
            {serviceIcons[type]}
            {serviceLabels[type]}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="输入地址或位置..."
            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <motion.button
          onClick={handleLocate}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isLocating}
          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
          ) : (
            <Locate className="w-5 h-5 text-slate-300" />
          )}
        </motion.button>
        <motion.button
          onClick={handleSearch}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSearching}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            '搜索'
          )}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8"
          >
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>搜索中...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSearching && nearbyServices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h4 className="text-sm font-medium text-slate-400 mb-3">
            找到 {nearbyServices.length} 个{serviceLabels[selectedType]}
          </h4>
          {nearbyServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${selectedType === 'repair' ? 'bg-blue-500/20 text-blue-400' :
                      selectedType === 'insurance' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-red-500/20 text-red-400'}
                  `}>
                    {serviceIcons[selectedType]}
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-200">{service.name}</h5>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">{service.distance}</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        {service.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3 pl-13">{service.address}</p>
              <div className="flex gap-2 pl-13">
                {service.phone && (
                  <motion.button
                    onClick={() => handleCall(service.phone!)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    拨打电话
                  </motion.button>
                )}
                <motion.button
                  onClick={() => handleNavigate(service)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  导航前往
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isSearching && nearbyServices.length === 0 && !location && (
        <div className="text-center py-8 text-slate-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>输入地址或定位当前位置</p>
          <p className="text-sm mt-1">查找附近的维修厂、保险公司或交警部门</p>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;

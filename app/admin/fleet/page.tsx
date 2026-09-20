import React from 'react';
import { Bike, MapPin, CheckCircle2, Clock, AlertCircle, Phone } from 'lucide-react';

export const metadata = { title: 'Delivery Fleet | Foodie Admin' };

const DRIVERS = [
  { name: 'Ramesh K.', phone: '+91 98765 43210', status: 'on_delivery', location: 'Koramangala, Bangalore', orders: 28, rating: 4.8, vehicle: 'Bike • KA-01-AB-1234' },
  { name: 'Sunil M.', phone: '+91 87654 32109', status: 'available', location: 'Indiranagar, Bangalore', orders: 34, rating: 4.6, vehicle: 'Bike • KA-02-CD-5678' },
  { name: 'Vijay T.', phone: '+91 76543 21098', status: 'on_delivery', location: 'HSR Layout, Bangalore', orders: 19, rating: 4.9, vehicle: 'Scooter • KA-03-EF-9012' },
  { name: 'Arun P.', phone: '+91 65432 10987', status: 'offline', location: 'Last seen: BTM Layout', orders: 12, rating: 4.2, vehicle: 'Bike • KA-04-GH-3456' },
  { name: 'Deepak S.', phone: '+91 54321 09876', status: 'available', location: 'Whitefield, Bangalore', orders: 41, rating: 4.7, vehicle: 'Bike • KA-05-IJ-7890' },
  { name: 'Kiran B.', phone: '+91 43210 98765', status: 'on_delivery', location: 'Electronic City, Bangalore', orders: 22, rating: 4.5, vehicle: 'Scooter • KA-06-KL-2345' },
];

const STATUS_CONFIG: Record<string, { label: string; style: string; dot: string }> = {
  on_delivery: { label: 'On Delivery', style: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
  available: { label: 'Available', style: 'bg-green-50 text-green-700 border border-green-200', dot: 'bg-green-500' },
  offline: { label: 'Offline', style: 'bg-gray-100 text-gray-500 border border-gray-200', dot: 'bg-gray-400' },
};

export default function DeliveryFleetPage() {
  const activeCount = DRIVERS.filter(d => d.status !== 'offline').length;
  const onDelivery = DRIVERS.filter(d => d.status === 'on_delivery').length;
  const available = DRIVERS.filter(d => d.status === 'available').length;

  return (
    <div>
      {/* Header Row */}
      <div className="flex items-center justify-between w-full mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Admin / Management</p>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
            Delivery Fleet
            <span className="ml-2 text-sm font-semibold text-gray-400">({DRIVERS.length} drivers)</span>
          </h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'On Delivery', value: onDelivery, icon: Bike, color: 'text-blue-600 bg-blue-50' },
          { label: 'Available', value: available, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
          { label: 'Offline', value: DRIVERS.filter(d => d.status === 'offline').length, icon: AlertCircle, color: 'text-gray-500 bg-gray-100' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Driver Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DRIVERS.map((driver) => {
          const statusCfg = STATUS_CONFIG[driver.status];
          return (
            <div key={driver.name} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-orange-100 transition-all duration-200" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center font-bold text-orange-600 text-sm">
                      {driver.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusCfg.dot}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{driver.name}</p>
                    <p className="text-xs text-gray-400">{driver.vehicle}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusCfg.style}`}>{statusCfg.label}</span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{driver.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>{driver.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800">{driver.orders}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Deliveries</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-800">⭐ {driver.rating}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rating</p>
                </div>
                <button className="text-xs font-bold px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                  Track
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useGameStore } from '../lib/stores/useGameStore';
import PayPalButton from './PayPalButton';

interface GemPackage {
  id: string;
  gems: number;
  price: string;
  bonus?: number;
  popular?: boolean;
}

const GEM_PACKAGES: GemPackage[] = [
  {
    id: 'starter',
    gems: 100,
    price: '0.99',
  },
  {
    id: 'basic',
    gems: 500,
    price: '4.99',
    bonus: 50,
  },
  {
    id: 'premium',
    gems: 1200,
    price: '9.99',
    bonus: 200,
    popular: true,
  },
  {
    id: 'mega',
    gems: 2500,
    price: '19.99',
    bonus: 500,
  },
  {
    id: 'ultimate',
    gems: 6000,
    price: '49.99',
    bonus: 1500,
  },
];

interface StoreProps {
  onClose: () => void;
}

const Store = ({ onClose }: StoreProps) => {
  const { playerData, addGems } = useGameStore();
  const [selectedPackage, setSelectedPackage] = useState<GemPackage | null>(null);

  const handlePurchaseSuccess = (pkg: GemPackage) => {
    const totalGems = pkg.gems + (pkg.bonus || 0);
    addGems(totalGems);
    setSelectedPackage(null);
    console.log(`Purchase successful! Added ${totalGems} gems`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 to-purple-900 p-8 rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-purple-500/50 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Gem Store
            </h2>
            <p className="text-white/60 mt-1">Purchase premium Gems to unlock legendary gladiators</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-3xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Current Balance */}
        <div className="bg-black/40 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">💎</div>
            <div>
              <div className="text-white/60 text-sm">Your Gems</div>
              <div className="text-2xl font-bold text-purple-400">{playerData.gems}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-4xl">✨</div>
            <div>
              <div className="text-white/60 text-sm">Your Stardust</div>
              <div className="text-2xl font-bold text-yellow-400">{playerData.stardust}</div>
            </div>
          </div>
        </div>

        {/* Package Selection or Payment */}
        {!selectedPackage ? (
          <>
            <div className="text-white/80 mb-4 text-center">
              Select a Gem package to purchase
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GEM_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 transition-all hover:scale-105 cursor-pointer ${
                    pkg.popular
                      ? 'border-yellow-500 shadow-lg shadow-yellow-500/50'
                      : 'border-purple-500/30 hover:border-purple-500/70'
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      BEST VALUE
                    </div>
                  )}
                  
                  <div className="text-center space-y-3">
                    <div className="text-5xl">💎</div>
                    <div className="text-3xl font-bold text-purple-400">
                      {pkg.gems.toLocaleString()}
                      {pkg.bonus && (
                        <span className="text-lg text-green-400"> +{pkg.bonus}</span>
                      )}
                    </div>
                    <div className="text-white/60 text-sm">Gems</div>
                    <div className="text-2xl font-bold text-white">${pkg.price}</div>
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all">
                      Purchase
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-black/40 rounded-lg p-8 space-y-6">
            <button
              onClick={() => setSelectedPackage(null)}
              className="text-white/60 hover:text-white flex items-center space-x-2 mb-4"
            >
              <span>←</span>
              <span>Back to packages</span>
            </button>
            
            <div className="text-center space-y-4">
              <div className="text-5xl">💎</div>
              <div>
                <div className="text-3xl font-bold text-purple-400">
                  {selectedPackage.gems.toLocaleString()}
                  {selectedPackage.bonus && (
                    <span className="text-lg text-green-400"> +{selectedPackage.bonus}</span>
                  )}
                </div>
                <div className="text-white/60">Gems</div>
              </div>
              <div className="text-2xl font-bold text-white">${selectedPackage.price}</div>
              
              <div className="pt-4">
                <div className="text-white/80 mb-4">Complete your purchase with PayPal</div>
                <div className="flex justify-center">
                  <PayPalButton
                    amount={selectedPackage.price}
                    currency="USD"
                    intent="CAPTURE"
                    onSuccess={() => handlePurchaseSuccess(selectedPackage)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
          <div className="text-blue-300 font-bold mb-2">💡 About Gems</div>
          <ul className="text-white/60 text-sm space-y-1">
            <li>• Gems are premium currency used to unlock legendary gladiators</li>
            <li>• Stardust (free currency) can unlock common, rare, and epic gladiators</li>
            <li>• All purchases are processed securely through PayPal</li>
            <li>• Gems are added to your account instantly after payment</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Store;

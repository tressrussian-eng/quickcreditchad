'use client';

import { useRouter } from 'next/navigation';
import { CircleAlert, ArrowRight, Wallet } from 'lucide-react';
import { SharedLayout } from '@/components/shared-layout';

export default function SuccessPage() {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <SharedLayout>
      {/* Success Section */}
      <div className="flex flex-col items-center justify-center py-6 sm:py-12">
        <CircleAlert className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 mb-4 sm:mb-6 animate-bounce" />
        
        <h2 className="text-2xl sm:text-4xl font-black text-black mb-2 sm:mb-4 text-center">Prêt refusé !</h2>
        <p className="text-gray-500 text-sm sm:text-lg mb-6 sm:mb-12 text-center">Votre prêt a été refusé.</p>

        {/* Loan Details Card */}
        <div className="bg-red-50 border-2 border-red-300 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 w-full">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            <span className="text-black font-bold text-lg sm:text-xl">Airtel inactif</span>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base mb-2">Veuillez déposer au moins</p>
            <h3 className="text-3xl sm:text-4xl font-black text-green-600">10 USD</h3>
            <p className="text-gray-600 text-sm sm:text-base mt-2">sur votre compte Airtel pour l’activer et faire une nouvelle demande.</p>
          </div>
        </div>

        {/* Important Info */}
        <div className="bg-red-50 border-2 border-red-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 w-full">
          <p className="text-black font-semibold text-sm sm:text-base">
            ✓ Les fonds seront transférés sur votre compte dans un délai de 30 minutes.
          </p>
          <p className="text-black font-semibold text-sm sm:text-base mt-2">
           ✓ Période de remboursement du prêt : 12 mois
          </p>
        </div>

        {/* Dashboard Button */}
        <button
        onClick={handleBackToLogin}
        className="w-full bg-red-400 text-black font-bold text-base sm:text-xl py-3 sm:py-4 rounded-lg sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 hover:bg-red-500 transition-colors mb-3 sm:mb-4">
         Aller au tableau de bord
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Back to Login */}
        <button 
          onClick={handleBackToLogin}
          className="w-full text-center text-gray-500 hover:text-black text-sm sm:text-base transition-colors">
          
        </button>
      </div>
    </SharedLayout>
  );
}

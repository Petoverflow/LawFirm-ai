import React from 'react';

const Disclaimer: React.FC = () => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 text-xs sm:text-sm text-amber-800 rounded-r shadow-sm">
      <div className="flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <span className="font-bold mr-1">법적 고지:</span>
      </div>
      <p className="mt-1">
        LawBot AI가 제공하는 정보는 법적 조언이 아닌 일반적인 정보 제공을 목적으로 합니다. 
        실제 소송이나 법적 판단이 필요한 경우 반드시 변호사 등 법률 전문가의 자문을 구하시기 바랍니다. 
        AI는 최신 정보를 검색하지만 오류가 있을 수 있습니다.
      </p>
    </div>
  );
};

export default Disclaimer;
'use client';

import { 
  DollarSignIcon,
  TrendingUpIcon,
  CalendarIcon,
  UsersIcon,
  CheckCircleIcon
} from 'lucide-react';

interface FundingRound {
  id: string;
  round: string;
  amount: string;
  date: string;
  investors: string[];
  leadInvestor?: string;
}

interface FundingTimelineProps {
  fundingRounds: FundingRound[];
}

export function FundingTimeline({ fundingRounds }: FundingTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoundColor = (round: string) => {
    const colors = {
      'Pre-Seed': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'Seed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'Series A': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'Series B': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'Series C': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'Series D+': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    };
    return colors[round as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const totalFunding = fundingRounds.reduce((total, round) => {
    const amount = parseFloat(round.amount.replace(/[$M]/g, ''));
    return total + amount;
  }, 0);

  // Sort rounds by date (most recent first)
  const sortedRounds = [...fundingRounds].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-8">
      {/* Funding Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Funding Timeline
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              ${totalFunding.toFixed(1)}M
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Raised
            </div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {fundingRounds.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Funding Rounds
            </div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {sortedRounds[0]?.round || 'N/A'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Latest Round
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          
          <div className="space-y-8">
            {sortedRounds.map((round, index) => (
              <div key={round.id} className="relative flex items-start space-x-6">
                {/* Timeline dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-800"></div>
                  {index === 0 && (
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-600 rounded-full animate-ping opacity-20"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoundColor(round.round)}`}>
                          {round.round}
                        </span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {round.amount}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2 sm:mt-0">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(round.date)}
                      </div>
                    </div>

                    {/* Lead Investor */}
                    {round.leadInvestor && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUpIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Lead Investor:
                          </span>
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {round.leadInvestor}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Investors */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <UsersIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Investors ({round.investors.length}):
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {round.investors.map((investor, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-500"
                          >
                            {investor === round.leadInvestor && (
                              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                            )}
                            {investor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Investor Spotlight */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Notable Investors
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Andreessen Horowitz', 'Sequoia Capital', 'Y Combinator'].map((investor) => (
            <div key={investor} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <img
                src={`https://ui-avatars.com/api/?name=${investor}&background=6366f1&color=fff&size=40`}
                alt={investor}
                className="w-10 h-10 rounded-lg"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{investor}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Venture Capital</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funding Growth Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Funding Growth
        </h3>
        
        <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Interactive funding chart would be displayed here
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Showing cumulative funding over time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

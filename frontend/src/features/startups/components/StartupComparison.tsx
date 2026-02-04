'use client';

import { Startup } from '../types';

interface StartupComparisonProps {
  startups: Startup[];
  isLoading?: boolean;
}

export function StartupComparison({ startups, isLoading = false }: StartupComparisonProps) {
  if (startups.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-slate-600">Select startups to compare</p>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Funding Stage',
      getValue: (s: Startup) => s.fundingStage.replace(/_/g, ' '),
    },
    {
      label: 'Total Funded',
      getValue: (s: Startup) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: 'compact',
        }).format(s.totalFunded),
    },
    {
      label: 'Founded',
      getValue: (s: Startup) => new Date(s.founded).getFullYear().toString(),
    },
    {
      label: 'Location',
      getValue: (s: Startup) => `${s.location.city}, ${s.location.country}`,
    },
    {
      label: 'Industry',
      getValue: (s: Startup) => s.industry,
    },
    {
      label: 'Followers',
      getValue: (s: Startup) => s.followersCount.toLocaleString(),
    },
    {
      label: 'Employees',
      getValue: (s: Startup) => s.employeeCount || 'N/A',
    },
    {
      label: 'Status',
      getValue: (s: Startup) => s.status,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full">
        <tbody>
          <tr className="border-b">
            <td className="px-6 py-4 font-bold text-slate-900 bg-slate-50">Metric</td>
            {startups.map((startup) => (
              <td key={startup.id} className="px-6 py-4 border-l">
                <div className="text-center">
                  {startup.logo && (
                    <img
                      src={startup.logo}
                      alt={startup.name}
                      className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                    />
                  )}
                  <p className="font-bold text-slate-900">{startup.name}</p>
                  <p className="text-xs text-slate-500">{startup.tagline}</p>
                </div>
              </td>
            ))}
          </tr>

          {metrics.map((metric) => (
            <tr key={metric.label} className="border-b hover:bg-slate-50">
              <td className="px-6 py-4 font-semibold text-slate-900 bg-slate-50 sticky left-0">
                {metric.label}
              </td>
              {startups.map((startup) => (
                <td
                  key={`${startup.id}-${metric.label}`}
                  className="px-6 py-4 border-l text-center text-slate-700"
                >
                  {metric.getValue(startup)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

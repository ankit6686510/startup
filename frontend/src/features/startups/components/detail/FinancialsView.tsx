import { LockIcon, DownloadIcon, TrendingUpIcon, DollarSignIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinancialsView({ startupId }: { startupId: string }) {
    // Mock data
    const milestones = [
        { title: 'Series A Funding', date: 'March 2024', amount: '$12M' },
        { title: 'crossed $1M ARR', date: 'Jan 2024', amount: null },
        { title: 'Seed Funding', date: 'Aug 2023', amount: '$2.5M' }
    ];

    return (
        <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <DollarSignIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="font-medium text-gray-600 dark:text-gray-400">Total Raised</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">$15.2M</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <TrendingUpIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-medium text-gray-600 dark:text-gray-400">Valuation</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">$60M <span className="text-sm font-normal text-gray-500">(Est.)</span></p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <LockIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-medium text-gray-600 dark:text-gray-400">Burn Rate</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">Verified Investors Only</span>
                    </div>
                </div>
            </div>

            {/* Financial Reports (Locked) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Financial Reports</h3>
                    <Button variant="outline" disabled>Request Access</Button>
                </div>
                <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/50">
                    <LockIcon className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Investor Access Required</h4>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Detailed financial statements including PL, Balance Sheets, and Cash Flow are available only to verified investors.
                    </p>
                    <Button>Verify Investor Status</Button>
                </div>
            </div>

            {/* Milestones */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Key Milestones</h3>
                <div className="space-y-6">
                    {milestones.map((m, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 ring-4 ring-blue-50 dark:ring-blue-900/20"></div>
                                {i !== milestones.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 dark:bg-gray-700 my-1"></div>}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">{m.title}</h4>
                                <p className="text-sm text-gray-500">{m.date}</p>
                                {m.amount && <span className="inline-block mt-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded">{m.amount}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

'use client';

import Link from 'next/link';
import { Founder } from '../types';

interface TeamSectionProps {
  team: Founder[];
  isLoading?: boolean;
}

export function TeamSection({ team, isLoading = false }: TeamSectionProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-3" />
              <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (team.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Team</h2>
        <p className="text-slate-600">No team information available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <div key={member.id} className="text-center">
            {member.image && (
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-3 object-cover"
              />
            )}
            {!member.image && (
              <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {member.name.charAt(0)}
              </div>
            )}
            <h3 className="font-bold text-slate-900">{member.name}</h3>
            <p className="text-sm text-slate-600">{member.role}</p>
            {member.bio && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{member.bio}</p>}
            {member.linkedIn && (
              <a
                href={member.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                LinkedIn →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

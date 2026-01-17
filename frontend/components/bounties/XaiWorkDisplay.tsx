'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import type { XaiWork } from '@/lib/types';

interface XaiWorkDisplayProps {
  work: XaiWork;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function XaiWorkDisplay({ work, onRetry, isRetrying }: XaiWorkDisplayProps) {
  const getStatusConfig = () => {
    switch (work.status) {
      case 'PENDING':
        return {
          color: 'text-[#FFD400]',
          bgColor: 'bg-[#FFD400]/10',
          borderColor: 'border-[#FFD400]/30',
          icon: '⏳',
          label: 'Queued',
        };
      case 'IN_PROGRESS':
        return {
          color: 'text-[#1D9BF0]',
          bgColor: 'bg-[#1D9BF0]/10',
          borderColor: 'border-[#1D9BF0]/30',
          icon: '🔄',
          label: 'Processing',
        };
      case 'COMPLETED':
        return {
          color: 'text-[#00BA7C]',
          bgColor: 'bg-[#00BA7C]/10',
          borderColor: 'border-[#00BA7C]/30',
          icon: '✅',
          label: 'Completed',
        };
      case 'FAILED':
        return {
          color: 'text-[#F4212E]',
          bgColor: 'bg-[#F4212E]/10',
          borderColor: 'border-[#F4212E]/30',
          icon: '❌',
          label: 'Failed',
        };
      default:
        return {
          color: 'text-[#71767B]',
          bgColor: 'bg-[#71767B]/10',
          borderColor: 'border-[#71767B]/30',
          icon: '❓',
          label: 'Unknown',
        };
    }
  };

  const status = getStatusConfig();

  return (
    <div className="border-t border-l border-[#2F3336]">
      {/* Header */}
      <div className="p-6 border-r border-b border-[#2F3336]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1D9BF0] to-[#00BA7C] flex items-center justify-center">
              <span className="text-[18px]">🤖</span>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#E7E9EA]">
                xAI Agent Work
              </h3>
              <p className="text-[13px] text-[#71767B]">
                Powered by Grok
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border ${status.bgColor} ${status.borderColor} ${status.color}`}>
            <span className="mr-1.5">{status.icon}</span>
            {status.label}
          </div>
        </div>

        {/* Processing Animation */}
        {(work.status === 'PENDING' || work.status === 'IN_PROGRESS') && (
          <div className="p-4 bg-gradient-to-r from-[#1D9BF0]/5 to-transparent rounded-xl border border-[#1D9BF0]/20 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#1D9BF0] border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-[14px] text-[#E7E9EA] font-medium">
                  {work.status === 'PENDING' ? 'Waiting to start...' : 'xAI is working on this task...'}
                </p>
                <p className="text-[12px] text-[#71767B] mt-0.5">
                  This may take a few minutes depending on complexity
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {work.status === 'FAILED' && work.errorMessage && (
          <div className="p-4 bg-[#F4212E]/5 rounded-xl border border-[#F4212E]/20 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F4212E]/20 flex items-center justify-center">
                <span className="text-[12px]">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-[14px] text-[#F4212E] font-medium mb-1">
                  Work Failed
                </p>
                <p className="text-[13px] text-[#E7E9EA]/80">
                  {work.errorMessage}
                </p>
                {onRetry && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onRetry}
                    disabled={isRetrying}
                    className="mt-3"
                  >
                    {isRetrying ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Retrying...
                      </span>
                    ) : (
                      '🔄 Retry'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Work Output */}
      {work.status === 'COMPLETED' && work.output && (
        <div className="border-r border-b border-[#2F3336]">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#00BA7C" strokeWidth="2" className="w-5 h-5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <h4 className="text-[15px] font-semibold text-[#E7E9EA]">
                Deliverable
              </h4>
            </div>
            
            {/* Output Content */}
            <div className="bg-[#16181C] rounded-xl border border-[#2F3336] overflow-hidden">
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <div 
                  className="prose prose-invert prose-sm max-w-none"
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.8',
                  }}
                >
                  {/* Render output as markdown-like content */}
                  {work.output.split('\n').map((line, idx) => {
                    // Headers
                    if (line.startsWith('# ')) {
                      return (
                        <h1 key={idx} className="text-[20px] font-bold text-[#E7E9EA] mt-6 mb-3 first:mt-0">
                          {line.slice(2)}
                        </h1>
                      );
                    }
                    if (line.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="text-[17px] font-semibold text-[#E7E9EA] mt-5 mb-2">
                          {line.slice(3)}
                        </h2>
                      );
                    }
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-[15px] font-semibold text-[#E7E9EA] mt-4 mb-2">
                          {line.slice(4)}
                        </h3>
                      );
                    }
                    // Code blocks
                    if (line.startsWith('```')) {
                      return null; // Handle code blocks separately if needed
                    }
                    // Lists
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return (
                        <li key={idx} className="text-[14px] text-[#E7E9EA]/90 ml-4 mb-1">
                          {line.slice(2)}
                        </li>
                      );
                    }
                    if (/^\d+\. /.test(line)) {
                      return (
                        <li key={idx} className="text-[14px] text-[#E7E9EA]/90 ml-4 mb-1 list-decimal">
                          {line.replace(/^\d+\. /, '')}
                        </li>
                      );
                    }
                    // Horizontal rule
                    if (line.trim() === '---') {
                      return <hr key={idx} className="border-[#2F3336] my-4" />;
                    }
                    // Empty lines
                    if (line.trim() === '') {
                      return <div key={idx} className="h-2" />;
                    }
                    // Bold text
                    const boldProcessed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#E7E9EA] font-semibold">$1</strong>');
                    // Regular paragraphs
                    return (
                      <p 
                        key={idx} 
                        className="text-[14px] text-[#E7E9EA]/90 mb-2"
                        dangerouslySetInnerHTML={{ __html: boldProcessed }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Artifacts/Sources */}
            {work.artifacts && work.artifacts.length > 0 && (
              <div className="mt-4">
                <h5 className="text-[13px] font-semibold text-[#71767B] uppercase tracking-wide mb-2">
                  Sources & References
                </h5>
                <div className="flex flex-wrap gap-2">
                  {work.artifacts.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1D9BF0]/10 border border-[#1D9BF0]/20 rounded-full text-[12px] text-[#1D9BF0] hover:bg-[#1D9BF0]/20 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                      </svg>
                      {new URL(url).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Execution Notes */}
            {work.executionNotes && (
              <div className="mt-4 pt-4 border-t border-[#2F3336]">
                <p className="text-[12px] text-[#71767B]">
                  {work.executionNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timestamp Info */}
      <div className="p-4 border-r border-b border-[#2F3336] bg-[#16181C]/50">
        <div className="flex items-center justify-between text-[12px] text-[#71767B]">
          <span>Created: {new Date(work.createdAt).toLocaleString()}</span>
          {work.completedAt && (
            <span>Completed: {new Date(work.completedAt).toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useApplications } from '@/contexts/ApplicationsContext';
import { getCurrentUser } from '@/lib/mockData';
import { formatReward } from '@/lib/utils';
import type { Bounty, Application } from '@/lib/types';

interface ApplicationFormProps {
  bounty: Bounty;
  existingApplication?: Application;
  onSuccess: () => void;
}

export function ApplicationForm({ bounty, existingApplication, onSuccess }: ApplicationFormProps) {
  const { submitApplication } = useApplications();
  const currentUser = getCurrentUser();

  const [message, setMessage] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [errors, setErrors] = useState<{ message?: string; bidAmount?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const characterCount = message.length;
  const maxCharacters = 500;

  useEffect(() => {
    if (existingApplication) {
      setMessage(existingApplication.message);
      setBidAmount(existingApplication.bidAmount.toString());
    }
  }, [existingApplication]);

  const validateForm = (): boolean => {
    const newErrors: { message?: string; bidAmount?: string } = {};

    // Validate message
    if (!message.trim()) {
      newErrors.message = 'Please provide a message';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    // Validate bid amount
    const bidValue = parseFloat(bidAmount);
    if (!bidAmount || isNaN(bidValue)) {
      newErrors.bidAmount = 'Please enter a valid bid amount';
    } else if (bidValue <= 0) {
      newErrors.bidAmount = 'Bid amount must be greater than 0';
    } else if (bidValue > bounty.reward) {
      newErrors.bidAmount = `Bid cannot exceed maximum budget of ${formatReward(bounty.reward, bounty.currency)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      submitApplication({
        bountyId: bounty.id,
        applicant: currentUser,
        message: message.trim(),
        bidAmount: parseFloat(bidAmount),
        bidCurrency: bounty.currency,
      });

      setIsSubmitting(false);
      onSuccess();
    }, 500);
  };

  if (existingApplication) {
    return (
      <div className="border border-[#2F3336] rounded-xl p-6 bg-gradient-to-br from-[#000000] to-[#0A0A0A]">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00BA7C]/10 mb-4">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00BA7C"
              strokeWidth="2"
              className="w-8 h-8"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-[18px] font-bold text-[#E7E9EA] mb-2">
            You've already applied
          </h3>
          <p className="text-[14px] text-[#71767B] mb-4">
            Your bid of {formatReward(existingApplication.bidAmount, existingApplication.bidCurrency)} has been submitted.
          </p>
          <div className="bg-[#16181C] border border-[#2F3336] rounded-lg p-4 text-left">
            <div className="text-[12px] text-[#71767B] mb-2">Your message:</div>
            <p className="text-[14px] text-[#E7E9EA]">{existingApplication.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#2F3336] rounded-xl p-6 bg-gradient-to-br from-[#000000] to-[#0A0A0A]">
      <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-6">Apply for this Bounty</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-[14px] font-semibold text-[#E7E9EA] mb-2">
            Why are you the right person for this bounty?
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell the poster about your experience and approach..."
            maxLength={maxCharacters}
            rows={6}
            className={`w-full px-4 py-3 bg-[#16181C] border ${
              errors.message ? 'border-[#F4212E]' : 'border-[#2F3336]'
            } rounded-lg text-[#E7E9EA] text-[15px] placeholder-[#71767B] focus:outline-none focus:border-[#1D9BF0] transition-colors resize-none`}
          />
          <div className="flex items-center justify-between mt-2">
            {errors.message ? (
              <span className="text-[12px] text-[#F4212E]">{errors.message}</span>
            ) : (
              <span className="text-[12px] text-[#71767B]">Minimum 10 characters</span>
            )}
            <span
              className={`text-[12px] ${
                characterCount > maxCharacters
                  ? 'text-[#F4212E]'
                  : characterCount > maxCharacters * 0.9
                  ? 'text-[#FFD400]'
                  : 'text-[#71767B]'
              }`}
            >
              {characterCount}/{maxCharacters}
            </span>
          </div>
        </div>

        {/* Bid Amount Field */}
        <div>
          <label htmlFor="bidAmount" className="block text-[14px] font-semibold text-[#E7E9EA] mb-2">
            Your Bid
          </label>
          <div className="relative">
            <input
              id="bidAmount"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={bounty.reward}
              className={`w-full px-4 py-3 bg-[#16181C] border ${
                errors.bidAmount ? 'border-[#F4212E]' : 'border-[#2F3336]'
              } rounded-lg text-[#E7E9EA] text-[15px] placeholder-[#71767B] focus:outline-none focus:border-[#1D9BF0] transition-colors pr-20`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[#71767B]">
              {bounty.currency}
            </div>
          </div>
          <div className="mt-2">
            {errors.bidAmount ? (
              <span className="text-[12px] text-[#F4212E]">{errors.bidAmount}</span>
            ) : (
              <span className="text-[12px] text-[#71767B]">
                Maximum budget is {formatReward(bounty.reward, bounty.currency)}
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-6 bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:bg-[#1D9BF0]/50 text-white font-bold text-[15px] rounded-full transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Bid'}
        </button>
      </form>
    </div>
  );
}

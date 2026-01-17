'use client';

import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useApplications } from '@/contexts/ApplicationsContext';
import { formatReward } from '@/lib/utils';
import type { Bounty, Application } from '@/lib/types';
import api from '@/lib/api';

interface ApplicationFormProps {
  bounty: Bounty;
  existingApplication?: Application;
  onSuccess: () => void;
}

export function ApplicationForm({ bounty, existingApplication, onSuccess }: ApplicationFormProps) {
  const { currentUser, isAuthenticated, login, isAdmin } = useUser();
  const { submitApplication } = useApplications();

  const [twitterHandle, setTwitterHandle] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState<string>('');
  const [step, setStep] = useState<'auth' | 'profile' | 'apply'>(
    isAuthenticated ? 'apply' : 'auth'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const characterCount = coverLetter.length;
  const maxCharacters = 500;
  const maxBudget = bounty.reward;

  // If user is admin, show different message
  if (isAdmin) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1D9BF0]/10 mb-4">
          <svg viewBox="0 0 24 24" fill="#1D9BF0" className="w-8 h-8">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </div>
        <h3 className="text-[18px] font-bold text-[#E7E9EA] mb-2">
          Admin View
        </h3>
        <p className="text-[14px] text-[#71767B]">
          As an admin, you manage this bounty. View applications from the dashboard.
        </p>
      </div>
    );
  }

  // Already applied
  if (existingApplication) {
    return (
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
        <p className="text-[14px] text-[#71767B] mb-2">
          Your application has been submitted. Status: {existingApplication.status}
        </p>
        {existingApplication.bidAmount > 0 && (
          <p className="text-[20px] font-bold text-[#1D9BF0] mb-4">
            Your bid: {formatReward(existingApplication.bidAmount, existingApplication.bidCurrency)}
          </p>
        )}
        {existingApplication.coverLetter && (
          <div className="bg-[#16181C] border border-[#2F3336] rounded-lg p-4 text-left">
            <div className="text-[12px] text-[#71767B] mb-2">Your message:</div>
            <p className="text-[14px] text-[#E7E9EA]">{existingApplication.coverLetter}</p>
          </div>
        )}
      </div>
    );
  }

  // Auth step - get username
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!twitterHandle.trim()) {
      newErrors.twitterHandle = 'Twitter/X username is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Register or login
      await login(twitterHandle.replace('@', ''), twitterHandle.replace('@', ''));
      setStep('profile');
    } catch (err) {
      setErrors({ twitterHandle: 'Failed to authenticate. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Profile step - create applicant profile
  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!portfolioUrl.trim()) {
      newErrors.portfolioUrl = 'Portfolio/application link is required';
    } else if (!portfolioUrl.startsWith('http')) {
      newErrors.portfolioUrl = 'Please enter a valid URL starting with http';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Create applicant profile
      await api.createApplicantProfile({
        name: twitterHandle.replace('@', ''),
        twitterHandle: twitterHandle.replace('@', ''),
        portfolioUrl,
      });
      setStep('apply');
    } catch (err: any) {
      // Profile might already exist, continue to apply
      if (err.message?.includes('already exists') || err.message?.includes('UNIQUE')) {
        setStep('apply');
      } else {
        setErrors({ portfolioUrl: err.message || 'Failed to create profile' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Application step - submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const parsedBid = parseFloat(bidAmount);
    
    if (!bidAmount.trim()) {
      newErrors.bidAmount = 'Please enter your bid amount';
    } else if (isNaN(parsedBid) || parsedBid <= 0) {
      newErrors.bidAmount = 'Please enter a valid bid amount';
    } else if (maxBudget > 0 && parsedBid > maxBudget) {
      newErrors.bidAmount = `Bid cannot exceed the maximum budget of ${formatReward(maxBudget, bounty.currency)}`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplication(bounty.id, coverLetter || undefined, parsedBid);
      onSuccess();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to submit application' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-[#71767B] mb-2 font-medium">Apply</div>
      <h3 className="text-[20px] font-bold text-[#E7E9EA] mb-6">Apply for this Bounty</h3>

      {/* Step 1: Auth */}
      {step === 'auth' && (
        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label className="block text-[14px] font-semibold text-[#E7E9EA] mb-2">
              Your Twitter/X Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71767B]">@</span>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="username"
                className={`w-full pl-8 pr-4 py-3 bg-[#16181C] border ${
                  errors.twitterHandle ? 'border-[#F4212E]' : 'border-[#2F3336]'
                } rounded-lg text-[#E7E9EA] text-[15px] placeholder-[#71767B] focus:outline-none focus:border-[#1D9BF0] transition-colors`}
              />
            </div>
            {errors.twitterHandle && (
              <span className="text-[12px] text-[#F4212E] mt-1 block">{errors.twitterHandle}</span>
            )}
            <p className="text-[12px] text-[#71767B] mt-2">
              We'll use this to verify your identity and view your profile
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:bg-[#1D9BF0]/50 text-white font-bold text-[15px] rounded-full transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Connecting...' : 'Continue'}
          </button>
        </form>
      )}

      {/* Step 2: Profile */}
      {step === 'profile' && (
        <form onSubmit={handleProfile} className="space-y-6">
          <div>
            <label className="block text-[14px] font-semibold text-[#E7E9EA] mb-2">
              Link to Your Application/Portfolio
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://..."
              className={`w-full px-4 py-3 bg-[#16181C] border ${
                errors.portfolioUrl ? 'border-[#F4212E]' : 'border-[#2F3336]'
              } rounded-lg text-[#E7E9EA] text-[15px] placeholder-[#71767B] focus:outline-none focus:border-[#1D9BF0] transition-colors`}
            />
            {errors.portfolioUrl && (
              <span className="text-[12px] text-[#F4212E] mt-1 block">{errors.portfolioUrl}</span>
            )}
            <p className="text-[12px] text-[#71767B] mt-2">
              Link to your portfolio, GitHub, website, or relevant work samples
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('auth')}
              className="px-6 py-3 border border-[#2F3336] text-[#E7E9EA] font-bold text-[15px] rounded-full hover:bg-[#16181C] transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:bg-[#1D9BF0]/50 text-white font-bold text-[15px] rounded-full transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Setting up...' : 'Continue'}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Apply */}
      {step === 'apply' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bid Amount */}
          <div>
            <label htmlFor="bidAmount" className="block text-[14px] font-semibold text-[#E7E9EA] mb-2">
              Your Bid Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71767B] font-medium">$</span>
              <input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                max={maxBudget || undefined}
                step="0.01"
                className={`w-full pl-8 pr-4 py-3 bg-[#16181C] border ${
                  errors.bidAmount ? 'border-[#F4212E]' : 'border-[#2F3336]'
                } rounded-lg text-[#E7E9EA] text-[15px] placeholder-[#71767B] focus:outline-none focus:border-[#1D9BF0] transition-colors`}
              />
            </div>
            {errors.bidAmount && (
              <span className="text-[12px] text-[#F4212E] mt-1 block">{errors.bidAmount}</span>
            )}
            {maxBudget > 0 && (
              <p className="text-[12px] text-[#71767B] mt-2">
                Maximum budget: {formatReward(maxBudget, bounty.currency)}
              </p>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label htmlFor="coverLetter" className="block text-[14px] font-semibold text-[#E7E9EA] mb-2">
              Why are you the right person for this bounty? (Optional)
            </label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the poster about your experience and approach..."
              maxLength={maxCharacters}
              rows={4}
              className="w-full px-4 py-3 bg-[#16181C] border border-[#2F3336] rounded-lg text-[#E7E9EA] text-[15px] placeholder-[#71767B] focus:outline-none focus:border-[#1D9BF0] transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[12px] text-[#71767B]">Optional but recommended</span>
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

          {errors.submit && (
            <div className="p-3 border border-[#F4212E] bg-[#F4212E]/10 rounded-lg">
              <span className="text-[14px] text-[#F4212E]">{errors.submit}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('profile')}
              className="px-6 py-3 border border-[#2F3336] text-[#E7E9EA] font-bold text-[15px] rounded-full hover:bg-[#16181C] transition-all"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-[#1D9BF0] hover:bg-[#1A8CD8] disabled:bg-[#1D9BF0]/50 text-white font-bold text-[15px] rounded-full transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bid'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

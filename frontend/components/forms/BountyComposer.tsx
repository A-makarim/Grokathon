'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from './Input';
import { TextArea } from './TextArea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUser } from '@/contexts/UserContext';
import { useBounties } from '@/contexts/BountiesContext';
import { generateId } from '@/lib/utils';
import {
  BOUNTY_CATEGORIES,
  CURRENCIES,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
} from '@/lib/constants';
import type { BountyCategory, Currency } from '@/lib/types';

export function BountyComposer() {
  const router = useRouter();
  const { currentUser } = useUser();
  const { addBounty } = useBounties();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [category, setCategory] = useState<BountyCategory>('Development');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be ${MAX_TITLE_LENGTH} characters or less`;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
    }

    if (!reward || parseFloat(reward) <= 0) {
      newErrors.reward = 'Please enter a valid reward amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 10 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newBounty = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      reward: parseFloat(reward),
      currency,
      poster: currentUser,
      postedAt: new Date(),
      category,
      tags,
      status: 'open' as const,
      applicantCount: 0,
      viewCount: 0,
      bookmarkCount: 0,
      shareCount: 0,
    };

    addBounty(newBounty);
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <h1 className="text-[23px] font-bold text-[#E7E9EA] mb-6">
        Post a New Bounty
      </h1>

      {/* Title */}
      <div className="mb-6">
        <Input
          label="Title *"
          placeholder="Enter a clear, descriptive title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE_LENGTH}
          error={errors.title}
          helperText={`${title.length} / ${MAX_TITLE_LENGTH}`}
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <TextArea
          label="Description *"
          placeholder="Describe the bounty in detail. What needs to be done? What are the requirements?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={8}
          showCount
          error={errors.description}
        />
      </div>

      {/* Reward */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Input
          label="Maximum Budget *"
          type="number"
          placeholder="0"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          min="0"
          step="0.01"
          error={errors.reward}
          helperText="The maximum amount you're willing to pay"
        />
        <div>
          <label className="block text-[15px] font-medium text-[#E7E9EA] mb-2">
            Currency *
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full bg-transparent border border-[#2F3336] rounded-lg px-4 py-3 text-[15px] text-[#E7E9EA] outline-none focus:border-[#1D9BF0] transition-colors"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr} value={curr} className="bg-[#16181C]">
                {curr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-[15px] font-medium text-[#E7E9EA] mb-2">
          Category *
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as BountyCategory)}
          className="w-full bg-transparent border border-[#2F3336] rounded-lg px-4 py-3 text-[15px] text-[#E7E9EA] outline-none focus:border-[#1D9BF0] transition-colors"
        >
          {BOUNTY_CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-[#16181C]">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block text-[15px] font-medium text-[#E7E9EA] mb-2">
          Tags (Optional)
        </label>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddTag}
            disabled={!tagInput.trim() || tags.length >= 10}
          >
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="primary">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 hover:text-white"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-[13px] text-[#71767B] mt-2">
          {tags.length} / 10 tags
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-6 border-t border-[#2F3336]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/')}
          fullWidth
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" fullWidth>
          Post Bounty
        </Button>
      </div>
    </form>
  );
}

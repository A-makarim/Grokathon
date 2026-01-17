'use client';

import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBounties } from '@/contexts/BountiesContext';
import { BountyCard } from '@/components/bounties/BountyCard';

export default function Home() {
  const { bounties } = useBounties();
  
  const openBounties = bounties.filter(b => b.status === 'open');
  const totalRewards = bounties.reduce((sum, b) => sum + b.reward, 0);
  
  // Featured bounties - highest rewards
  const featuredBounties = openBounties
    .sort((a, b) => b.reward - a.reward)
    .slice(0, 3);

  // Recent bounties
  const recentBounties = openBounties
    .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
    .slice(0, 3);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col justify-center items-center text-center py-24">
        {/* Background watermark */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <span className="text-[20vw] font-bold text-[#0a0a0a] tracking-tighter leading-none">
            BOUNTIES
          </span>
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-medium text-[#E7E9EA] leading-[1.1] tracking-tight mb-8">
            Work that pays.
          </h1>
          
          <p className="text-[18px] text-[#71767B] leading-relaxed max-w-xl mx-auto mb-12">
            Find bounties that match your skills. Submit your bid. Get paid for quality work.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/browse">
              <button className="px-8 py-3 text-[14px] tracking-[0.1em] uppercase text-[#E7E9EA] border border-[#333] rounded-full hover:bg-[#E7E9EA] hover:text-[#000] transition-all duration-300">
                Browse Bounties ↗
              </button>
            </Link>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#71767B] animate-bounce">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-t border-[#2F3336]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-[48px] font-light text-[#E7E9EA] tracking-tight">
                {openBounties.length}
              </p>
              <p className="text-[13px] tracking-[0.15em] text-[#71767B] uppercase mt-2">
                Open Bounties
              </p>
            </div>
            <div className="text-center">
              <p className="text-[48px] font-light text-[#E7E9EA] tracking-tight">
                ${Math.floor(totalRewards / 1000)}k
              </p>
              <p className="text-[13px] tracking-[0.15em] text-[#71767B] uppercase mt-2">
                In Rewards
              </p>
            </div>
            <div className="text-center">
              <p className="text-[48px] font-light text-[#E7E9EA] tracking-tight">
                6
              </p>
              <p className="text-[13px] tracking-[0.15em] text-[#71767B] uppercase mt-2">
                Categories
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bounties */}
      <section className="py-24 border-t border-[#2F3336]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-[32px] font-medium text-[#E7E9EA] tracking-tight">
              High-value opportunities
            </h2>
            <Link href="/browse">
              <button className="px-6 py-2.5 text-[13px] tracking-[0.1em] uppercase text-[#71767B] border border-[#333] rounded-full hover:text-[#E7E9EA] hover:border-[#E7E9EA] transition-all duration-300">
                View All ↗
              </button>
            </Link>
          </div>
          
          {/* Same grid as browse page */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#2F3336]">
            {featuredBounties.map((bounty) => (
              <div 
                key={bounty.id} 
                className="border-r border-b border-[#2F3336]"
              >
                <BountyCard bounty={bounty} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 border-t border-[#2F3336]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-[32px] font-medium text-[#E7E9EA] tracking-tight mb-12">
            Find your niche
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 border-t border-l border-[#2F3336]">
            {[
              { name: 'Development', key: 'development' },
              { name: 'Design', key: 'design' },
              { name: 'Writing', key: 'writing' },
              { name: 'Marketing', key: 'marketing' },
              { name: 'Research', key: 'research' },
              { name: 'Other', key: 'other' },
            ].map((category) => {
              const count = openBounties.filter(b => b.category === category.key).length;
              return (
                <Link 
                  key={category.key}
                  href={`/browse?category=${category.key}`}
                  className="group relative p-8 border-r border-b border-[#2F3336] hover:bg-[#0A0A0A] transition-colors duration-200"
                >
                  {/* Corner squares on hover */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
                  
                  <p className="text-[20px] font-semibold text-[#E7E9EA] mb-2 group-hover:text-[#1D9BF0] transition-colors">
                    {category.name}
                  </p>
                  <p className="text-[14px] text-[#71767B]">
                    {count} open bounties
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Bounties */}
      <section className="py-24 border-t border-[#2F3336]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-[32px] font-medium text-[#E7E9EA] tracking-tight">
              Just posted
            </h2>
            <Link href="/browse">
              <button className="px-6 py-2.5 text-[13px] tracking-[0.1em] uppercase text-[#71767B] border border-[#333] rounded-full hover:text-[#E7E9EA] hover:border-[#E7E9EA] transition-all duration-300">
                View All ↗
              </button>
            </Link>
          </div>
          
          {/* Same grid as browse page */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#2F3336]">
            {recentBounties.map((bounty) => (
              <div 
                key={bounty.id} 
                className="border-r border-b border-[#2F3336]"
              >
                <BountyCard bounty={bounty} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-[#2F3336]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-[32px] font-medium text-[#E7E9EA] tracking-tight mb-12">
            How it works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[#2F3336]">
            {[
              { 
                step: '01', 
                title: 'Browse', 
                desc: 'Explore open bounties across development, design, writing, and more.' 
              },
              { 
                step: '02', 
                title: 'Bid', 
                desc: 'Submit your proposal with your price. Stand out with your pitch.' 
              },
              { 
                step: '03', 
                title: 'Deliver', 
                desc: 'Complete the work, get approved, receive payment. Simple.' 
              },
            ].map((item) => (
              <div 
                key={item.step} 
                className="group relative p-8 border-r border-b border-[#2F3336] hover:bg-[#0A0A0A] transition-colors duration-200"
              >
                {/* Corner squares on hover */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />
                
                <p className="text-[48px] font-light text-[#2F3336] mb-4">
                  {item.step}
                </p>
                <h3 className="text-[20px] font-semibold text-[#E7E9EA] mb-3 group-hover:text-[#1D9BF0] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[14px] text-[#71767B] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 border-t border-[#2F3336]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-medium text-[#E7E9EA] leading-tight tracking-tight mb-8">
            Ready to start earning?
          </h2>
          <p className="text-[16px] text-[#71767B] mb-12">
            Join the marketplace. Find work that matches your skills.
          </p>
          <Link href="/browse">
            <button className="px-10 py-4 text-[14px] tracking-[0.1em] uppercase text-[#000] bg-[#E7E9EA] rounded-full hover:bg-white transition-all duration-300">
              Get Started ↗
            </button>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
}

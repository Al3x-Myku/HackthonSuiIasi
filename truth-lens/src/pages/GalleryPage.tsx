import React, { useState } from 'react';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { useNavigate } from 'react-router-dom';

const GalleryPage: React.FC = () => {
    const account = useCurrentAccount();
    const navigate = useNavigate();

    const [filter, setFilter] = useState<'all' | 'photo' | 'video' | 'verified'>('all');

    // Mock data for now since we don't have real NFTs on testnet yet for the user to see immediately
    // In a real app, we would merge this with ownedObjects
    // Mock data for now since we don't have real NFTs on testnet yet for the user to see immediately
    // In a real app, we would merge this with ownedObjects
    const mockItems: any[] = [];

    const filteredItems = mockItems.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'verified') return item.verified;
        return item.type === filter;
    });

    return (
        <div className="flex flex-col min-h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
            {/* Top Navigation Bar */}
            <header className="glass-panel sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-6 py-3 border-b-0 border-b-[#243047]/50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-white cursor-pointer" onClick={() => navigate('/')}>
                        <div className="flex items-center justify-center size-8 text-primary">
                            <span className="material-symbols-outlined text-[32px]">photo_filter</span>
                        </div>
                        <h2 className="text-white text-xl font-bold leading-tight tracking-[-0.015em] uppercase">TruthLens</h2>
                    </div>
                    {/* Search Bar */}
                    <label className="flex-col hidden w-40 h-10 md:flex min-w-96">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-[#1e293b] border border-[#334155] focus-within:border-primary transition-colors">
                            <div className="text-[#94a3b8] flex items-center justify-center pl-3">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </div>
                            <input
                                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-transparent text-white focus:outline-0 focus:ring-0 border-none h-full placeholder:text-[#64748b] px-3 text-sm font-normal leading-normal"
                                placeholder="Search by TxID, Hash, or User..."
                                defaultValue=""
                            />
                        </div>
                    </label>
                </div>
                <div className="flex items-center gap-6">
                    <div className="items-center hidden gap-6 lg:flex">
                        <a className="text-white hover:text-primary transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate('/')}>Gallery</a>
                        <a className="text-[#94a3b8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate('/camera')}>Upload</a>
                        <a className="text-[#94a3b8] hover:text-white transition-colors text-sm font-medium leading-normal" href="#" onClick={() => navigate('/profile')}>My Profile</a>
                    </div>

                    <ConnectButton
                        className="!bg-primary !text-white !font-bold !rounded-lg !px-4 !py-2 !h-10 !flex !items-center !gap-2 hover:!bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Filters */}
                <aside className="w-72 hidden md:flex flex-col border-r border-[#243047]/50 bg-[#0d1526] overflow-y-auto custom-scrollbar">
                    {/* ... existing sidebar content ... */}
                    <div className="flex flex-col gap-6 p-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold tracking-wider text-white uppercase text-opacity-70">Filters</h3>
                            <button className="text-xs font-medium transition-colors text-primary hover:text-white" onClick={() => setFilter('all')}>Reset</button>
                        </div>
                        {/* Accordions */}
                        <div className="flex flex-col gap-3">
                            <details className="group" open>
                                <summary className="flex cursor-pointer items-center justify-between py-2 text-white hover:text-primary transition-colors list-none">
                                    <span className="text-sm font-medium">Date Range</span>
                                    <span className="material-symbols-outlined text-[20px] transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div className="px-1 pb-4 pt-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input defaultChecked className="w-4 h-4 border-gray-600 text-primary bg-[#1e293b] focus:ring-primary focus:ring-2" name="date" type="radio" />
                                            <span className="text-[#94a3b8] text-sm">All Time</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input className="w-4 h-4 border-gray-600 text-primary bg-[#1e293b] focus:ring-primary focus:ring-2" name="date" type="radio" />
                                            <span className="text-[#94a3b8] text-sm">Last 24 Hours</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input className="w-4 h-4 border-gray-600 text-primary bg-[#1e293b] focus:ring-primary focus:ring-2" name="date" type="radio" />
                                            <span className="text-[#94a3b8] text-sm">Last Week</span>
                                        </label>
                                    </div>
                                </div>
                            </details>
                            <div className="h-px bg-[#243047]"></div>
                            <details className="group">
                                <summary className="flex cursor-pointer items-center justify-between py-2 text-white hover:text-primary transition-colors list-none">
                                    <span className="text-sm font-medium">Location</span>
                                    <span className="material-symbols-outlined text-[20px] transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div className="pb-4 pt-2">
                                    <input className="w-full bg-[#1e293b] border border-[#334155] rounded px-3 py-1.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-primary" placeholder="Enter city or country..." />
                                </div>
                            </details>
                            <div className="h-px bg-[#243047]"></div>
                            <details className="group" open>
                                <summary className="flex cursor-pointer items-center justify-between py-2 text-white hover:text-primary transition-colors list-none">
                                    <span className="text-sm font-medium">Camera Type</span>
                                    <span className="material-symbols-outlined text-[20px] transition-transform group-open:rotate-180">expand_more</span>
                                </summary>
                                <div className="px-1 pb-4 pt-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input defaultChecked className="w-4 h-4 rounded text-primary bg-[#1e293b] border-gray-600 focus:ring-primary focus:ring-offset-gray-800" type="checkbox" />
                                            <span className="text-[#94a3b8] text-sm">DSLR / Mirrorless</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input defaultChecked className="w-4 h-4 rounded text-primary bg-[#1e293b] border-gray-600 focus:ring-primary focus:ring-offset-gray-800" type="checkbox" />
                                            <span className="text-[#94a3b8] text-sm">Mobile</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input className="w-4 h-4 rounded text-primary bg-[#1e293b] border-gray-600 focus:ring-primary focus:ring-offset-gray-800" type="checkbox" />
                                            <span className="text-[#94a3b8] text-sm">Drone</span>
                                        </label>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="relative flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-[1400px] mx-auto p-6 md:p-8 lg:p-10">
                        {/* Headline & Header */}
                        <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-end">
                            <div>
                                <h1 className="text-white text-[32px] md:text-[40px] font-bold leading-tight mb-2">Live Feed</h1>
                                <p className="text-[#94a3b8] text-base">Explore the latest immutable moments captured worldwide.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[#64748b] text-sm font-medium">Sort by:</span>
                                <select className="bg-[#1e293b] border-none text-white text-sm font-medium rounded-lg cursor-pointer focus:ring-1 focus:ring-primary py-2 pl-3 pr-8">
                                    <option>Newest Verified</option>
                                    <option>Oldest</option>
                                    <option>Most Viewed</option>
                                </select>
                            </div>
                        </div>

                        {/* Category Chips */}
                        <div className="flex gap-3 pb-2 mb-8 overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setFilter('all')}
                                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-5 pr-5 transition-all ${filter === 'all' ? 'bg-primary text-white shadow-[0_0_15px_rgba(23,84,207,0.4)]' : 'bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:border-primary/50 hover:text-white'}`}
                            >
                                <span className="text-sm font-bold">All Media</span>
                            </button>
                            <button
                                onClick={() => setFilter('photo')}
                                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-5 pr-5 transition-all ${filter === 'photo' ? 'bg-primary text-white shadow-[0_0_15px_rgba(23,84,207,0.4)]' : 'bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:border-primary/50 hover:text-white'}`}
                            >
                                <span className="text-sm font-medium">Photos</span>
                            </button>
                            <button
                                onClick={() => setFilter('video')}
                                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-5 pr-5 transition-all ${filter === 'video' ? 'bg-primary text-white shadow-[0_0_15px_rgba(23,84,207,0.4)]' : 'bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:border-primary/50 hover:text-white'}`}
                            >
                                <span className="text-sm font-medium">Videos</span>
                            </button>
                            <button
                                onClick={() => setFilter('verified')}
                                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-5 transition-all group ${filter === 'verified' ? 'bg-verified/20 border-verified text-verified' : 'bg-[#1e293b] border border-[#334155] text-verified hover:border-verified/50'}`}
                            >
                                <span className="material-symbols-outlined text-[18px] group-hover:neon-glow transition-all">verified_user</span>
                                <span className="text-sm font-medium group-hover:neon-glow transition-all">Verified Only</span>
                            </button>
                        </div>

                        {/* Masonry Grid */}
                        <div className="gap-6 space-y-6 columns-1 sm:columns-2 lg:columns-3 xl:columns-4">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <div key={item.id} className="group relative break-inside-avoid rounded-2xl overflow-hidden bg-surface-dark border border-[#334155]/50 hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-lg shadow-black/20 hover:shadow-primary/10">
                                        {item.verified && (
                                            <div className="absolute top-3 right-3 z-20 bg-[#0b1221]/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 border border-verified/30">
                                                <span className="material-symbols-outlined text-verified text-[16px]">verified</span>
                                                <span className="text-verified text-[10px] font-bold uppercase tracking-wide">Verified</span>
                                            </div>
                                        )}
                                        <img className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" src={item.src} alt={item.title} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1221] via-[#0b1221]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <h3 className="mb-1 text-lg font-bold text-white">{item.title}</h3>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-5 h-5 rounded-full border border-white/20 bg-gray-500"></div>
                                                    <span className="text-xs font-medium text-white/80">{item.user}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-[#64748b]">
                                    <span className="material-symbols-outlined text-6xl mb-4 opacity-50">image_not_supported</span>
                                    <p className="text-lg font-medium">No media found</p>
                                    <p className="text-sm">Be the first to mint a TruthLens proof!</p>
                                    <button
                                        onClick={() => navigate('/camera')}
                                        className="mt-6 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                                    >
                                        Capture New Media
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GalleryPage;

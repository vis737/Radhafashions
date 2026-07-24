import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Heart, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';

interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  caption: string;
}

const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: 'post-1',
    imageUrl: 'https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=500&auto=format&fit=crop&q=80',
    likes: 245,
    comments: 18,
    caption: 'Beveling our sheesham Keepsake boxes by hand under organic tung oil finishes. #meriscarpentry #handcraftedindia'
  },
  {
    id: 'post-2',
    imageUrl: 'https://images.unsplash.com/photo-1559251606-c623743a6d76?w=500&auto=format&fit=crop&q=80',
    likes: 198,
    comments: 11,
    caption: 'Traditional handlooms spinning premium combed cotton fibers. #femaleartisanleague #organictextiles'
  },
  {
    id: 'post-3',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=80',
    likes: 312,
    comments: 29,
    caption: 'Safe, natural, chemical-free toys that nurture creative childhood coordination. No plastic slop here. #safetoys #montessori'
  },
  {
    id: 'post-4',
    imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop&q=80',
    likes: 176,
    comments: 9,
    caption: 'Archival Smyth-sewn flax journals getting hand gold-stamped in our Kerala studio. #finestationery #goldenleaf'
  },
  {
    id: 'post-5',
    imageUrl: 'https://images.unsplash.com/photo-1605001011156-cbf0b0f67a51?w=500&auto=format&fit=crop&q=80',
    likes: 289,
    comments: 22,
    caption: 'Intricate precision Kolam stencil layouts on acrylic sheets. Transforming thresholds globally. #kolam #diwaliparsing'
  },
  {
    id: 'post-6',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=500&auto=format&fit=crop&q=80',
    likes: 412,
    comments: 34,
    caption: 'Generational stacks of organic timber abacus nodes ready for global classrooms. #heritagelearning #supportweavers'
  }
];

export default function InstagramGallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const handleInstagramVisit = () => {
    window.open('https://instagram.com/meris_boutique', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left select-none font-sans my-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-mono text-gold-500 uppercase tracking-widest font-black block">
            Inside the Workspace Guilds
          </span>
          <h3 className="font-display font-black text-slate-800 dark:text-white text-lg uppercase tracking-wider mt-1">
            Follow Our Artisan Journey
          </h3>
          <div className="w-10 h-0.5 bg-[#C5A021] mt-2 rounded"></div>
        </div>

        <button
          onClick={handleInstagramVisit}
          className="py-2.5 px-4 bg-[#0F172A] hover:bg-[#C5A021] text-white hover:text-navy-950 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center gap-2 border border-slate-700/50 cursor-pointer self-start sm:self-auto shadow-sm active:scale-95"
        >
          <Instagram className="w-4 h-4 shrink-0" />
          <span>@meris_boutique on Instagram</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {INSTAGRAM_POSTS.map((post) => (
          <div
            key={post.id}
            onMouseEnter={() => setHoveredId(post.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={handleInstagramVisit}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-gray-100 dark:border-navy-900 cursor-zoom-in group select-none shadow-sm hover:shadow-md transition duration-300"
          >
            <img
              src={post.imageUrl}
              alt={post.caption}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
            
            {/* Dark overlay with likes and comment metrics */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-white p-3 text-center">
              <div className="flex items-center gap-1 font-mono text-xs font-bold">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-bold">
                <MessageCircle className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{post.comments}</span>
              </div>

              {/* Caption snippet overlay */}
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <span className="text-[7px] text-gray-300 font-sans block line-clamp-2 leading-tight">
                  {post.caption}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>


    </section>
  );
}



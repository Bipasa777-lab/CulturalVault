"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useItem } from "@/hooks";
import { useBookmarks } from "@/context/BookmarksContext";
import { ErrorState } from "@/components/ui/ErrorState";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { motion } from "framer-motion";
import { recordRecentlyViewed } from "@/utils";
import { useLanguage } from "@/context/LanguageContext";
import { translateItem } from "@/utils/translate";
import { CulturalItem } from "@/types";

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const { item, loading, error, likeItem } = useItem(resolvedParams.id);
  const { isBookmarked } = useBookmarks();
  const { language } = useLanguage();

  const [translatedItem, setTranslatedItem] = useState<CulturalItem | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({ name: "", text: "" });

  const displayedItem = translatedItem || item;

  useEffect(() => {
    let active = true;
    async function localize() {
      if (!item) {
        setTranslatedItem(null);
        return;
      }
      if (language === "en") {
        setTranslatedItem(item);
        return;
      }
      const trans = await translateItem(item, language);
      if (active) {
        setTranslatedItem(trans);
      }
    }
    localize();
    return () => {
      active = false;
    };
  }, [item, language]);

  useEffect(() => {
    if (displayedItem) {
      recordRecentlyViewed({
        id: displayedItem.id,
        type: "article",
        title: displayedItem.title,
        category: displayedItem.category,
        path: `/item/${displayedItem.id}`
      });

      const storedComments = localStorage.getItem(`comments-${displayedItem.id}`);
      if (storedComments) {
        setComments(JSON.parse(storedComments));
      } else {
        const mock = [
          {
            name: "Sofia Rossi",
            text: "This is absolutely beautiful! Thank you for sharing this oral history.",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            name: "Liam O'Connor",
            text: "Fascinating details. It is so important to preserve these local traditions.",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        localStorage.setItem(`comments-${displayedItem.id}`, JSON.stringify(mock));
        setComments(mock);
      }
    }
  }, [displayedItem]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayedItem) return;
    if (!newComment.name.trim() || !newComment.text.trim()) return;

    const comment = {
      name: newComment.name.trim(),
      text: newComment.text.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = [comment, ...comments];
    setComments(updated);
    localStorage.setItem(`comments-${displayedItem.id}`, JSON.stringify(updated));

    setNewComment({ name: "", text: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground text-lg">Loading heritage...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <ErrorState message={error} />
        <Link href="/" className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  if (!displayedItem) {
    return notFound();
  }

  return (
    <PageWrapper className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] w-full overflow-hidden">
        <Image
          src={displayedItem.imageUrl}
          alt={displayedItem.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            {isBookmarked(displayedItem.id) && (
              <span className="px-3 py-1 bg-amber-500 text-white shadow-md rounded-full text-sm font-medium">
                Featured
              </span>
            )}
            <span className="px-3 py-1 bg-primary/20 text-primary backdrop-blur-md rounded-full text-sm font-medium border border-primary/20">
              {displayedItem.category === "Articles" ? "Blogs" : displayedItem.category}
            </span>
            <span className="px-3 py-1 bg-secondary/80 text-secondary-foreground backdrop-blur-md rounded-full text-sm font-medium">
              {displayedItem.era}
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground mb-4"
          >
            {displayedItem.title}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-accent inline-block" />
              {displayedItem.location}
            </span>
            <span className="flex items-center gap-1 text-amber-500">
              ★ <span className="font-medium text-foreground">{displayedItem.rating}</span> ({displayedItem.reviewCount.toLocaleString()} reviews)
            </span>
            <span className="flex items-center gap-1.5">
              👁️ <span className="font-medium text-foreground">{displayedItem.views !== undefined ? displayedItem.views : Math.floor((displayedItem.reviewCount || 0) * 4.5)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              ❤️ <span className="font-medium text-foreground">{displayedItem.likes !== undefined ? displayedItem.likes : Math.floor((displayedItem.reviewCount || 0) * 1.2)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              💬 <span className="font-medium text-foreground">{comments.length}</span>
            </span>
            {displayedItem.category === "Articles" && (
              <button 
                onClick={likeItem}
                className="ml-2 px-3.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-semibold shadow-md transition-all active:scale-95 flex items-center gap-1"
              >
                ❤️ Like Blog
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          {/* Tags */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2"
          >
            {displayedItem.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </motion.div>

          {/* Description */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="prose prose-lg dark:prose-invert"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-6">About the Heritage</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {displayedItem.longDescription || displayedItem.description}
            </p>
          </motion.article>

          {/* Artifacts */}
          {displayedItem.artifacts && displayedItem.artifacts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">Featured Artifacts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {displayedItem.artifacts.map((artifact) => (
                  <div key={artifact.id} className="group relative rounded-2xl overflow-hidden glass hover:bg-white/5 transition-all duration-300">
                    <div className="aspect-square relative flex-shrink-0">
                      <Image
                        src={artifact.imageUrl}
                        alt={artifact.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-4">
                        <span className="text-xs font-mono text-primary/80 block mb-1">{artifact.date}</span>
                        <h3 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors">{artifact.name}</h3>
                        <p className="text-sm text-gray-300 line-clamp-2">{artifact.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Comments Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="border border-border rounded-3xl p-8 bg-card shadow-sm mt-8"
          >
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2 text-foreground">
              💬 Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-4 mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  placeholder="Your Name"
                  value={newComment.name}
                  onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                  className="border border-border p-3.5 rounded-xl bg-background text-foreground outline-none focus:border-primary/50 text-sm font-semibold"
                  required
                />
              </div>
              <textarea
                placeholder="Share your thoughts on this heritage..."
                value={newComment.text}
                onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                className="w-full border border-border p-3.5 rounded-xl bg-background text-foreground outline-none focus:border-primary/50 text-sm min-h-[100px]"
                required
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-md"
              >
                Post Comment
              </button>
            </form>

            {/* Comment List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-muted-foreground italic text-sm">No comments yet. Be the first to share your thoughts!</p>
              ) : (
                comments.map((cmt, idx) => (
                  <div key={idx} className="p-4 border border-border/50 rounded-2xl bg-background/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-foreground">{cmt.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(cmt.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{cmt.text}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.aside 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-8"
        >
          <div className="glass rounded-3xl p-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-primary/20 text-primary flex items-center justify-center text-xs">🏛</span>
              Curator Notes
            </h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                {displayedItem.curator?.avatar ? (
                  <Image src={displayedItem.curator.avatar} alt={displayedItem.curator.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xl font-bold">
                    {displayedItem.curator?.name?.charAt(0) || "C"}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{displayedItem.curator?.name || "Anonymous Curator"}</p>
                <p className="text-sm text-muted-foreground">{displayedItem.curator?.title || "Cultural Enthusiast"}</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-4 py-2">
              "This artifact from the {displayedItem.era} beautifully captures the essence of {displayedItem.category === "Articles" ? "blog" : displayedItem.category.toLowerCase()} history in {displayedItem.location}."
            </p>

            <Link href="/explore" className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition-all font-medium">
              ← Back to Explore
            </Link>
          </div>
        </motion.aside>
      </section>
    </PageWrapper>
  );
}

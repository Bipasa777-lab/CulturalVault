"use client";

import Link from "next/link";

export default function StoryCard({
  story,
  onEdit,
  onDelete,
}: {
  story: any;
  onEdit?: (story: any) => void;
  onDelete?: (id: any) => void;
}) {
  const currentUser = JSON.parse(
    localStorage.getItem("userAccount") || "{}"
  );

  const isOwner =
    currentUser?.id === story?.userId;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/json", JSON.stringify({
      id: story.id || story._id,
      title: story.title,
      type: "story",
      category: story.category || "Stories",
      description: story.description,
      region: story.region,
      language: story.language,
      narrator: story.narrator
    }));
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className="border rounded-2xl overflow-hidden bg-card shadow-sm hover:shadow-lg transition-all cursor-grab active:cursor-grabbing h-full flex flex-col"
    >
      {/* Cover Image */}
      <Link href={`/stories/${story._id || story.id}`} className="block">
        {story.image ? (
          <img
            src={story.image}
            alt={story.title}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="h-52 flex items-center justify-center bg-muted text-muted-foreground text-sm">
            No Cover Image
          </div>
        )}
      </Link>

      {/* Content & Buttons Wrapper */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <Link href={`/stories/${story._id || story.id}`} className="block flex-1">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold">
                🏛 {story.title}
              </h3>

              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold shrink-0 ml-2">
                {story.category || "Stories"}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground mt-1">
              Click to explore this oral heritage story
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>📍 {story.region}</span>
              <span>⭐ {story.score}</span>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              👤 Added By: {story.userName || "Unknown User"}
            </div>
            
            {story.description && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {story.description}
              </p>
            )}
          </div>
        </Link>

        <div className="mt-4">
          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>📅 {story.createdAt ? new Date(story.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Just now"}</span>
            <div className="flex items-center gap-2.5">
              <span>👁️ {story.views !== undefined ? story.views : 0}</span>
              <span>❤️ {story.likes !== undefined ? story.likes : 0}</span>
            </div>
          </div>

          {/* Edit and Delete Controls */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit?.(story);
              }}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Edit
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (
                  confirm(
                    "Are you sure you want to delete this story?"
                  )
                ) {
                  onDelete?.(
                    story.id || story._id
                  );
                }
              }}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
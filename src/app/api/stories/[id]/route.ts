import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Story from "@/models/Story";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const updatedStory = await Story.findByIdAndUpdate(
      id,
      {
        title: body.title,
        region: body.region,
        language: body.language,
        narrator: body.narrator,
        userName: body.userName,
        category: body.category,
        score: body.score,
        lat: body.lat,
        lng: body.lng,
        description: body.description,
        audio: body.audio,
        image: body.image,
        gallery: body.gallery,
      },
      { new: true }
    );

    if (!updatedStory) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedStory);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update story: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const deletedStory = await Story.findByIdAndDelete(id);

    if (!deletedStory) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Story deleted successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete story: " + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const update: any = {};
    if (body.views !== undefined) update.views = body.views;
    if (body.likes !== undefined) update.likes = body.likes;

    if (body.incrementViews) {
      update.$inc = { views: 1 };
    }
    if (body.incrementLikes) {
      update.$inc = { ...update.$inc, likes: 1 };
    }

    const updatedStory = await Story.findByIdAndUpdate(
      id,
      Object.keys(update).includes("$inc") ? update : { $set: update },
      { new: true }
    );

    if (!updatedStory) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedStory);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to patch story: " + error.message },
      { status: 500 }
    );
  }
}

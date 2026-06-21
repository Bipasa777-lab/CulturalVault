import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Contribution from "@/models/Contribution";

import { connectDB } from "@/lib/mongodb";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const updatedContribution = await Contribution.findByIdAndUpdate(
      id,
      {
        title: body.title,
        category: body.category,
        region: body.region,
        contributor: body.contributor,
        description: body.description,
        image: body.image,
        audio: body.audio,
        lat: body.lat,
        lng: body.lng,
        tags: body.tags,
        culturalEra: body.culturalEra,
        sourceType: body.sourceType,
        preservationStatus: body.preservationStatus,
        importanceLevel: body.importanceLevel,
      },
      { new: true }
    );

    if (!updatedContribution) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedContribution);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update contribution: " + error.message },
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
    const deletedContribution = await Contribution.findByIdAndDelete(id);

    if (!deletedContribution) {
      return NextResponse.json(
        { error: "Contribution not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Contribution deleted successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete contribution: " + error.message },
      { status: 500 }
    );
  }
}

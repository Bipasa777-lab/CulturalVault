import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Contribution from "@/models/Contribution";

import { connectDB } from "@/lib/mongodb";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const contribution =
      await Contribution.findByIdAndUpdate(
        id,
        {
          $inc: {
            likes: 1,
          },
        },
        {
          new: true,
        }
      );

    return NextResponse.json(
      contribution
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}
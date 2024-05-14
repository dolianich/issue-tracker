import authOptions from "@/app/auth/authOptions";
import { patchIssueSchema } from '@/app/validationSchemas';
import prisma from "@/prisma/client";
import { error } from "console";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session)
        return NextResponse.json({}, {status: 401});
    const body = await request.json();
    const validation = patchIssueSchema.safeParse(body);
    if (!validation.success)
        return NextResponse.json(validation.error.errors, {status: 400});

    const {assignedToUserId, title, description} = body;
    if(assignedToUserId) {
        const user = await prisma.user.findUnique({where: {id: assignedToUserId}})
        if(!user)
            return NextResponse.json({error: 'Invalid User.'}, {status: 400})
    }

    const newIssue = await prisma.issue.create({
        data: {title, description, assignedToUserId}
    });

    return NextResponse.json(newIssue, {status: 201});
}
import { NextRequest, NextResponse } from 'next/server';
import { getProspectById, updateProspect, deleteProspect } from '@/lib/queries';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const prospectId = parseInt(id);

  if (isNaN(prospectId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const prospect = getProspectById(prospectId);

  if (!prospect) {
    return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
  }

  return NextResponse.json(prospect);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const prospectId = parseInt(id);

  if (isNaN(prospectId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const prospect = updateProspect(prospectId, body);

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    return NextResponse.json(prospect);
  } catch (error) {
    console.error('Error updating prospect:', error);
    return NextResponse.json(
      { error: 'Failed to update prospect' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const prospectId = parseInt(id);

  if (isNaN(prospectId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const deleted = deleteProspect(prospectId);

  if (!deleted) {
    return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { logContact, getProspectById } from '@/lib/queries';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const prospectId = parseInt(id);

  if (isNaN(prospectId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const existing = getProspectById(prospectId);
  if (!existing) {
    return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
  }

  try {
    const body = await request.json();

    if (!body.note) {
      return NextResponse.json({ error: 'Note is required' }, { status: 400 });
    }

    const prospect = logContact(prospectId, body.note, body.next_followup);

    return NextResponse.json(prospect);
  } catch (error) {
    console.error('Error logging contact:', error);
    return NextResponse.json(
      { error: 'Failed to log contact' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getProspects, createProspect } from '@/lib/queries';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const prospects = getProspects({
    status: searchParams.get('status') || undefined,
    business_type: searchParams.get('business_type') || undefined,
    location: searchParams.get('location') || undefined,
    sort_by: searchParams.get('sort_by') || undefined,
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || undefined,
  });

  return NextResponse.json(prospects);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.business_name || !body.business_type || !body.location || !body.current_web_presence) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prospect = createProspect({
      business_name: body.business_name,
      business_type: body.business_type,
      location: body.location,
      phone: body.phone || null,
      email: body.email || null,
      current_web_presence: body.current_web_presence,
      listing_url: body.listing_url || null,
      years_in_business: body.years_in_business || null,
      status: body.status || 'not_contacted',
      notes: body.notes || null,
      last_contacted: body.last_contacted || null,
      next_followup: body.next_followup || null,
    });

    return NextResponse.json(prospect, { status: 201 });
  } catch (error) {
    console.error('Error creating prospect:', error);
    return NextResponse.json(
      { error: 'Failed to create prospect' },
      { status: 500 }
    );
  }
}

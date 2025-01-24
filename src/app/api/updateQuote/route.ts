import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.quote) {
      return NextResponse.json({ error: 'No quote data provided' }, { status: 400 });
    }

    await writeFile(
      join(process.cwd(), 'src/app/data.json'),
      JSON.stringify(data, null, 2)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating quote data:', error);
    return NextResponse.json(
      { error: 'Failed to update quote data' },
      { status: 500 }
    );
  }
} 
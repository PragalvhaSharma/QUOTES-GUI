import { readFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await readFile(
      join(process.cwd(), 'src/app/data.json'),
      'utf-8'
    );
    
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading quote data:', error);
    return NextResponse.json(
      { error: 'Failed to read quote data' },
      { status: 500 }
    );
  }
} 
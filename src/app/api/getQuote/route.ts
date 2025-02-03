import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("quotesDB");
    
    // Get the quote ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    let quote;
    if (id) {
      // If ID is provided, fetch that specific quote
      quote = await db.collection("quotes")
        .findOne({ _id: new ObjectId(id) });
    } else {
      // If no ID, get the most recent quote (fallback behavior)
      quote = await db.collection("quotes")
        .findOne({}, { sort: { _id: -1 } });
    }
    
    if (!quote) {
      // Return a default structure if no quote is found
      return NextResponse.json({
        quote: {
          quoteInfo: {
            quoteNumber: 'QT-' + new Date().getTime(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          items: [],
          financials: {
            subtotal: 0,
            tax_rate: 0.13,
            tax_amount: 0,
            total: 0,
            amount_paid: 0,
            balance_due: 0
          }
        }
      });
    }
    
    // Convert ObjectId to string to avoid serialization issues
    const formattedQuote = {
      ...quote,
      _id: quote._id.toString()
    };
    
    return NextResponse.json(formattedQuote);
  } catch (error) {
    console.error('Error fetching quote data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("quotesDB");
    const data = await request.json();
    
    // Get the quote ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    // Ensure we're storing the data in the correct structure
    const quoteData = data.quote ? data : { quote: data };
    
    // Remove _id field if it exists to prevent MongoDB error
    if (quoteData._id) {
      delete quoteData._id;
    }
    if (quoteData.quote?._id) {
      delete quoteData.quote._id;
    }
    
    if (id) {
      // If ID exists, update that specific quote
      await db.collection("quotes").updateOne(
        { _id: new ObjectId(id) },
        { $set: quoteData }
      );

      return NextResponse.json({ 
        success: true, 
        id: id
      });
    } else {
      // If no ID, create new quote
      const result = await db.collection("quotes").insertOne(quoteData);
      
      return NextResponse.json({ 
        success: true, 
        id: result.insertedId.toString()
      });
    }
  } catch (error) {
    console.error('Error saving quote data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save quote data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("quotesDB");
    const data = await request.json();
    
    // Get the quote ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'No quote ID provided' },
        { status: 400 }
      );
    }

    // Ensure we're storing the data in the correct structure
    const quoteData = data.quote ? data : { quote: data };
    
    // Remove _id field if it exists to prevent MongoDB error
    if (quoteData._id) {
      delete quoteData._id;
    }
    if (quoteData.quote?._id) {
      delete quoteData.quote._id;
    }
    
    // Update the specific quote by ID
    const result = await db.collection("quotes").updateOne(
      { _id: new ObjectId(id) },
      { $set: quoteData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      id: id
    });
  } catch (error) {
    console.error('Error updating quote data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update quote data' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("quotesDB");
    
    // Get the most recent quote
    const quote = await db.collection("quotes")
      .findOne({}, { sort: { _id: -1 } });
    
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
    
    // Ensure we're storing the data in the correct structure
    const quoteData = data.quote ? data : { quote: data };
    
    // Get the most recent quote
    const latestQuote = await db.collection("quotes").findOne({}, { sort: { _id: -1 } });
    
    if (latestQuote) {
      // If the quote has an _id, convert it to ObjectId
      if (quoteData._id) {
        quoteData._id = new ObjectId(quoteData._id);
      }

      // Update existing quote
      const result = await db.collection("quotes").updateOne(
        { _id: latestQuote._id },
        { $set: quoteData }
      );

      return NextResponse.json({ 
        success: true, 
        id: latestQuote._id.toString()
      });
    }
    
    // If no quote exists, create new one
    const result = await db.collection("quotes").insertOne(quoteData);
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString()
    });
  } catch (error: any) {
    console.error('Error saving quote data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save quote data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("quotesDB");
    const data = await request.json();
    
    // Ensure we're storing the data in the correct structure
    const quoteData = data.quote ? data : { quote: data };
    
    // Get the most recent quote since we're always updating the latest one
    const latestQuote = await db.collection("quotes").findOne({}, { sort: { _id: -1 } });
    
    if (!latestQuote) {
      return NextResponse.json(
        { error: 'No quote found to update' },
        { status: 404 }
      );
    }

    // If the quote has an _id, convert it to ObjectId
    if (quoteData._id) {
      quoteData._id = new ObjectId(quoteData._id);
    }

    // Update the quote
    const result = await db.collection("quotes").updateOne(
      { _id: latestQuote._id },
      { $set: quoteData }
    );

    return NextResponse.json({ 
      success: true,
      id: latestQuote._id.toString()
    });
  } catch (error: any) {
    console.error('Error updating quote data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update quote data' },
      { status: 500 }
    );
  }
} 
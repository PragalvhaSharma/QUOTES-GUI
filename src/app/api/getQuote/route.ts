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
    
    console.log('GET request for quote with ID:', id);
    
    let quote;
    if (id) {
      try {
        // If ID is provided, fetch that specific quote
        quote = await db.collection("quotes")
          .findOne({ _id: new ObjectId(id) });
        console.log('Found quote:', quote ? 'yes' : 'no');
      } catch (err) {
        console.error('Error parsing ObjectId or finding quote:', err);
        return NextResponse.json(
          { error: 'Invalid quote ID format' },
          { status: 400 }
        );
      }
    } else {
      // If no ID, get the most recent quote (fallback behavior)
      quote = await db.collection("quotes")
        .findOne({}, { sort: { _id: -1 } });
      console.log('Found most recent quote:', quote ? 'yes' : 'no');
    }
    
    if (!quote) {
      console.log('No quote found, returning default structure');
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
    console.error('Error in GET /api/getQuote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch quote data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("quotesDB");
    
    // Get the quote ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    console.log('POST request for quote with ID:', id);
    
    let data;
    try {
      data = await request.json();
    } catch (err) {
      console.error('Error parsing request body:', err);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
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
    
    if (id) {
      try {
        // If ID exists, update that specific quote
        const result = await db.collection("quotes").updateOne(
          { _id: new ObjectId(id) },
          { $set: quoteData }
        );
        
        console.log('Update result:', {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        });

        if (result.matchedCount === 0) {
          return NextResponse.json({ 
            error: 'Quote not found' 
          }, { status: 404 });
        }

        return NextResponse.json({ 
          success: true, 
          id: id
        });
      } catch (err) {
        console.error('Error updating quote:', err);
        return NextResponse.json(
          { error: 'Failed to update quote' },
          { status: 500 }
        );
      }
    } else {
      try {
        // If no ID, create new quote
        const result = await db.collection("quotes").insertOne(quoteData);
        console.log('Created new quote with ID:', result.insertedId);
        
        return NextResponse.json({ 
          success: true, 
          id: result.insertedId.toString()
        });
      } catch (err) {
        console.error('Error creating new quote:', err);
        return NextResponse.json(
          { error: 'Failed to create new quote' },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error('Error in POST /api/getQuote:', error);
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
    
    // Get the quote ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    console.log('PUT request for quote with ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'No quote ID provided' },
        { status: 400 }
      );
    }

    let data;
    try {
      data = await request.json();
    } catch (err) {
      console.error('Error parsing request body:', err);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
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
    
    try {
      // Update the specific quote by ID
      const result = await db.collection("quotes").updateOne(
        { _id: new ObjectId(id) },
        { $set: quoteData }
      );

      console.log('Update result:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });

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
    } catch (err) {
      console.error('Error updating quote:', err);
      return NextResponse.json(
        { error: 'Failed to update quote' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in PUT /api/getQuote:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update quote data' },
      { status: 500 }
    );
  }
} 
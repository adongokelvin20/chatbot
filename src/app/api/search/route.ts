import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { SearchResult, SearchResponse } from '@/types';

async function getBusinessId(req: NextRequest): Promise<string> {
  const url = new URL(req.url);
  const bid = url.searchParams.get('businessId');
  if (bid) return bid;
  const business = await db.business.findFirst();
  if (business) return business.id;
  throw new Error('No business found. Please seed the database first.');
}

export async function GET(req: NextRequest) {
  try {
    const businessId = await getBusinessId(req);
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const limit = Number(url.searchParams.get('limit')) || 20;

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: { results: [], total: 0, query },
      });
    }

    const results: SearchResult[] = [];

    // Search products
    const products = await db.product.findMany({
      where: {
        businessId,
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: Math.ceil(limit / 4),
    });

    for (const p of products) {
      results.push({
        id: p.id,
        type: 'product',
        title: p.name,
        subtitle: `$${p.salePrice ?? p.price}${p.sku ? ` · SKU: ${p.sku}` : ''}`,
        url: `/products/${p.id}`,
        metadata: { price: String(p.salePrice ?? p.price), stock: String(p.stock) },
      });
    }

    // Search customers
    const customers = await db.customer.findMany({
      where: {
        businessId,
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
          { email: { contains: query } },
        ],
      },
      take: Math.ceil(limit / 4),
    });

    for (const c of customers) {
      results.push({
        id: c.id,
        type: 'customer',
        title: c.name,
        subtitle: c.phone + (c.email ? ` · ${c.email}` : ''),
        url: `/customers/${c.id}`,
        metadata: { phone: c.phone, totalOrders: String(c.totalOrders) },
      });
    }

    // Search orders
    const orders = await db.order.findMany({
      where: {
        businessId,
        OR: [
          { orderNumber: { contains: query } },
          { customerName: { contains: query } },
          { customerPhone: { contains: query } },
          { customerEmail: { contains: query } },
        ],
      },
      take: Math.ceil(limit / 4),
    });

    for (const o of orders) {
      results.push({
        id: o.id,
        type: 'order',
        title: o.orderNumber,
        subtitle: `${o.customerName} · $${o.total} · ${o.status}`,
        url: `/orders/${o.id}`,
        metadata: { status: o.status, total: String(o.total) },
      });
    }

    // Search conversations
    const conversations = await db.conversation.findMany({
      where: {
        businessId,
        OR: [
          { customerName: { contains: query } },
          { customerPhone: { contains: query } },
        ],
      },
      take: Math.ceil(limit / 4),
    });

    for (const c of conversations) {
      results.push({
        id: c.id,
        type: 'conversation',
        title: c.customerName || 'Unknown',
        subtitle: c.customerPhone || '' + ` · ${c.status}`,
        url: `/conversations/${c.id}`,
        metadata: { channel: c.channel, status: c.status },
      });
    }

    const response: SearchResponse = {
      results: results.slice(0, limit),
      total: results.length,
      query,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

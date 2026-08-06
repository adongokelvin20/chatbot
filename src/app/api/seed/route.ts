import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification } from '@/services/notification.service';

export async function POST(req: NextRequest) {
  try {
    // Check if a business already exists
    const existing = await db.business.findFirst();
    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Database already seeded. Use a fresh database to seed again.',
        existingBusinessId: existing.id,
      });
    }

    // ---- Create Business ----
    const business = await db.business.create({
      data: {
        name: 'Demo Fashion Store',
        email: 'hello@demostore.com',
        phone: '+1234567890',
        address: '123 Commerce Street, Business City',
        website: 'https://demostore.com',
        instagram: '@demostore',
        facebook: 'demostore',
        timezone: 'UTC',
        setupComplete: true,
      },
    });

    const businessId = business.id;

    // ---- Create Owner Staff ----
    await db.staff.create({
      data: {
        businessId,
        name: 'Store Owner',
        email: 'owner@demostore.com',
        role: 'owner',
        status: 'active',
      },
    });

    await db.staff.create({
      data: {
        businessId,
        name: 'Sarah Admin',
        email: 'sarah@demostore.com',
        role: 'admin',
        status: 'active',
      },
    });

    await db.staff.create({
      data: {
        businessId,
        name: 'John Staff',
        email: 'john@demostore.com',
        role: 'staff',
        status: 'active',
      },
    });

    // ---- Create AI Settings ----
    await db.aISetting.create({
      data: {
        businessId,
        personality: 'friendly',
        tone: 'helpful',
        greetingMessage: 'Hi there! Welcome to Demo Fashion Store. How can I help you today?',
        workingHoursReply: 'We are currently closed. Our working hours are Mon-Fri 9am-6pm. Leave a message and we will get back to you!',
        autoReply: true,
        language: 'en',
        model: 'gpt-4o-mini',
      },
    });

    // ---- Create Categories ----
    const categories = await Promise.all([
      db.category.create({ data: { businessId, name: 'Dresses', slug: 'dresses', description: 'Beautiful dresses for every occasion' } }),
      db.category.create({ data: { businessId, name: 'Tops', slug: 'tops', description: 'Casual and formal tops' } }),
      db.category.create({ data: { businessId, name: 'Bottoms', slug: 'bottoms', description: 'Pants, skirts, and shorts' } }),
      db.category.create({ data: { businessId, name: 'Accessories', slug: 'accessories', description: 'Bags, jewelry, and more' } }),
      db.category.create({ data: { businessId, name: 'Shoes', slug: 'shoes', description: 'Footwear for every style' } }),
    ]);

    // ---- Create Products ----
    const products = await Promise.all([
      db.product.create({
        data: {
          businessId, name: 'Floral Summer Dress', description: 'A beautiful floral dress perfect for summer outings. Lightweight fabric with a flattering A-line silhouette.',
          categoryId: categories[0].id, sku: 'DRS-001', price: 59.99, salePrice: 49.99, stock: 25,
          colors: JSON.stringify(['Red', 'Blue', 'Yellow']), sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
          images: JSON.stringify(['/placeholder-product.jpg']), active: true, featured: true,
        },
      }),
      db.product.create({
        data: {
          businessId, name: 'Classic White Shirt', description: 'A timeless white button-down shirt made from premium cotton. Perfect for office or casual wear.',
          categoryId: categories[1].id, sku: 'TOP-001', price: 39.99, stock: 50,
          colors: JSON.stringify(['White', 'Light Blue', 'Pink']), sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
          images: JSON.stringify(['/placeholder-product.jpg']), active: true, featured: true,
        },
      }),
      db.product.create({
        data: {
          businessId, name: 'Slim Fit Jeans', description: 'Modern slim fit jeans with stretch comfort. Dark wash finish for a polished look.',
          categoryId: categories[2].id, sku: 'BTT-001', price: 49.99, stock: 35,
          colors: JSON.stringify(['Dark Blue', 'Black', 'Light Blue']), sizes: JSON.stringify(['28', '30', '32', '34', '36']),
          images: JSON.stringify(['/placeholder-product.jpg']), active: true, featured: false,
        },
      }),
      db.product.create({
        data: {
          businessId, name: 'Leather Crossbody Bag', description: 'Elegant leather crossbody bag with adjustable strap. Multiple compartments for organization.',
          categoryId: categories[3].id, sku: 'ACC-001', price: 79.99, stock: 15,
          colors: JSON.stringify(['Black', 'Brown', 'Tan']), images: JSON.stringify(['/placeholder-product.jpg']),
          active: true, featured: true,
        },
      }),
      db.product.create({
        data: {
          businessId, name: 'Running Sneakers', description: 'Lightweight running sneakers with cushioned sole. Breathable mesh upper.',
          categoryId: categories[4].id, sku: 'SHO-001', price: 89.99, salePrice: 69.99, stock: 20,
          colors: JSON.stringify(['Black/White', 'Navy/White', 'Red/Black']), sizes: JSON.stringify(['7', '8', '9', '10', '11', '12']),
          images: JSON.stringify(['/placeholder-product.jpg']), active: true, featured: false,
        },
      }),
      db.product.create({
        data: {
          businessId, name: 'Cashmere Sweater', description: 'Ultra-soft cashmere sweater for chilly evenings. Classic crew neck design.',
          categoryId: categories[1].id, sku: 'TOP-002', price: 129.99, stock: 12,
          colors: JSON.stringify(['Cream', 'Charcoal', 'Burgundy']), sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
          images: JSON.stringify(['/placeholder-product.jpg']), active: true, featured: false,
        },
      }),
      db.product.create({
        data: {
          businessId, name: 'Silk Scarf', description: 'Hand-printed silk scarf with vibrant floral patterns. 100% pure silk.',
          categoryId: categories[3].id, sku: 'ACC-002', price: 45.00, stock: 30,
          colors: JSON.stringify(['Multi-color', 'Blue Tones', 'Red Tones']),
          images: JSON.stringify(['/placeholder-product.jpg']), active: true, featured: false,
        },
      }),
      db.product.create({
        data: {
          businessId, name: 'Denim Jacket', description: 'Classic denim jacket with a modern fit. Button closure with chest pockets.',
          categoryId: categories[1].id, sku: 'TOP-003', price: 69.99, stock: 18,
          colors: JSON.stringify(['Medium Wash', 'Dark Wash', 'Black']), sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
          images: JSON.stringify(['/placeholder-product.jpg']), active: true, featured: true,
        },
      }),
      db.product.create({
        data: {
          businessId, name: 'Pleated Midi Skirt', description: 'Elegant pleated midi skirt in satin finish. Perfect for work or dinner.',
          categoryId: categories[2].id, sku: 'BTT-002', price: 55.00, stock: 0,
          colors: JSON.stringify(['Black', 'Navy', 'Emerald']), sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
          images: JSON.stringify(['/placeholder-product.jpg']), active: true, featured: false,
        },
      }),
      db.product.create({
        data: {
          businessId, name: 'Statement Necklace', description: 'Bold statement necklace with gold-plated chain. Crystal and pearl accents.',
          categoryId: categories[3].id, sku: 'ACC-003', price: 35.00, stock: 40,
          colors: JSON.stringify(['Gold', 'Silver', 'Rose Gold']),
          images: JSON.stringify(['/placeholder-product.jpg']), active: true, featured: false,
        },
      }),
    ]);

    // ---- Create Customers ----
    const customers = await Promise.all([
      db.customer.create({ data: { businessId, name: 'Alice Johnson', phone: '+15550101', email: 'alice@email.com', totalOrders: 3, totalSpent: 215.97, lastInteraction: new Date() } }),
      db.customer.create({ data: { businessId, name: 'Bob Smith', phone: '+15550102', email: 'bob@email.com', totalOrders: 1, totalSpent: 89.99, lastInteraction: new Date() } }),
      db.customer.create({ data: { businessId, name: 'Carol Davis', phone: '+15550103', email: 'carol@email.com', totalOrders: 5, totalSpent: 412.95, lastInteraction: new Date() } }),
      db.customer.create({ data: { businessId, name: 'David Wilson', phone: '+15550104', email: 'david@email.com', totalOrders: 0, totalSpent: 0 } }),
      db.customer.create({ data: { businessId, name: 'Eva Martinez', phone: '+15550105', email: 'eva@email.com', totalOrders: 2, totalSpent: 159.98, lastInteraction: new Date() } }),
    ]);

    // ---- Create Orders ----
    const orders = await Promise.all([
      db.order.create({
        data: {
          businessId, customerId: customers[0].id, orderNumber: 'ORD-20250101-A1B2', status: 'delivered',
          subtotal: 109.98, deliveryFee: 5, discount: 0, total: 114.98,
          paymentMethod: 'momo', paymentStatus: 'paid',
          deliveryAddress: JSON.stringify({ street: '45 Oak Ave', city: 'New York', zip: '10001' }),
          customerName: 'Alice Johnson', customerPhone: '+15550101', customerEmail: 'alice@email.com',
          source: 'ai',
          items: {
            create: [
              { productId: products[0].id, productName: 'Floral Summer Dress', quantity: 1, price: 49.99, color: 'Red', size: 'M' },
              { productId: products[1].id, productName: 'Classic White Shirt', quantity: 1, price: 39.99, size: 'M' },
              { productId: products[3].id, productName: 'Leather Crossbody Bag', quantity: 1, price: 20.00 },
            ],
          },
        },
      }),
      db.order.create({
        data: {
          businessId, customerId: customers[1].id, orderNumber: 'ORD-20250102-C3D4', status: 'shipped',
          subtotal: 89.99, deliveryFee: 5, discount: 0, total: 94.99,
          paymentMethod: 'card', paymentStatus: 'paid',
          deliveryAddress: JSON.stringify({ street: '78 Pine St', city: 'Los Angeles', zip: '90001' }),
          customerName: 'Bob Smith', customerPhone: '+15550102', customerEmail: 'bob@email.com',
          source: 'whatsapp',
          items: {
            create: [
              { productId: products[4].id, productName: 'Running Sneakers', quantity: 1, price: 69.99, color: 'Black/White', size: '10' },
            ],
          },
        },
      }),
      db.order.create({
        data: {
          businessId, customerId: customers[2].id, orderNumber: 'ORD-20250103-E5F6', status: 'pending',
          subtotal: 184.99, deliveryFee: 0, discount: 10, total: 174.99,
          paymentMethod: 'bank_transfer', paymentStatus: 'pending',
          deliveryAddress: JSON.stringify({ street: '12 Elm Dr', city: 'Chicago', zip: '60601' }),
          customerName: 'Carol Davis', customerPhone: '+15550103', customerEmail: 'carol@email.com',
          source: 'ai', notes: 'Please gift wrap',
          items: {
            create: [
              { productId: products[5].id, productName: 'Cashmere Sweater', quantity: 1, price: 129.99, color: 'Cream', size: 'L' },
              { productId: products[7].id, productName: 'Denim Jacket', quantity: 1, price: 69.99, color: 'Dark Wash', size: 'L' },
            ],
          },
        },
      }),
      db.order.create({
        data: {
          businessId, customerId: customers[0].id, orderNumber: 'ORD-20250104-G7H8', status: 'processing',
          subtotal: 55.00, deliveryFee: 5, discount: 0, total: 60.00,
          paymentMethod: 'momo', paymentStatus: 'paid',
          deliveryAddress: JSON.stringify({ street: '45 Oak Ave', city: 'New York', zip: '10001' }),
          customerName: 'Alice Johnson', customerPhone: '+15550101',
          source: 'manual',
          items: {
            create: [
              { productId: products[8].id, productName: 'Pleated Midi Skirt', quantity: 1, price: 55.00, color: 'Black', size: 'S' },
            ],
          },
        },
      }),
      db.order.create({
        data: {
          businessId, customerId: customers[4].id, orderNumber: 'ORD-20250105-I9J0', status: 'cancelled',
          subtotal: 79.99, deliveryFee: 0, discount: 0, total: 79.99,
          paymentMethod: 'cash_on_delivery', paymentStatus: 'failed',
          customerName: 'Eva Martinez', customerPhone: '+15550105',
          source: 'ai',
          items: {
            create: [
              { productId: products[3].id, productName: 'Leather Crossbody Bag', quantity: 1, price: 79.99, color: 'Brown' },
            ],
          },
        },
      }),
    ]);

    // ---- Create Conversations ----
    const conversations = await Promise.all([
      db.conversation.create({
        data: {
          businessId, customerId: customers[0].id, channel: 'web', status: 'active', aiActive: true,
          customerName: 'Alice Johnson', customerPhone: '+15550101', lastMessageAt: new Date(),
          messages: {
            create: [
              { senderType: 'customer', content: 'Hi! Do you have the floral dress in blue?', contentType: 'text' },
              { senderType: 'ai', content: 'Hi Alice! Yes, the Floral Summer Dress is available in Blue! It is currently on sale for $49.99 (originally $59.99). We have sizes S, M, L, and XL in stock. Would you like to order one?', contentType: 'text' },
              { senderType: 'customer', content: 'What sizes do you have in blue?', contentType: 'text' },
              { senderType: 'ai', content: 'In Blue, we currently have all sizes available: S, M, L, and XL. Which size would you prefer?', contentType: 'text' },
            ],
          },
        },
      }),
      db.conversation.create({
        data: {
          businessId, customerId: customers[1].id, channel: 'whatsapp', status: 'active', aiActive: false,
          customerName: 'Bob Smith', customerPhone: '+15550102', lastMessageAt: new Date(), assignedToStaff: 'john@demostore.com',
          messages: {
            create: [
              { senderType: 'customer', content: 'Where is my order? It has been 3 days.', contentType: 'text' },
              { senderType: 'ai', content: 'Let me check the status of your order for you.', contentType: 'text' },
              { senderType: 'system', content: 'A human agent has taken over the conversation.', contentType: 'text' },
              { senderType: 'staff', content: 'Hi Bob, your order ORD-20250102-C3D4 has been shipped and is on the way! You should receive it within 2-3 business days.', contentType: 'text', senderId: 'john@demostore.com' },
            ],
          },
        },
      }),
      db.conversation.create({
        data: {
          businessId, customerId: customers[2].id, channel: 'web', status: 'resolved', aiActive: true,
          customerName: 'Carol Davis', customerPhone: '+15550103', lastMessageAt: new Date(),
          messages: {
            create: [
              { senderType: 'customer', content: 'Do you have a return policy?', contentType: 'text' },
              { senderType: 'ai', content: 'Yes! We offer a 30-day return policy for unworn items with tags attached. Returns are free for orders over $50. Would you like me to help you initiate a return?', contentType: 'text' },
              { senderType: 'customer', content: 'No, just wanted to know. Thanks!', contentType: 'text' },
              { senderType: 'ai', content: 'You are welcome, Carol! Let me know if there is anything else I can help with. Have a great day!', contentType: 'text' },
            ],
          },
        },
      }),
      db.conversation.create({
        data: {
          businessId, customerId: customers[3].id, channel: 'web', status: 'active', aiActive: true,
          customerName: 'David Wilson', customerPhone: '+15550104', lastMessageAt: new Date(),
          messages: {
            create: [
              { senderType: 'customer', content: 'What are your best sellers?', contentType: 'text', isRead: false },
              { senderType: 'ai', content: 'Our best sellers right now are the Floral Summer Dress, Classic White Shirt, and the Leather Crossbody Bag. Would you like more details on any of these?', contentType: 'text', isRead: false },
            ],
          },
        },
      }),
    ]);

    // ---- Create Delivery Zones ----
    await Promise.all([
      db.deliveryZone.create({ data: { businessId, city: 'New York', fee: 5.00, estimatedDays: '1-2', courierNotes: 'Same-day delivery available for orders before 2pm', active: true } }),
      db.deliveryZone.create({ data: { businessId, city: 'Los Angeles', fee: 7.50, estimatedDays: '2-4', courierNotes: null, active: true } }),
      db.deliveryZone.create({ data: { businessId, city: 'Chicago', fee: 6.00, estimatedDays: '2-3', courierNotes: null, active: true } }),
      db.deliveryZone.create({ data: { businessId, city: 'Miami', fee: 8.00, estimatedDays: '3-5', courierNotes: null, active: true } }),
      db.deliveryZone.create({ data: { businessId, city: 'International', fee: 25.00, estimatedDays: '7-14', courierNotes: 'Customs duties may apply', active: true } }),
    ]);

    // ---- Create Payment Methods ----
    await Promise.all([
      db.paymentMethod.create({ data: { businessId, name: 'Mobile Money', type: 'momo', config: JSON.stringify({ provider: 'MTN MoMo', number: '+1234567890' }), active: true } }),
      db.paymentMethod.create({ data: { businessId, name: 'Bank Transfer', type: 'bank_transfer', config: JSON.stringify({ bankName: 'Commerce Bank', accountName: 'Demo Fashion Store', accountNumber: '1234567890', routingNumber: '021000021' }), active: true } }),
      db.paymentMethod.create({ data: { businessId, name: 'Cash on Delivery', type: 'cash_on_delivery', config: null, active: true } }),
      db.paymentMethod.create({ data: { businessId, name: 'Credit/Debit Card', type: 'card', config: JSON.stringify({ provider: 'Stripe', publicKey: 'pk_test_xxx' }), active: true } }),
    ]);

    // ---- Create FAQs ----
    await Promise.all([
      db.fAQ.create({ data: { businessId, question: 'What is your return policy?', answer: 'We offer a 30-day return policy for unworn items with tags attached. Returns are free for orders over $50. Please contact us to initiate a return.', keywords: JSON.stringify(['return', 'refund', 'exchange', 'money back']), category: 'returns', active: true } }),
      db.fAQ.create({ data: { businessId, question: 'How long does delivery take?', answer: 'Delivery times depend on your location. New York: 1-2 days, LA: 2-4 days, Chicago: 2-3 days, Miami: 3-5 days. International: 7-14 days.', keywords: JSON.stringify(['delivery', 'shipping', 'time', 'when', 'arrive']), category: 'delivery', active: true } }),
      db.fAQ.create({ data: { businessId, question: 'What payment methods do you accept?', answer: 'We accept Mobile Money (MoMo), Bank Transfer, Cash on Delivery, and Credit/Debit Cards (via Stripe).', keywords: JSON.stringify(['payment', 'pay', 'methods', 'card', 'momo', 'bank']), category: 'payment', active: true } }),
      db.fAQ.create({ data: { businessId, question: 'Do you ship internationally?', answer: 'Yes, we ship internationally! International delivery takes 7-14 business days and costs $25. Please note that customs duties may apply depending on your country.', keywords: JSON.stringify(['international', 'overseas', 'abroad', 'global', 'worldwide']), category: 'delivery', active: true } }),
      db.fAQ.create({ data: { businessId, question: 'How can I track my order?', answer: 'Once your order is shipped, you will receive a tracking number via email or SMS. You can use this number on the courier\'s website to track your package in real-time.', keywords: JSON.stringify(['track', 'tracking', 'order status', 'where is my order']), category: 'delivery', active: true } }),
      db.fAQ.create({ data: { businessId, question: 'Do you offer gift wrapping?', answer: 'Yes! We offer complimentary gift wrapping on request. Just mention it in the order notes when placing your order.', keywords: JSON.stringify(['gift', 'wrap', 'present', 'gift wrap']), category: 'general', active: true } }),
    ]);

    // ---- Create Promotions ----
    await Promise.all([
      db.promotion.create({
        data: {
          businessId, name: 'Summer Sale 2025', type: 'discount', discountType: 'percentage', discountValue: 20,
          minOrder: 50, maxDiscount: 100, validFrom: new Date('2025-06-01'), validUntil: new Date('2025-08-31'),
          autoApply: true, description: 'Get 20% off on all orders above $50 this summer!', active: true,
        },
      }),
      db.promotion.create({
        data: {
          businessId, name: 'Welcome Coupon', type: 'coupon', discountType: 'fixed', discountValue: 15,
          code: 'WELCOME15', minOrder: 30, validFrom: new Date('2025-01-01'), validUntil: new Date('2025-12-31'),
          autoApply: false, description: 'New customers get $15 off their first order of $30+', active: true,
        },
      }),
      db.promotion.create({
        data: {
          businessId, name: 'Flash Sale - Bags', type: 'flash_sale', discountType: 'percentage', discountValue: 30,
          validFrom: new Date('2025-01-15'), validUntil: new Date('2025-01-16'),
          autoApply: true, description: '30% off all bags for 24 hours only!', active: true,
        },
      }),
    ]);

    // ---- Create Customer Memories ----
    await Promise.all([
      db.customerMemory.create({ data: { customerId: customers[0].id, businessId, key: 'preferredSize', value: 'M' } }),
      db.customerMemory.create({ data: { customerId: customers[0].id, businessId, key: 'favoriteColor', value: 'Blue' } }),
      db.customerMemory.create({ data: { customerId: customers[0].id, businessId, key: 'style', value: 'Casual elegant' } }),
      db.customerMemory.create({ data: { customerId: customers[2].id, businessId, key: 'preferredSize', value: 'L' } }),
      db.customerMemory.create({ data: { customerId: customers[2].id, businessId, key: 'notes', value: 'Prefers gift wrapping' } }),
    ]);

    // ---- Create Analytics Data ----
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      await db.analytics.create({
        data: { businessId, date, metricType: 'messages', metricValue: Math.floor(Math.random() * 50) + 20 },
      });
      await db.analytics.create({
        data: { businessId, date, metricType: 'orders', metricValue: Math.floor(Math.random() * 15) + 3 },
      });
      await db.analytics.create({
        data: { businessId, date, metricType: 'revenue', metricValue: Math.floor(Math.random() * 500) + 200 },
      });
      await db.analytics.create({
        data: { businessId, date, metricType: 'ai_resolution', metricValue: Math.floor(Math.random() * 30) + 70 },
      });
    }

    // ---- Create Notifications ----
    await Promise.all([
      createNotification(businessId, 'new_order', 'New Order Received', `Order ${orders[2].orderNumber} from Carol Davis - $174.99`, { orderId: orders[2].id, orderNumber: orders[2].orderNumber }),
      createNotification(businessId, 'low_stock', 'Low Stock Alert', 'Pleated Midi Skirt is now out of stock!', { productId: products[8].id, productName: products[8].name, stock: 0 }),
      createNotification(businessId, 'human_takeover', 'Conversation Escalated', 'Bob Smith requested human assistance', { conversationId: conversations[1].id, customerName: 'Bob Smith' }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully.',
      data: {
        businessId: business.id,
        businessName: business.name,
        stats: {
          products: products.length,
          customers: customers.length,
          orders: orders.length,
          conversations: conversations.length,
          categories: categories.length,
          deliveryZones: 5,
          paymentMethods: 4,
          faqs: 6,
          promotions: 3,
          staff: 3,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

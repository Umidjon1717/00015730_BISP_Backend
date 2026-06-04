import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, LessThanOrEqual } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { ChatDto } from './dto/chat.dto';
import { SearchDto } from './dto/search.dto';
import { RecommendDto } from './dto/recommend.dto';
import { RoomStyleDto } from './dto/room-style.dto';
import { GenerateRoomDto } from './dto/generate-room.dto';

@Injectable()
export class AiService {
  private get openai(): OpenAI {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new InternalServerErrorException('OPENAI_API_KEY is not configured');
    return new OpenAI({ apiKey: key });
  }

  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  private async getProductCatalog(limit = 80) {
    const products = await this.productRepo.find({
      relations: ['category'],
      take: limit,
      order: { id: 'ASC' },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category?.name ?? '',
      colors: p.colors,
      tags: p.tags,
      stock: p.stock,
    }));
  }

  async chat(chatDto: ChatDto) {
    const { messages, categoryFilter } = chatDto;
    const catalog = await this.getProductCatalog();
    const filtered = categoryFilter
      ? catalog.filter((p) => p.category.toLowerCase().includes(categoryFilter.toLowerCase()))
      : catalog;

    const systemPrompt = `You are a helpful furniture shopping assistant for an online furnishing store.
You help customers find the right furniture based on their needs, budget, and style preferences.

Here is the current product catalog (JSON):
${JSON.stringify(filtered, null, 2)}

Guidelines:
- Recommend specific products by name and ID from the catalog above
- Always mention the price when recommending products
- If a product is out of stock (stock=0), do not recommend it
- Be friendly, concise, and helpful
- If asked about something outside furniture/home decor, politely redirect to the catalog`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    return {
      message: response.choices[0].message.content,
      usage: response.usage,
    };
  }

  async search(searchDto: SearchDto) {
    const { query } = searchDto;
    const catalog = await this.getProductCatalog();

    const prompt = `You are a product search engine for a furniture store.
Given a natural language search query, extract structured filters from it.

Available products catalog (JSON):
${JSON.stringify(catalog, null, 2)}

User query: "${query}"

Return a JSON object with these optional fields:
{
  "matchedProductIds": [array of product IDs that best match the query, max 10],
  "explanation": "brief explanation of why these products match"
}

Only return valid JSON, no extra text.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    let parsed: { matchedProductIds: number[]; explanation: string };
    try {
      parsed = JSON.parse(response.choices[0].message.content);
    } catch {
      return { products: [], explanation: 'Could not parse results' };
    }

    const matchedIds: number[] = parsed.matchedProductIds ?? [];
    const products = catalog.filter((p) => matchedIds.includes(p.id));

    return {
      products,
      explanation: parsed.explanation,
      query,
    };
  }

  async recommend(recommendDto: RecommendDto) {
    const { productId } = recommendDto;
    const catalog = await this.getProductCatalog();
    const current = catalog.find((p) => p.id === productId);

    if (!current) {
      return { recommendations: [], reason: 'Product not found' };
    }

    const prompt = `You are a furniture product recommendation engine.

A customer is viewing this product:
${JSON.stringify(current, null, 2)}

Here is the full product catalog:
${JSON.stringify(catalog.filter((p) => p.id !== productId), null, 2)}

Recommend up to 5 products that complement or are similar to the viewed product.
Consider: same category, similar price range, matching colors/style, products often bought together.

Return a JSON object:
{
  "recommendedIds": [array of up to 5 product IDs],
  "reason": "brief explanation"
}

Only return valid JSON, no extra text.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    let parsed: { recommendedIds: number[]; reason: string };
    try {
      parsed = JSON.parse(response.choices[0].message.content);
    } catch {
      return { recommendations: [], reason: 'Could not parse results' };
    }

    const ids: number[] = parsed.recommendedIds ?? [];
    const recommendations = catalog.filter((p) => ids.includes(p.id));

    return {
      currentProduct: current,
      recommendations,
      reason: parsed.reason,
    };
  }

  async roomStyle(roomStyleDto: RoomStyleDto) {
    const { description, budget } = roomStyleDto;
    const catalog = await this.getProductCatalog();
    const affordable = budget
      ? catalog.filter((p) => p.price <= budget)
      : catalog;

    const prompt = `You are an interior design assistant for a furniture store.

A customer describes their room:
"${description}"
${budget ? `Budget: $${budget}` : ''}

Available products:
${JSON.stringify(affordable, null, 2)}

Suggest a complete furniture setup for this room from the available products.
Pick products that work well together and match the described style.

Return a JSON object:
{
  "suggestedIds": [array of product IDs, max 8],
  "designTips": "2-3 sentences of interior design advice for this room",
  "totalEstimate": number (sum of suggested product prices)
}

Only return valid JSON, no extra text.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    let parsed: { suggestedIds: number[]; designTips: string; totalEstimate: number };
    try {
      parsed = JSON.parse(response.choices[0].message.content);
    } catch {
      return { suggestions: [], designTips: '', totalEstimate: 0 };
    }

    const ids: number[] = parsed.suggestedIds ?? [];
    const suggestions = catalog.filter((p) => ids.includes(p.id));

    return {
      roomDescription: description,
      suggestions,
      designTips: parsed.designTips,
      totalEstimate: parsed.totalEstimate,
    };
  }

  async generateRoom(dto: GenerateRoomDto) {
    const { roomName, width, length, style, budget } = dto;
    const catalog = await this.getProductCatalog();
    const affordable = budget ? catalog.filter((p) => p.price <= budget) : catalog;

    // Step 1: pick furniture for the room using GPT
    const pickPrompt = `You are an interior designer. Pick furniture from the catalog below that fits a ${roomName} measuring ${width}m x ${length}m.
${style ? `Style: ${style}` : ''}
${budget ? `Budget: $${budget}` : ''}

Catalog:
${JSON.stringify(affordable, null, 2)}

Return JSON only:
{
  "selectedIds": [array of product IDs, max 6],
  "layoutDescription": "one sentence describing where each piece is placed in the room"
}`;

    const pickResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: pickPrompt }],
      max_tokens: 300,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    let picked: { selectedIds: number[]; layoutDescription: string };
    try {
      picked = JSON.parse(pickResponse.choices[0].message.content);
    } catch {
      picked = { selectedIds: [], layoutDescription: '' };
    }

    const selectedProducts = catalog.filter((p) =>
      (picked.selectedIds ?? []).includes(p.id),
    );

    // Step 2: build DALL-E 3 image prompt
    const furnitureList = selectedProducts
      .map((p) => `${p.name} (${p.colors?.[0] ?? 'neutral'})`)
      .join(', ');

    const imagePrompt = `A photorealistic interior design render of a ${roomName}, ${width} meters wide by ${length} meters long.
${style ? `Interior style: ${style}.` : 'Modern contemporary style.'}
The room contains: ${furnitureList || 'elegant modern furniture'}.
${picked.layoutDescription}
Bright natural lighting, clean walls, hardwood floor, professional architectural photography, 4K quality.`;

    const imageResponse = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    });

    const imageUrl = imageResponse.data[0].url;

    return {
      imageUrl,
      roomName,
      dimensions: `${width}m x ${length}m`,
      style: style ?? 'modern',
      selectedProducts,
      layoutDescription: picked.layoutDescription,
      totalEstimate: selectedProducts.reduce((sum, p) => sum + p.price, 0),
    };
  }
}

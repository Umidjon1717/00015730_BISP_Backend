import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

type SeedCategory = {
  name: string;
  description: string;
};

type SeedProductDetail = {
  with: number;
  heght: number;
  depth: number;
  weight: number;
  seatHeight: number;
  legHeight: number;
  countryOrigin: string;
  capacity: number;
  warranty: number;
  maxLoadCapacity: number;
  material: string;
  fillingMaterial: string;
  upholsteryMaterial: string;
};

type SeedProduct = {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  tags?: string[];
  colors?: string[];
  images?: string[];
  category: string; // category name
  detail?: SeedProductDetail;
};

type SeedFile = {
  categories: SeedCategory[];
  products: SeedProduct[];
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function normalizeRenderHost(host: string): string {
  if (host.includes('.')) return host;
  if (host.startsWith('dpg-')) return `${host}.oregon-postgres.render.com`;
  return host;
}

function loadDbConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const parsed = new URL(databaseUrl);
    return {
      host: normalizeRenderHost(parsed.hostname),
      port: Number(parsed.port || 5432),
      user: decodeURIComponent(parsed.username),
      pass: decodeURIComponent(parsed.password),
      db: parsed.pathname.replace(/^\//, ''),
    };
  }

  return {
    host: normalizeRenderHost(requiredEnv('PG_HOST')),
    port: Number(requiredEnv('PG_PORT')),
    user: requiredEnv('PG_USER'),
    pass: requiredEnv('PG_PASS'),
    db: requiredEnv('PG_DB'),
  };
}

async function main() {
  dotenv.config({ path: join(__dirname, '..', '..', '.env') });

  // Import entities directly (avoid Nest bootstrapping for a simple seed script)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Category } = require('../category/entities/category.entity');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Product } = require('../product/entities/product.entity');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ProductDetail } = require('../productDetail/entities/productDetail.entity');

  const { host: pgHost, port: pgPort, user: pgUser, pass: pgPass, db: pgDb } =
    loadDbConfig();

  const dataSource = new DataSource({
    type: 'postgres',
    host: pgHost,
    port: pgPort,
    username: pgUser,
    password: pgPass,
    database: pgDb,
    ssl: { rejectUnauthorized: false },
    synchronize: true,
    logging: false,
    entities: [join(__dirname, '..', '**/*.entity.{ts,js}')],
  });

  try {
    await dataSource.initialize();
  } catch (err: any) {
    // If DB doesn't exist, create it and retry
    if (err?.code === '3D000') {
      const admin = new Client({
        host: pgHost,
        port: pgPort,
        user: pgUser,
        password: pgPass,
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
      });
      await admin.connect();
      await admin.query(`CREATE DATABASE "${pgDb}"`);
      await admin.end();

      await dataSource.initialize();
    } else {
      throw err;
    }
  }

  const seedPath = join(__dirname, 'products.seed.json');
  const seed: SeedFile = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  const categoryRepo = dataSource.getRepository<typeof Category>(Category);
  const productRepo = dataSource.getRepository<typeof Product>(Product);
  const productDetailRepo = dataSource.getRepository<typeof ProductDetail>(
    ProductDetail,
  );

  const categoryByName = new Map<string, any>();
  for (const c of seed.categories) {
    const existing = await categoryRepo.findOne({ where: { name: c.name } });
    const category = existing ?? (await categoryRepo.save(c));
    categoryByName.set(category.name, category);
  }

  let created = 0;
  let skipped = 0;

  for (const p of seed.products) {
    const category = categoryByName.get(p.category);
    if (!category) {
      throw new Error(
        `Seed product references missing category "${p.category}" (sku=${p.sku})`,
      );
    }

    const existing = await productRepo.findOne({ where: { sku: p.sku } });
    if (existing) {
      skipped += 1;
      continue;
    }

    const product = await productRepo.save({
      categoryId: category.id,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      sku: p.sku,
      tags: p.tags ?? [],
      colors: p.colors ?? [],
      images: p.images ?? [],
    });

    if (p.detail) {
      await productDetailRepo.save({
        productId: product.id,
        ...p.detail,
      });
    }

    created += 1;
  }

  await dataSource.destroy();

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        db: process.env.PG_DB,
        categories: seed.categories.length,
        productsCreated: created,
        productsSkippedExistingSku: skipped,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});


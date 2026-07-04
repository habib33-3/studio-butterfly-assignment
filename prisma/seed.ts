/* eslint-disable no-process-exit */
/* eslint-disable no-console */
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as argon2 from "argon2";
import "dotenv/config";

import { generateOrderId } from "../src/common/utils/generate-order-id";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
    adapter: new PrismaMariaDb(process.env["DATABASE_URL"]!),
});

async function main() {
    console.log("🌱 Seeding database...\n");

    // Clean existing data (order matters due to foreign keys)
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.log("🧹 Cleaned existing data\n");

    // ── Users ──────────────────────────────────────────────────────────

    const hashedPassword = await argon2.hash("password123");

    const alice = await prisma.user.create({
        data: {
            name: "Alice Johnson",
            email: "alice@example.com",
            password: hashedPassword,
        },
    });

    const bob = await prisma.user.create({
        data: {
            name: "Bob Smith",
            email: "bob@example.com",
            password: hashedPassword,
        },
    });

    console.log(`👤 Created user: ${alice.name} (${alice.email})`);
    console.log(`👤 Created user: ${bob.name} (${bob.email})\n`);

    // ── Alice's Products ───────────────────────────────────────────────

    const aliceProducts = await Promise.all([
        prisma.product.create({
            data: {
                name: "Wireless Headphones",
                category: "Electronics",
                price: 79.99,
                stockQuantity: 50,
                userId: alice.id,
            },
        }),
        prisma.product.create({
            data: {
                name: "Mechanical Keyboard",
                category: "Electronics",
                price: 129.99,
                stockQuantity: 30,
                userId: alice.id,
            },
        }),
        prisma.product.create({
            data: {
                name: "Desk Lamp",
                category: "Home & Office",
                price: 34.5,
                stockQuantity: 100,
                userId: alice.id,
            },
        }),
    ]);

    console.log(`📦 Created ${aliceProducts.length} products for Alice`);

    // ── Bob's Products ─────────────────────────────────────────────────

    const bobProducts = await Promise.all([
        prisma.product.create({
            data: {
                name: "Running Shoes",
                category: "Sports",
                price: 119.99,
                stockQuantity: 25,
                userId: bob.id,
            },
        }),
        prisma.product.create({
            data: {
                name: "Yoga Mat",
                category: "Sports",
                price: 29.99,
                stockQuantity: 80,
                userId: bob.id,
            },
        }),
        prisma.product.create({
            data: {
                name: "Protein Powder",
                category: "Health",
                price: 49.99,
                stockQuantity: 60,
                userId: bob.id,
            },
        }),
    ]);

    console.log(`📦 Created ${bobProducts.length} products for Bob\n`);

    // ── Orders (cross-user only: users can't order their own products) ─

    // Bob orders Alice's products
    const order1 = await prisma.order.create({
        data: {
            orderId: generateOrderId(
                aliceProducts[0].name,
                aliceProducts[0].category
            ),
            userId: bob.id,
            productId: aliceProducts[0].id, // Wireless Headphones
            quantity: 2,
            address: "123 Main St, New York, NY 10001",
            total: 2 * Number(aliceProducts[0].price),
            status: "PENDING",
        },
    });

    const order2 = await prisma.order.create({
        data: {
            orderId: generateOrderId(
                aliceProducts[1].name,
                aliceProducts[1].category
            ),
            userId: bob.id,
            productId: aliceProducts[1].id, // Mechanical Keyboard
            quantity: 1,
            address: "123 Main St, New York, NY 10001",
            total: 1 * Number(aliceProducts[1].price),
            status: "SHIPPED",
            shippedAt: new Date("2026-07-02T10:00:00Z"),
        },
    });

    const order3 = await prisma.order.create({
        data: {
            orderId: generateOrderId(
                aliceProducts[2].name,
                aliceProducts[2].category
            ),
            userId: bob.id,
            productId: aliceProducts[2].id, // Desk Lamp
            quantity: 3,
            address: "456 Oak Ave, Brooklyn, NY 11201",
            total: 3 * Number(aliceProducts[2].price),
            status: "DELIVERED",
            shippedAt: new Date("2026-06-28T08:00:00Z"),
            deliveredAt: new Date("2026-07-01T14:30:00Z"),
        },
    });

    // Alice orders Bob's products
    const order4 = await prisma.order.create({
        data: {
            orderId: generateOrderId(
                bobProducts[0].name,
                bobProducts[0].category
            ),
            userId: alice.id,
            productId: bobProducts[0].id, // Running Shoes
            quantity: 1,
            address: "789 Pine Rd, Manhattan, NY 10013",
            total: 1 * Number(bobProducts[0].price),
            status: "SHIPPED",
            shippedAt: new Date("2026-07-03T09:00:00Z"),
        },
    });

    const order5 = await prisma.order.create({
        data: {
            orderId: generateOrderId(
                bobProducts[1].name,
                bobProducts[1].category
            ),
            userId: alice.id,
            productId: bobProducts[1].id, // Yoga Mat
            quantity: 2,
            address: "789 Pine Rd, Manhattan, NY 10013",
            total: 2 * Number(bobProducts[1].price),
            status: "CANCELED",
            canceledAt: new Date("2026-07-01T16:00:00Z"),
            canceledReason: "Changed my mind",
        },
    });

    const order6 = await prisma.order.create({
        data: {
            orderId: generateOrderId(
                bobProducts[2].name,
                bobProducts[2].category
            ),
            userId: alice.id,
            productId: bobProducts[2].id, // Protein Powder
            quantity: 1,
            address: "321 Elm St, Queens, NY 11375",
            total: 1 * Number(bobProducts[2].price),
            status: "PENDING",
        },
    });

    console.log(`🛒 Created 3 orders by Bob (ordering Alice's products)`);
    console.log(`🛒 Created 3 orders by Alice (ordering Bob's products)\n`);

    console.log("── Order Summary ──────────────────────────────────────");
    for (const order of [order1, order2, order3, order4, order5, order6]) {
        console.log(`  ${order.orderId} → ${order.status}`);
    }

    console.log("\n✅ Seeding complete!");
}

main()
    .catch((error) => {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

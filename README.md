# Studio Butterfly Take Home Assignment

## Tech Stack

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## Folder Structure

```text
prisma
├── migrations
├── schema.prisma
└── seed.ts

src
├── common
│   ├── decorator
│   ├── env
│   ├── filters
│   ├── prisma
│   ├── swagger
│   └── utils
├── generated
├── modules
│   ├── user
│   ├── product
│   └── order
├── type
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

---

## Local Setup

### Requirements

- <img src="https://cdn.simpleicons.org/nodedotjs/5FA04E" width="18" /> **Node.js 24+**
- <img src="https://cdn.simpleicons.org/mysql/4479A1" width="18" /> **MySQL 8+**
- **pnpm**

---

### Clone the Repository

```bash
git clone https://github.com/habib33-3/studio-butterfly-assignment.git
cd studio-butterfly-assignment
```

---

### Install Dependencies

```bash
pnpm install
```

---

### Environment Setup

Create a `.env` file in the project root.

```env
PORT=5000

DATABASE_URL="mysql://userName:password@localhost:3306/studio_butterfly?allowPublicKeyRetrieval=true&ssl=false"

JWT_SECRET="secret"

ACCESS_TOKEN_EXPIRES="1d"
```

---

### Database Setup

Run the following commands:

```bash
pnpm prisma migrate deploy
```

```bash
pnpm prisma generate
```

```bash
pnpm prisma db seed
```

---

### Start the Development Server

```bash
pnpm start:dev
```

---

## Docker

Start the application:

```bash
docker compose up -d
```

Stop the application:

```bash
docker compose down
```

---

## Application URLs

| Service | URL                              |
| ------- | -------------------------------- |
| API     | <http://localhost:5000>          |
| Swagger | <http://localhost:5000/api/docs> |

---

## Database Schema

### `users`

| Column    | Type     | Constraints      |
| --------- | -------- | ---------------- |
| id        | String   | Primary Key      |
| name      | String   | Required         |
| email     | String   | Unique           |
| password  | String   | Required         |
| createdAt | DateTime | Default: `now()` |
| updatedAt | DateTime | Auto Updated     |

---

### `products`

| Column        | Type          | Constraints      |
| ------------- | ------------- | ---------------- |
| id            | String        | Primary Key      |
| name          | String        | Required         |
| category      | String        | Indexed          |
| price         | Decimal(10,2) | Required         |
| stockQuantity | Int           | Default: `0`     |
| userId        | String        | Foreign Key      |
| createdAt     | DateTime      | Default: `now()` |
| updatedAt     | DateTime      | Auto Updated     |

---

### `orders`

| Column         | Type          | Constraints          |
| -------------- | ------------- | -------------------- |
| id             | String        | Primary Key          |
| orderId        | String        | Unique               |
| quantity       | Int           | Default: `1`         |
| status         | OrderStatus   | Default: `PENDING`   |
| address        | String        | Required             |
| total          | Decimal(10,2) | Required             |
| orderedAt      | DateTime      | Default: `now()`     |
| shippedAt      | DateTime      | Nullable             |
| deliveredAt    | DateTime      | Nullable             |
| canceledAt     | DateTime      | Nullable             |
| canceledReason | String        | Nullable             |
| userId         | String        | Foreign Key, Indexed |
| productId      | String        | Foreign Key, Indexed |
| createdAt      | DateTime      | Default: `now()`     |
| updatedAt      | DateTime      | Auto Updated         |

---

### `OrderStatus`

| Value       |
| ----------- |
| `PENDING`   |
| `SHIPPED`   |
| `DELIVERED` |
| `CANCELED`  |

---

## API Endpoints

### User

```text
POST   /user/register
POST   /user/login
GET    /user/me
```

### Products

```text
POST   /products
GET    /products
GET    /products/{id}
PATCH  /products/{id}
DELETE /products/{id}
```

### Orders

```text
POST   /order
GET    /order
GET    /order/received
GET    /order/{orderId}
PATCH  /order/{orderId}/shipped
PATCH  /order/{orderId}/delivered
PATCH  /order/{orderId}/cancel
```

---

## Order ID Generation

The `generateOrderId` utility is located at:

```text
src/common/utils/generate-order-id.ts
```

It accepts two arguments:

- `productName`
- `category`

The generated order ID has the following format:

```text
<PRODUCT_PREFIX>-<CATEGORY_PREFIX>-<UTC_TIMESTAMP>-<RANDOM_HEX>
```

### Generation Rules

- If the product name or category contains multiple words, the prefix is created from the uppercase initials of each word (up to 3 characters).
- If the value is a single word, the prefix is the first three alphanumeric characters converted to uppercase.
- The timestamp is generated in UTC using the format:

```text
YYYYMMDDHHMMSS
```

- A random 6-character hexadecimal suffix is generated using Node.js `crypto.randomBytes(3)`.

### Example

```ts
generateOrderId("Smart Watch", "Electronics");
```

Example output:

```text
SW-ELE-20240101120000-ABC123
```

The timestamp and random hexadecimal suffix help ensure uniqueness. As a fallback, if the generated order ID already exists in the database, the application retries the generation process up to **3 times** before returning an error.

import { randomBytes } from "node:crypto";

const prefix = (value: string): string => {
    const words = value.trim().split(/\s+/).filter(Boolean);

    if (words.length > 1) {
        return words
            .map((word) => word[0])
            .join("")
            .slice(0, 3)
            .toUpperCase();
    }

    return value
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 3)
        .toUpperCase();
};

const pad = (value: number): string => value.toString().padStart(2, "0");

export const generateOrderId = (
    productName: string,
    category: string
): string => {
    const now = new Date();

    const timestamp = [
        now.getUTCFullYear(),
        pad(now.getUTCMonth() + 1),
        pad(now.getUTCDate()),
        pad(now.getUTCHours()),
        pad(now.getUTCMinutes()),
        pad(now.getUTCSeconds()),
    ].join("");

    const random = randomBytes(3).toString("hex").toUpperCase();

    return [prefix(productName), prefix(category), timestamp, random].join("-");
};

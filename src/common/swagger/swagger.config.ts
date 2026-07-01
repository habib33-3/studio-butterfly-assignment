import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const ACCESS_TOKEN = "access-token";

export const setupSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle("API Documentation")
        .setDescription("API Documentation")
        .setVersion("1.0")
        .addBearerAuth(
            {
                bearerFormat: "JWT",
                description: "Enter Access token",
                scheme: "bearer",
                type: "http",
            },
            ACCESS_TOKEN
        )
        .addSecurityRequirements(ACCESS_TOKEN)
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("api/docs", app, document, {
        swaggerOptions: {
            deepLinking: true,
            defaultModelsExpandDepth: 1,
            displayRequestDuration: true,
            docExpansion: "list",
            filter: true,
            persistAuthorization: true,
            showExtensions: false,
            withCredentials: true,
        },
    });
};

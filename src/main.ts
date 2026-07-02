import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { env } from "./common/env/env.config";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { setupSwagger } from "./common/swagger/swagger.config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalFilters(new GlobalExceptionFilter());

    app.useGlobalPipes(
        new ValidationPipe({
            errorHttpStatusCode: 400,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            whitelist: true,
        })
    );

    setupSwagger(app);

    app.enableShutdownHooks();

    const logger = new Logger("Bootstrap");

    await app.listen(env.PORT ?? 5000);

    logger.log(`Application listening on port ${env.PORT ?? 5000}`);
    logger.log(
        `Swagger documentation available at http://localhost:${env.PORT ?? 5000}/api/docs`
    );
}

bootstrap().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    // eslint-disable-next-line no-process-exit, n/prefer-global/process
    process.exit(1);
});

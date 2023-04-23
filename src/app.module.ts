import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScraperModule } from './scraper/scraper.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [ScraperModule, CoreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

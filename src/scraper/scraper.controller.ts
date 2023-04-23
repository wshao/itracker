import { Controller, Get } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Get('scrape')
  async scrape() {
    await this.scraperService.startJob();
    return 'Scraping started';
  }
}

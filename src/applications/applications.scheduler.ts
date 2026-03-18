import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApplicationsService } from './applications.service';

@Injectable()
export class ApplicationsScheduler {
  private readonly logger = new Logger(ApplicationsScheduler.name);

  constructor(private readonly applicationsService: ApplicationsService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoComplete() {
    const count = await this.applicationsService.autoCompleteSubmitted();
    if (count > 0) {
      this.logger.log(`Auto-completed ${count} submitted applications`);
    }
  }
}

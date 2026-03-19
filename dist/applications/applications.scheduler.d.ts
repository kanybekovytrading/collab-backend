import { ApplicationsService } from './applications.service';
export declare class ApplicationsScheduler {
    private readonly applicationsService;
    private readonly logger;
    constructor(applicationsService: ApplicationsService);
    handleAutoComplete(): Promise<void>;
}

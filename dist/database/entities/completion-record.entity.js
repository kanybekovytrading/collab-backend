"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionRecord = void 0;
const typeorm_1 = require("typeorm");
const application_entity_1 = require("./application.entity");
let CompletionRecord = class CompletionRecord {
    id;
    application;
    completedAt;
};
exports.CompletionRecord = CompletionRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CompletionRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => application_entity_1.Application),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", application_entity_1.Application)
], CompletionRecord.prototype, "application", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CompletionRecord.prototype, "completedAt", void 0);
exports.CompletionRecord = CompletionRecord = __decorate([
    (0, typeorm_1.Entity)('completion_records')
], CompletionRecord);
//# sourceMappingURL=completion-record.entity.js.map
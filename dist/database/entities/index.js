"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompletionRecord = exports.PortfolioItem = exports.Review = exports.ChatMessage = exports.Application = exports.Task = exports.BrandProfile = exports.BloggerProfile = exports.User = exports.databaseEntities = void 0;
const user_entity_1 = require("./user.entity");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_entity_1.User; } });
const blogger_profile_entity_1 = require("./blogger-profile.entity");
Object.defineProperty(exports, "BloggerProfile", { enumerable: true, get: function () { return blogger_profile_entity_1.BloggerProfile; } });
const brand_profile_entity_1 = require("./brand-profile.entity");
Object.defineProperty(exports, "BrandProfile", { enumerable: true, get: function () { return brand_profile_entity_1.BrandProfile; } });
const task_entity_1 = require("./task.entity");
Object.defineProperty(exports, "Task", { enumerable: true, get: function () { return task_entity_1.Task; } });
const application_entity_1 = require("./application.entity");
Object.defineProperty(exports, "Application", { enumerable: true, get: function () { return application_entity_1.Application; } });
const chat_message_entity_1 = require("./chat-message.entity");
Object.defineProperty(exports, "ChatMessage", { enumerable: true, get: function () { return chat_message_entity_1.ChatMessage; } });
const review_entity_1 = require("./review.entity");
Object.defineProperty(exports, "Review", { enumerable: true, get: function () { return review_entity_1.Review; } });
const portfolio_item_entity_1 = require("./portfolio-item.entity");
Object.defineProperty(exports, "PortfolioItem", { enumerable: true, get: function () { return portfolio_item_entity_1.PortfolioItem; } });
const completion_record_entity_1 = require("./completion-record.entity");
Object.defineProperty(exports, "CompletionRecord", { enumerable: true, get: function () { return completion_record_entity_1.CompletionRecord; } });
exports.databaseEntities = [
    user_entity_1.User,
    blogger_profile_entity_1.BloggerProfile,
    brand_profile_entity_1.BrandProfile,
    task_entity_1.Task,
    application_entity_1.Application,
    chat_message_entity_1.ChatMessage,
    review_entity_1.Review,
    portfolio_item_entity_1.PortfolioItem,
    completion_record_entity_1.CompletionRecord,
];
//# sourceMappingURL=index.js.map
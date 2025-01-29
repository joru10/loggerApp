"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const date_fns_1 = require("date-fns");
const TestActivity_1 = __importDefault(require("../models/TestActivity"));
const Category_1 = __importDefault(require("../models/Category"));
class TestDataService {
    constructor() {
        this.sampleActivities = [
            'Meeting with team about project updates',
            'Code review session',
            'Writing documentation',
            'Debugging production issue',
            'Planning next sprint',
            'Client consultation call',
            'Database optimization',
            'UI/UX improvements',
            'Testing new features',
            'Deployment preparation'
        ];
    }
    async generateTestData(params) {
        const startDate = new Date(params.startDate);
        const timeRange = this.getTimeRange(params.reportType, startDate);
        const activities = this.generateActivities(params.activityCount, timeRange);
        await this.saveTestActivities(activities);
        return activities;
    }
    getTimeRange(reportType, date) {
        if (reportType === 'daily') {
            return {
                start: (0, date_fns_1.startOfDay)(date),
                end: (0, date_fns_1.endOfDay)(date)
            };
        }
        return {
            start: (0, date_fns_1.startOfMonth)(date),
            end: (0, date_fns_1.endOfMonth)(date)
        };
    }
    generateActivities(count, timeRange) {
        const activities = [];
        const totalMinutes = (timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60);
        for (let i = 0; i < count; i++) {
            const randomMinutes = Math.floor(Math.random() * totalMinutes);
            const startTime = (0, date_fns_1.addMinutes)(timeRange.start, randomMinutes);
            activities.push({
                id: (0, uuid_1.v4)(),
                description: this.getRandomActivity(),
                startTime: startTime.toISOString(),
                duration: Math.floor(Math.random() * 4 + 1) * 15, // 15-60 minutes
                categoryId: this.getRandomCategoryId(),
                confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
                source: {
                    audioNoteId: `test-${(0, uuid_1.v4)()}`,
                    timestamp: startTime.toISOString()
                }
            });
        }
        return activities.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }
    getRandomActivity() {
        return this.sampleActivities[Math.floor(Math.random() * this.sampleActivities.length)];
    }
    getRandomCategoryId() {
        // This should be implemented to return actual category IDs from your database
        return 'default-category-id';
    }
    async saveTestActivities(activities) {
        const testSessionId = (0, uuid_1.v4)();
        try {
            // Get available categories from database
            const categories = await Category_1.default.find({});
            if (!categories.length) {
                throw new Error('No categories found in database');
            }
            // Prepare activities with proper category references
            const activitiesToSave = activities.map(activity => ({
                ...activity,
                categoryId: this.getRandomCategory(categories)._id,
                testSessionId,
                isTest: true
            }));
            // Save all activities
            await TestActivity_1.default.insertMany(activitiesToSave);
            return testSessionId;
        }
        catch (error) {
            console.error('Failed to save test activities:', error);
            throw error;
        }
    }
    getRandomCategory(categories) {
        return categories[Math.floor(Math.random() * categories.length)];
    }
    async cleanupTestData(testSessionId) {
        try {
            await TestActivity_1.default.deleteMany({ testSessionId });
        }
        catch (error) {
            console.error('Failed to cleanup test data:', error);
            throw error;
        }
    }
}
exports.default = new TestDataService();

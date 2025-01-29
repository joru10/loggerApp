"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const testDataService_1 = __importDefault(require("../services/testDataService"));
const router = express_1.default.Router();
router.post('/generate', async (req, res) => {
    try {
        const testData = await testDataService_1.default.generateTestData(req.body);
        res.json({
            success: true,
            data: testData,
            testSessionId: testData.testSessionId
        });
    }
    catch (error) {
        console.error('Test data generation failed:', error);
        res.status(500).json({ success: false, error: 'Failed to generate test data' });
    }
});
router.delete('/cleanup/:testSessionId', async (req, res) => {
    try {
        await testDataService_1.default.cleanupTestData(req.params.testSessionId);
        res.json({ success: true });
    }
    catch (error) {
        console.error('Test data cleanup failed:', error);
        res.status(500).json({ success: false, error: 'Failed to cleanup test data' });
    }
});
exports.default = router;

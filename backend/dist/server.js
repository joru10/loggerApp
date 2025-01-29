"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const health_1 = __importDefault(require("./routes/health"));
dotenv_1.default.config();
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/audio-logger';
// Move route registration before MongoDB connection
app_1.default.use('/api/health', health_1.default);
mongoose_1.default.connect(mongoUri)
    .then(() => {
    console.log('Connected to MongoDB');
    app_1.default.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

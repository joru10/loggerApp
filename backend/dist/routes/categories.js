"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Category_1 = require("../models/Category"); // Change this line
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const categories = await Category_1.Category.find();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
router.post('/', async (req, res) => {
    try {
        const category = new Category_1.Category(req.body);
        await category.save();
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const category = await Category_1.Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        await Category_1.Category.findByIdAndDelete(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});
exports.default = router;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  List,
  ListItem,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { ActivityCategory } from '../types/activity';
// Update imports
import { api } from '../services/api';

const ActivityConfig = () => {
  const [categories, setCategories] = useState<ActivityCategory[]>([]);
  const [newCategory, setNewCategory] = useState<Partial<ActivityCategory>>({
    keywords: []
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteCategory(id);
      const updated = await api.getCategories();
      setCategories(updated);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await api.updateCategory(editingId, {
          name: newCategory.name || '',
          description: newCategory.description || '',
          keywords: newCategory.keywords || []
        });
      } else {
        await api.createCategory({
          name: newCategory.name || '',
          description: newCategory.description || '',
          keywords: newCategory.keywords || []
        });
      }
      // Refresh categories
      const updated = await api.getCategories();
      setCategories(updated);
      setNewCategory({ keywords: [] });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Activity Categories Configuration
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {editingId ? 'Edit Category' : 'Add New Category'}
        </Typography>
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Category Name"
            value={newCategory.name || ''}
            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            label="Description"
            multiline
            rows={2}
            value={newCategory.description || ''}
            onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
          />
          <TextField
            label="Keywords (comma-separated)"
            value={newCategory.keywords?.join(', ') || ''}
            onChange={(e) => setNewCategory(prev => ({
              ...prev,
              keywords: e.target.value.split(',').map(k => k.trim())
            }))}
            helperText="Add keywords that help identify this category in audio notes"
          />
          <Button variant="contained" onClick={handleSave}>
            {editingId ? 'Update' : 'Add'} Category
          </Button>
        </Box>
      </Paper>

      <List>
        {categories.map((category) => (
          <ListItem
            key={category.id}
            secondaryAction={
              <Box>
                <IconButton onClick={() => {
                  setEditingId(category.id);
                  setNewCategory(category);
                }}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(category.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle1">{category.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {category.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {category.keywords.map((keyword, idx) => (
                  <Chip key={idx} label={keyword} size="small" />
                ))}
              </Box>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ActivityConfig;
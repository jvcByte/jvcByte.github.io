// Simple Express server for CMS file saving
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Save data endpoint
app.post('/api/save-data', async (req, res) => {
    try {
        const { filename, data } = req.body;
        
        // Validate filename
        const allowedFiles = [
            'personal.json', 'services.json', 'awards.json', 'skills.json',
            'experience.json', 'education.json', 'certifications.json', 
            'projects.json', 'blog.json'
        ];
        
        if (!allowedFiles.includes(filename)) {
            return res.status(400).json({ error: 'Invalid filename' });
        }
        
        // Write file to data directory
        const filePath = path.join(__dirname, 'data', filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        
        res.json({ success: true, message: `${filename} saved successfully` });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

// Save all data endpoint
app.post('/api/save-all-data', async (req, res) => {
    try {
        const { data } = req.body;
        const results = [];
        
        // Save each data file
        for (const [key, value] of Object.entries(data)) {
            const filename = `${key}.json`;
            const filePath = path.join(__dirname, 'data', filename);
            
            await fs.writeFile(filePath, JSON.stringify(value, null, 2));
            results.push(filename);
        }
        
        res.json({ 
            success: true, 
            message: `Saved ${results.length} files successfully`,
            files: results
        });
    } catch (error) {
        console.error('Error saving files:', error);
        res.status(500).json({ error: 'Failed to save files' });
    }
});

app.listen(PORT, () => {
    console.log(`CMS Server running on http://localhost:${PORT}`);
});
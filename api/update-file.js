/**
 * Serverless function to update JSON files in GitHub repository
 * Works with Vercel, Netlify, or any serverless platform
 */

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { filename, content, token, repo, owner, branch = 'main' } = req.body;

        // Validate required fields
        if (!filename || !content || !token || !repo || !owner) {
            return res.status(400).json({ 
                error: 'Missing required fields: filename, content, token, repo, owner' 
            });
        }

        // Validate filename
        const allowedFiles = [
            'personal.json',
            'services.json',
            'awards.json',
            'skills.json',
            'experience.json',
            'education.json',
            'certifications.json',
            'projects.json',
            'blog.json'
        ];

        if (!allowedFiles.includes(filename)) {
            return res.status(400).json({ error: 'Invalid filename' });
        }

        // Get the current file to get its SHA (required for update)
        const filePath = `data/${filename}`;
        const getFileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
        
        let fileSha = null;
        try {
            const getFileResponse = await fetch(getFileUrl, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (getFileResponse.ok) {
                const fileData = await getFileResponse.json();
                fileSha = fileData.sha;
            }
        } catch (error) {
            console.log('File does not exist or error fetching:', error.message);
        }

        // Prepare file content (base64 encoded)
        const jsonContent = JSON.stringify(content, null, 2);
        const base64Content = Buffer.from(jsonContent).toString('base64');

        // Update file via GitHub API
        const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
        
        const updatePayload = {
            message: `Update ${filename} via CMS`,
            content: base64Content,
            branch: branch
        };

        // Include SHA if file exists (for update), omit if new file
        if (fileSha) {
            updatePayload.sha = fileSha;
        }

        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatePayload)
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            console.error('GitHub API error:', errorData);
            return res.status(updateResponse.status).json({ 
                error: errorData.message || 'Failed to update file on GitHub' 
            });
        }

        const result = await updateResponse.json();
        
        return res.status(200).json({
            success: true,
            message: `File ${filename} updated successfully`,
            commit: result.commit
        });

    } catch (error) {
        console.error('Error updating file:', error);
        return res.status(500).json({ 
            error: 'Internal server error: ' + error.message 
        });
    }
}


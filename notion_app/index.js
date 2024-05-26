const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_API_BASE_URL = process.env.NOTION_API_BASE_URL;
const CREATE_DATABASE_ENDPOINT = '/databases';
const CREATE_PAGE_ENDPOINT = '/pages';

const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY;
const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_URL = 'https://trackapi.nutritionix.com/v2/natural/nutrients';

// Enable CORS
app.use(cors());
app.use(express.json());

// Endpoint to create a database
app.post('/api/create-database', async (req, res) => {
    const { page_id, database_title } = req.body;

    if (!page_id || !database_title) {
        return res.status(400).json({ error: 'page_id and database_title are required' });
    }

    try {
        const response = await axios.post(
            `${NOTION_API_BASE_URL}${CREATE_DATABASE_ENDPOINT}`,
            {
                parent: {
                    type: 'page_id',
                    page_id: page_id
                },
                title: [
                    {
                        type: 'text',
                        text: {
                            content: database_title
                        }
                    }
                ],
                properties: {
                    Name: {
                        title: {}
                    },
                    Description: {
                        rich_text: {}
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${NOTION_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2021-05-13'
                }
            }
        );

        res.status(200).json({ message: 'Database created successfully', data: response.data });
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

// Endpoint to create a page
app.post('/api/create-page', async (req, res) => {
    const { parent_id, title, content } = req.body;

    if (!parent_id || !title || !content) {
        return res.status(400).json({ error: 'parent_id, title, and content are required' });
    }

    try {
        const response = await axios.post(
            `${NOTION_API_BASE_URL}${CREATE_PAGE_ENDPOINT}`,
            {
                parent: {
                    type: 'database_id',
                    database_id: parent_id
                },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: title
                                }
                            }
                        ]
                    }
                },
                children: [
                    {
                        object: 'block',
                        type: 'paragraph',
                        paragraph: {
                            text: [
                                {
                                    type: 'text',
                                    text: {
                                        content: content
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${NOTION_API_KEY}`,
                    'Content-Type': 'application/json',
                    'Notion-Version': '2021-05-13'
                }
            }
        );

        res.status(200).json({ message: 'Page created successfully', data: response.data });
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

// Endpoint to fetch nutrition facts
app.post('/api/nutrition-facts', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'query is required' });
    }

    try {
        const response = await axios.post(
            NUTRITIONIX_API_URL,
            { query },
            {
                headers: {
                    'x-app-id': NUTRITIONIX_APP_ID,
                    'x-app-key': NUTRITIONIX_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

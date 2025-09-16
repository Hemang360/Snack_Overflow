const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve index.html for all routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌿 Frontend server running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser and navigate to the URL above`);
    console.log(`🔗 Backend API: http://localhost:5000`);
});

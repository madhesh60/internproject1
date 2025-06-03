const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const cors = require('cors'); 

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());

const USERS = [
    { username: 'user', password: 'password' }
];
const JWT_SECRET = 'sndqwiudhwd1ish1w121212';

// --- JWT Authentication Middleware ---
/**
 * Middleware to authenticate JWT tokens.
 * Checks if a valid JWT token is present in the Authorization header.
 * If valid, it attaches the user information to the request object and proceeds.
 * Otherwise, it sends a 403 Forbidden response.
 * @param {Object} req - The Express request object.
 * @param {Object} res 
 * @param {Function} next

*/

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = USERS.find(u => u.username === username && u.password === password);

    if (user) {
        const accessToken = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        console.log(`User '${username}' logged in successfully. Token generated.`);
        res.json({ accessToken: accessToken });
    } else {
        console.log(`Login failed for username: '${username}'. Invalid credentials.`);
        res.status(401).send('Invalid Credentials');
    }
});

app.post('/generate-pdf', authenticateToken, (req, res) => {
    const { content } = req.body;

    if (!content) {
        console.log('PDF generation failed: No content provided.');
        return res.status(400).send('No content provided for PDF generation.');
    }

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated_document.pdf"');

    doc.pipe(res);

    doc.fontSize(25).text('Generated Document', { align: 'center' });
    doc.moveDown(); 
    doc.fontSize(12).text(content, {
        align: 'left',
        indent: 20,
        paragraphGap: 10
    });
    doc.end();
    console.log(`PDF generated and sent for user: ${req.user.username}`);
});


app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
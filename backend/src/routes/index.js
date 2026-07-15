const express = require('express');
const upload = require('../middleware/upload');
const { apiRateLimiter } = require('../middleware/rateLimiter');

const { verifyPhoto } = require('../controllers/photoController');
const { verifyScreenshot } = require('../controllers/screenshotController');
const { verifyVideo } = require('../controllers/videoController');
const { verifyMessage } = require('../controllers/messageController');
const { verifyLink } = require('../controllers/linkController');
const { verifyPhone } = require('../controllers/phoneController');
const { verifyNews } = require('../controllers/newsController');

const router = express.Router();

router.use(apiRateLimiter);

router.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

router.post('/verify/photo', upload.single('file'), verifyPhoto);
router.post('/verify/screenshot', upload.single('file'), verifyScreenshot);
router.post('/verify/video', express.json(), verifyVideo);
router.post('/verify/message', express.json(), verifyMessage);
router.post('/verify/link', express.json(), verifyLink);
router.post('/verify/phone', express.json(), verifyPhone);
router.post('/verify/news', express.json(), verifyNews);

// Reserved routes for V2 — kept here (disabled) so the architecture already
// has a slot for them without restructuring later:
// router.use('/auth', require('./auth'));
// router.use('/admin', require('./admin'));
// router.use('/history', require('./history'));

module.exports = router;

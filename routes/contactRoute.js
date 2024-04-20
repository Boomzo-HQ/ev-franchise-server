const express = require("express");
const contactController = require('../controller/contactController');

const router = express.Router();

router.get('/', contactController.getContactRequests);
router.post('/', contactController.postContactRequest);

module.exports = router;
const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/overview', viewsController.getOverview);
router.get('/tour/:tourSlug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/profile', authController.protect, viewsController.getAccount);

module.exports = router;

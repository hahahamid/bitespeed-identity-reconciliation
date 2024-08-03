import express from 'express';
import * as identityController from '../controllers/contactController.js';

const router = express.Router();

router.post('/identify', identityController.identify);

export default router;
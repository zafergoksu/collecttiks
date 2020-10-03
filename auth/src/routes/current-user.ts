import express from 'express';
import jwt from 'jsonwebtoken';

import { currentUser } from '@zgoksutickets/common-utils';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
    res.send({ currentUser: req.currentUser || null });
});

export default router;

'use strict';

import {Router} from 'express';
import * as controller from './main.controller';

const router = new Router();

router.get('/', controller.get);

module.exports = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.post('/signup', userController_1.approveSignup);
router.post('/login', userController_1.loginUser);
router.get('/', authMiddleware_1.authenticateJWT, userController_1.showUserData);
router.post('/borrow', authMiddleware_1.authenticateJWT, userController_1.borrowMoney);
exports.default = router;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.borrowMoney = exports.showUserData = exports.loginUser = exports.approveSignup = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const signupSchema = zod_1.z.object({
    phoneNumber: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    dateOfRegistration: zod_1.z.string(),
    dob: zod_1.z.string(),
    monthlySalary: zod_1.z.number().min(25000),
    password: zod_1.z.string().min(6)
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
const borrowSchema = zod_1.z.object({
    amount: zod_1.z.number().min(100)
});
const approveSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = signupSchema.parse(req.body);
        const { email, dob, monthlySalary, password } = parsedData;
        const age = new Date().getFullYear() - new Date(dob).getFullYear();
        if (age <= 20) {
            return res.status(400).json({ message: 'User must be above 20 years old' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: Object.assign(Object.assign({}, parsedData), { password: hashedPassword, status: monthlySalary >= 25000 ? 'approved' : 'rejected', purchasePower: monthlySalary * 3 })
        });
        res.status(201).json(user);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});
exports.approveSignup = approveSignup;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user || !(yield bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        res.status(500).json({ error: 'Something went wrong' });
    }
});
exports.loginUser = loginUser;
const showUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            purchasePower: user.purchasePower,
            phoneNumber: user.phoneNumber,
            email: user.email,
            dateOfRegistration: user.dateOfRegistration,
            dob: user.dob,
            monthlySalary: user.monthlySalary
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});
exports.showUserData = showUserData;
const borrowMoney = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount } = borrowSchema.parse(req.body);
        const userId = req.user.userId;
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.purchasePower -= amount;
        yield prisma.user.update({
            where: { id: userId },
            data: { purchasePower: user.purchasePower }
        });
        const interestRate = 0.08;
        const tenure = 12;
        const monthlyRepayment = (amount + (amount * interestRate)) / tenure;
        res.json({
            updatedPurchasePower: user.purchasePower,
            monthlyRepayment
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});
exports.borrowMoney = borrowMoney;

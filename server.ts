
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://zimadverts10_db:king123301@cluster0.apekmvj.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas - Production Ready'))
  .catch(err => {
    console.error('❌ CRITICAL: MongoDB Connection Error:', err.message);
  });

// --- SCHEMAS ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'seller', 'buyer', 'graduate'], default: 'buyer' },
  whatsapp: String,
  location: String
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  sellerId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  image: { type: String, default: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076' },
  status: { type: String, enum: ['active', 'sold', 'disabled'], default: 'active' }
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  buyerId: { type: String, required: true },
  sellerId: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
  reference: String
}, { timestamps: true });

const disputeSchema = new mongoose.Schema({
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  creatorId: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['open', 'under_review', 'resolved', 'rejected'], default: 'open' },
  resolutionNotes: String
}, { timestamps: true });

const graduateProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number, required: true },
  bio: String,
  skills: [String],
  approved: { type: Boolean, default: false },
  contactEmail: String,
  contactWhatsApp: String,
  certificateUrl: String
}, { timestamps: true });

const configSchema = new mongoose.Schema({
  paymentNumber: { type: String, default: '0778606878' },
  methods: { type: [String], default: ['EcoCash', 'InnBucks', 'Mukuru'] },
  contactEmail: String,
  contactWhatsApp: String
}, { timestamps: true });

const auditLogSchema = new mongoose.Schema({
  adminId: String,
  action: String,
  entityId: String,
  details: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Dispute = mongoose.model('Dispute', disputeSchema);
const GraduateProfile = mongoose.model('GraduateProfile', graduateProfileSchema);
const Config = mongoose.model('Config', configSchema);
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

const logAction = async (adminId: string, action: string, entityId: string, details: string) => {
  await AuditLog.create({ adminId, action, entityId, details });
};

// --- ROUTES ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: 'Registration Failed' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ error: 'Incorrect credentials' });
    res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: 'Login Error' }); }
});

app.get('/api/users', async (req, res) => {
  try { res.json(await User.find().select('-password')); }
  catch (e) { res.status(500).json({ error: 'Fetch failed' }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { adminId } = req.body;
    await User.findByIdAndDelete(req.params.id);
    await logAction(adminId, 'DELETE_USER', req.params.id, 'User removed');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Delete failed' }); }
});

app.get('/api/products', async (req, res) => {
  try { res.json(await Product.find({ status: 'active' }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: 'Fetch error' }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (e) { res.status(400).json({ error: 'Save Error' }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { sellerId, role } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    if (product.sellerId !== sellerId && role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await Product.findByIdAndDelete(req.params.id);
    if (role === 'admin') await logAction(sellerId, 'ADMIN_DELETE_PRODUCT', req.params.id, 'Forced removal');
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Delete Error' }); }
});

app.get('/api/payments', async (req, res) => {
  try { res.json(await Payment.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: 'Fetch error' }); }
});

app.post('/api/payments', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (e) { res.status(400).json({ error: 'Save error' }); }
});

app.patch('/api/payments/:id/verify', async (req, res) => {
  const { status, adminId } = req.body;
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (status === 'confirmed' && payment) {
      await Product.findByIdAndUpdate(payment.productId, { status: 'sold' });
    }
    await logAction(adminId, 'VERIFY_PAYMENT', req.params.id, `Set to ${status}`);
    res.json(payment);
  } catch (e) { res.status(400).json({ error: 'Verify Error' }); }
});

app.get('/api/disputes', async (req, res) => {
  try { res.json(await Dispute.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: 'Fetch error' }); }
});

app.post('/api/disputes', async (req, res) => {
  try {
    const dispute = new Dispute(req.body);
    await dispute.save();
    res.status(201).json(dispute);
  } catch (e) { res.status(400).json({ error: 'Save failed' }); }
});

app.patch('/api/disputes/:id', async (req, res) => {
  try {
    const { adminId, ...update } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(req.params.id, update, { new: true });
    await logAction(adminId, 'UPDATE_DISPUTE', req.params.id, JSON.stringify(update));
    res.json(dispute);
  } catch (e) { res.status(400).json({ error: 'Update failed' }); }
});

app.get('/api/graduates', async (req, res) => {
  try { res.json(await GraduateProfile.find({ approved: true }).sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: 'Fetch error' }); }
});

app.post('/api/graduates', async (req, res) => {
  try {
    const { userId } = req.body;
    const profile = await GraduateProfile.findOneAndUpdate({ userId }, req.body, { upsert: true, new: true });
    res.status(201).json(profile);
  } catch (e) { res.status(400).json({ error: 'Profile error' }); }
});

app.get('/api/config', async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) config = await Config.create({});
    res.json(config);
  } catch (e) { res.status(500).json({ error: 'Fetch error' }); }
});

app.patch('/api/config', async (req, res) => {
  try {
    const { adminId, ...update } = req.body;
    const config = await Config.findOneAndUpdate({}, update, { upsert: true, new: true });
    await logAction(adminId, 'UPDATE_CONFIG', 'SYSTEM', 'Platform updated');
    res.json(config);
  } catch (e) { res.status(400).json({ error: 'Update error' }); }
});

app.get('/api/audit-logs', async (req, res) => {
  try { res.json(await AuditLog.find().sort({ createdAt: -1 })); }
  catch (e) { res.status(500).json({ error: 'Fetch logs error' }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Farmers Marketplace Core Live on ${PORT}`));

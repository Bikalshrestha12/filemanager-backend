import { verifyUser } from '../../../lib/auth';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', 'https://filemanager-upcr.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Verify user (connect this to your DB/auth logic)
    const user = await verifyUser(email, password);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate and return token (JWT or session cookie)
    // Here, returning a mock token (replace with real JWT logic)
    const token = 'your-real-jwt-or-session-token-here';

    return res.status(200).json({ message: 'Login successful', token, user: { id: user.id, email: user.email } });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

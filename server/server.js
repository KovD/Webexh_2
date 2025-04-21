const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(cors());
app.use(express.json());

const User = require('./models/User');
const Grill = require('./models/Grillfriend');

const auth = (req, res, next) => {
  try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
          return res.status(401).json({ message: 'Hiányzó token' });
      }

      const decodedToken = jwt.decode(token);
      if (!decodedToken) {
          return res.status(401).json({ message: 'Érvénytelen token formátum' });
      }

      if (decodedToken.exp * 1000 < Date.now()) {
          return res.status(401).json({ message: 'Lejárt token', code: 'TOKEN_EXPIRED' });
      }

      const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.userData = verifiedToken;
      next();
  } catch (error) {
      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Lejárt token', code: 'TOKEN_EXPIRED' });
      }
      if (error.name === 'JsonWebTokenError') {
          return res.status(401).json({ message: 'Érvénytelen token' });
      }
      return res.status(401).json({ message: 'Hitelesítési hiba' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if(req.userData.admin) {
      next();
    } else {
      return res.status(403).json({ message: 'Csak adminok számára engedélyezett' });
    }
  });
};

app.post('/api/register', async (req, res) => {
  try {
    const user = new User(req.body);
    user.admin = false
    
    if (user.role === 'restaurant' && (!user.restaurantName || !user.address)) {
      return res.status(400).json({ message: 'Restaurant name and address are required' });
    }

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/grills/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, picture, desc } = req.body;

    if (!name || !picture || !desc) {
      return res.status(400).json({ message: 'Minden mező kitöltése kötelező' });
    }

    const updatedGrill = await Grill.findByIdAndUpdate(
      id,
      { name, picture, desc },
      { new: true, runValidators: true }
    );

    if (!updatedGrill) {
      return res.status(404).json({ message: 'Grill nem található' });
    }

    res.json(updatedGrill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', async (req, res) => {

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user._id, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});
  
  app.post('/api/grills', adminAuth, async (req, res) => {
    try {
      const { name, picture, desc } = req.body;
      
      if(!name || !picture || !desc) {
        return res.status(400).json({ message: 'Minden mező kitöltése kötelező' });
      }
  
      const newGrill = new Grill({ name, picture, desc });
      await newGrill.save();
      res.status(201).json(newGrill);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
    });

  app.get('/api/grills', auth, async (req, res) => {
    try {
      const grills = await Grill.find();
      const user = await User.findById(req.userData.userId);
      const response = grills.map(grill => ({
        ...grill.toObject(),
        isLiked: user.likedGrills.includes(grill._id)
      }));
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/grills/:id/like', auth, async (req, res) => {
    try {
      const grill = await Grill.findById(req.params.id);
      if (!grill) {
        return res.status(404).json({ message: 'Grill not found' });
      }
  
      const user = await User.findById(req.userData.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log(user, grill)
  
      const grillIdStr = grill._id.toString();
      const index = user.likedGrills.findIndex(id => id.toString() === grillIdStr);
  
      if (index === -1) {
        grill.likes++;
        user.likedGrills.push(grill._id);
      } else {
        grill.likes--;
        user.likedGrills.splice(index, 1);
      }
  
      await grill.save();
      await user.save();
  
      res.json({ 
        likes: grill.likes, 
        isLiked: index === -1 
      });
  
    } catch (error) {
      console.error('Error in like route:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete('/api/grills/:id', adminAuth, async (req, res) => {
    try {
      const grillId = req.params.id;
      const grill = await Grill.findByIdAndDelete(grillId);
      
      if (!grill) {
        return res.status(404).json({ message: 'Grill nem található' });
      }
  
      await User.updateMany(
        { likedGrills: grillId },
        { $pull: { likedGrills: grillId } }
      );
  
      res.json({ message: 'Grill sikeresen törölve' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

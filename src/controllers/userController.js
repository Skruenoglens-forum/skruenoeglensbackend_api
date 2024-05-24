const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const auth = require('../utils/auth');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class UserController {
  async getAll(req, res) {
    try {
      const users = await userModel.getAllUsers();

      users.forEach((u) => { delete u.password });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req, res) {
    const userId = req.params.id;

    try {
      const user = await userModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      delete user.password;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req, res) {
    const { name, email, password, description, profileImage } = req.body;
    const base64String = profileImage ;

    try {
      // CHECK IF USER EXISTS
      const user = await userModel.getUserByEmail(email);
      if (user) {
        return res.status(404).json({ error: 'Email is taken' });
      }

      // SAVE IMAGE
      let profileImagePath = ""

      if (base64String) {
        // Convert base64 string to buffer
        const buffer = Buffer.from(base64String, 'base64');

        // Define a file path and write the buffer to a file
        const uniqueId = `${Date.now()}-${uuidv4()}`;
        const filePath = `/Users/emilandersen/Desktop/Svendeprøve/SkruenoeglensForumFrontend/static/profileImages/${uniqueId}.png`
        profileImagePath = `/profileImages/${uniqueId}.png`
        fs.writeFile(filePath, buffer, (err) => {
          if (err) {
              console.error('Error saving image:', err);
              return res.status(500).send('Error saving image');
          }
        });
      }

      // SAVE USER
      const hash = bcrypt.hashSync(password, 10);
      const newUser = await userModel.createUser(name, email, hash, description, profileImagePath);

      delete newUser.password;
      res.status(201).json(newUser);
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async update(req, res) {
    const userId = req.params.id;
    const { name, email, description, profileImage} = req.body;
    const base64String = profileImage;

    const token = req.header("Authorization");

    try {
      const decoded = auth.verifyToken(token);
      if (!decoded || (decoded.uid != userId && decoded.roleId !== auth.ADMIN_ROLE_ID)) {
        return res.status(403).json({ error: 'You are not allowed to update other users' });
      }

      const emailIsTaken = await userModel.isEmailTakenByOtherUser(userId, email);
      if (emailIsTaken) {
        return res.status(400).json({ error: 'Email is taken by other user' });
      }

      // SAVE IMAGE
      let profileImagePath = ""

      if (base64String) {
        // Convert base64 string to buffer
        const buffer = Buffer.from(base64String, 'base64');

        // Define a file path and write the buffer to a file
        const uniqueId = `${Date.now()}-${uuidv4()}`;
        const filePath = `/Users/emilandersen/Desktop/Svendeprøve/SkruenoeglensForumFrontend/static/profileImages/${uniqueId}.png`
        profileImagePath = `/profileImages/${uniqueId}.png`
        fs.writeFile(filePath, buffer, (err) => {
          if (err) {
              console.error('Error saving image:', err);
              return res.status(500).send('Error saving image');
          }
        });
      }

      const updatedUser = await userModel.updateUser(userId, name, email, description, profileImagePath);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      delete updatedUser.password;
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async delete(req, res) {
    const userId = req.params.id;
    const token = req.header("Authorization");

    try {
      const decoded = auth.verifyToken(token);

      if (!decoded || (decoded.roleId == auth.DEFAULT_ROLE_ID && decoded.uid != userId)) {
        return res.status(403).json({ error: 'You are not allowed to delete other users' });
      }

      const deletedUser = await userModel.deleteUser(userId);
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      delete deletedUser.password;
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();

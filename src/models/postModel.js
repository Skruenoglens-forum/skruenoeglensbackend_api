const db = require('../utils/db');

class PostModel {
  async getAllPosts() {
    try {
      const query = `
        SELECT *
        FROM post
      `;
      const [rows] = await db.query(query);
      return rows;
    } catch (error) {
      console.error('Error in getAllPosts:', error);
      throw error;
    }
  }

  async getPostById(postId) {
    try {
      const query = `
        SELECT *
        FROM post
        WHERE id = ?;
      `;
      const [rows] = await db.query(query, [postId]);
      return rows[0];
    } catch (error) {
      console.error('Error in getPostById:', error);
      throw error;
    }
  }

  async getAllPostsByUserId(userId) {
    try {
      const query = `
        SELECT *
        FROM post
        WHERE userId = ?
      `;
      const [rows] = await db.query(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Error in getAllPostsByUserId:', error);
      throw error;
    }
  }

  async isUserOwnerOfPost(userId, postId) {
    try {
      const query = `
        SELECT * FROM post 
        WHERE userId = ? AND id = ?
      `;
      const [rows] = await db.query(query, [userId, postId]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error in isUserOwnerOfPost:', error);
      throw error;
    }
  }
  
  async createPost(userId, title, description, carBrand, carMotor, carFirstRegistration, carModel, carType, parentId) {
    try {
      const query = `
        INSERT INTO post (userId, title, description, carBrand, carMotor, carFirstRegistration, carModel, carType, parentId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(query, [userId, title, description, carBrand, carMotor, carFirstRegistration, carModel, carType, parentId]);
      const insertedId = result.insertId;
      const newPost = await this.getPostById(insertedId);
      return newPost;
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  }

  async updatePost(postId, title, description, carBrand, carMotor, carFirstRegistration, carModel, carType, parentId) {
    try {
      const query = `
        UPDATE post
        SET title = ?, description = ?, carBrand = ?, carMotor = ?, carFirstRegistration = ?, carModel = ?, carType = ?, parentId = ? WHERE id = ?
      `;
      const [result] = await db.query(query, [title, description, carBrand, carMotor, carFirstRegistration, carModel, carType, parentId, postId]);
      if (result.affectedRows === 0) {
        return null;
      }
      const updatedPost = await this.getPostById(postId)
      return updatedPost ;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  async deletePost(postId) {
    try {
      const query = `
        DELETE FROM post WHERE id = ?
      `;
      const [result] = await db.query(query, [postId]);
      if (result.affectedRows === 0) {
        return null;
      }
      return true;
    } catch (error) {
      console.error('Error in deletepost:', error);
      throw error;
    }
  }
}

module.exports = new PostModel();

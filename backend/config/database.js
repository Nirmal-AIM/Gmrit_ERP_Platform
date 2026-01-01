/**
 * Database Configuration
 * 
 * This file sets up the connection to MySQL database using Sequelize ORM
 * Sequelize is an Object-Relational Mapping (ORM) tool that lets us work with
 * the database using JavaScript objects instead of writing raw SQL queries
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

// Create a new Sequelize instance with connection details from environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME || 'academic_erp',     // Database name
  process.env.DB_USER || 'root',              // MySQL username
  process.env.DB_PASSWORD || '',              // MySQL password
  {
    host: process.env.DB_HOST || 'localhost', // Database host
    port: process.env.DB_PORT || 3306,        // MySQL port
    dialect: 'mysql',                         // Database type
    
    // Connection pool configuration for better performance
    pool: {
      max: 10,          // Maximum number of connections
      min: 0,           // Minimum number of connections
      acquire: 30000,   // Maximum time (ms) to get connection before throwing error
      idle: 10000       // Maximum time (ms) a connection can be idle before being released
    },
    
    // Logging configuration
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Timezone configuration
    timezone: '+05:30', // IST timezone
    
    // Define options for all models
    define: {
      timestamps: true,      // Automatically add createdAt and updatedAt fields
      underscored: false,    // Use camelCase instead of snake_case
      freezeTableName: true  // Don't pluralize table names
    }
  }
);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1); // Exit if database connection fails
  }
};

// Export the sequelize instance and test function
module.exports = { sequelize, testConnection };

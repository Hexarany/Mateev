const mongoose = require('mongoose');
require('dotenv').config();

async function checkCategory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const category = await mongoose.connection.db.collection('categories').findOne({ 
      slug: 'osnovy-anatomii-dlya-massazhistov' 
    });
    
    console.log('\n📋 Category found:', JSON.stringify(category, null, 2));
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCategory();

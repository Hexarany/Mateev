const mongoose = require('mongoose');
require('dotenv').config();

async function fixModelUrl() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://hardyty:1973852046QAZwsxedc@anatomiacluster.a6x1lrz.mongodb.net/anatomia?retryWrites=true&w=majority&appName=AnatomiaCluster';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Update the AnatomyModel3D record
    const result = await mongoose.connection.db.collection('anatomymodel3ds').updateOne(
      { _id: new mongoose.Types.ObjectId('695791c2bff8958b2204352f') },
      { $set: { modelUrl: '/uploads/human_thorax-1763924710386-263921993.glb' } }
    );

    console.log('✅ Updated:', result);
    console.log('Modified count:', result.modifiedCount);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixModelUrl();

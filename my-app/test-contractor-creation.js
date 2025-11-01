const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testCreateContractor() {
  try {
    console.log('Testing contractor creation...');
    
    const testData = {
      name: 'Test Contractor',
      email: 'test.contractor@gmail.com',
      phone: '9876543210',
      latitude: 17.385044,
      longitude: 78.486671,
      status: 'active',
      isAvailable: true
    };

    console.log('Test data:', testData);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testData.email.toLowerCase() }
    });

    if (existingUser) {
      console.log('User already exists, deleting...');
      const existingContractor = await prisma.contractor.findUnique({
        where: { email: testData.email.toLowerCase() }
      });
      if (existingContractor) {
        await prisma.contractor.delete({ where: { id: existingContractor.id } });
      }
      await prisma.user.delete({ where: { id: existingUser.id } });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log('Password hashed');

    // Create in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: testData.name,
          email: testData.email.toLowerCase(),
          password: hashedPassword,
          role: 'contractor',
          isActive: true,
        }
      });
      console.log('User created:', user.id);

      // Create contractor
      const contractor = await tx.contractor.create({
        data: {
          name: testData.name,
          email: testData.email.toLowerCase(),
          phone: testData.phone,
          userId: user.id,
          latitude: testData.latitude,
          longitude: testData.longitude,
          status: testData.status,
          isAvailable: testData.isAvailable,
        }
      });
      console.log('Contractor created:', contractor.id);

      return contractor;
    });

    console.log('✅ Success! Contractor created:', result);
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateContractor();

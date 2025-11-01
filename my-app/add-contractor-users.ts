import { prisma } from './src/lib/prisma';
const bcrypt = require('bcryptjs');

async function addContractorToUsers() {
  try {
    // Get all contractors without userId
    const contractors = await prisma.contractor.findMany({
      where: {
        userId: null
      }
    });

    if (contractors.length === 0) {
      console.log('No contractors found without user accounts.');
      return;
    }

    console.log(`Found ${contractors.length} contractor(s) without user accounts.`);

    for (const contractor of contractors) {
      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: contractor.email }
      });

      if (existingUser) {
        console.log(`User already exists for ${contractor.email}, linking...`);
        
        // Update contractor with existing userId
        await prisma.contractor.update({
          where: { id: contractor.id },
          data: { userId: existingUser.id }
        });

        console.log(`✅ Linked contractor "${contractor.name}" to existing user account.`);
      } else {
        // Hash default password
        const defaultPassword = '123456';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Create user account
        const newUser = await prisma.user.create({
          data: {
            name: contractor.name,
            email: contractor.email,
            password: hashedPassword,
            role: 'contractor',
            isActive: true,
          }
        });

        // Update contractor with userId
        await prisma.contractor.update({
          where: { id: contractor.id },
          data: { userId: newUser.id }
        });

        console.log(`✅ Created user account for "${contractor.name}" (${contractor.email})`);
        console.log(`   Email: ${contractor.email}`);
        console.log(`   Password: 123456`);
      }
    }

    console.log('\n✨ All contractors now have user accounts!');
  } catch (error) {
    console.error('Error adding contractors to users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addContractorToUsers();

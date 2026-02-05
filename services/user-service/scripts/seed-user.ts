import 'dotenv/config';
import { AppDataSource } from '../src/config/database';
import { User } from '../src/models/User';
import { UserProfile } from '../src/models/UserProfile';
import { UserRole, UserStatus } from '@startup-platform/types';

async function seedUser() {
    try {
        console.log('Initializing database connection...');
        await AppDataSource.initialize();
        console.log('Database connected.');

        const email = 'seed_user@example.com';
        const password = 'Password123!';

        const userRepository = AppDataSource.getRepository(User);

        // Check if user exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            console.log('User already exists:', email);
            process.exit(0);
        }

        console.log('Creating new verified user...');

        // Create User
        const user = new User();
        user.email = email;
        user.password = password; // Will be hashed by BeforeInsert hook
        user.role = UserRole.USER;
        user.status = UserStatus.ACTIVE;
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();

        // Create Profile
        const profile = new UserProfile();
        profile.firstName = 'Seed';
        profile.lastName = 'User';
        profile.bio = 'I was created via seed script.';

        // Link profile - OneToOne cascade should handle saving profile if user is saved, 
        // but specific implementation details in User.ts might vary.
        // User.ts has: @OneToOne(() => UserProfile, profile => profile.user, { cascade: true })
        user.profile = profile;

        await userRepository.save(user);

        console.log('User created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Status:', user.status);
        console.log('Verified:', user.emailVerified);

    } catch (error) {
        console.error('Error seeding user:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

seedUser();

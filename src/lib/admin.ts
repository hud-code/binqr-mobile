// Admin utilities for testing features
import { AuthUser, Profile } from './types';

// Admin email address - only this user can see admin features
const ADMIN_EMAIL = 'zahudson95@gmail.com';

/**
 * Check if the current user is an admin
 */
export function isAdmin(user: AuthUser | null, profile: Profile | null): boolean {
  return user?.email === ADMIN_EMAIL || profile?.email === ADMIN_EMAIL;
}

/**
 * Mock authentication service for testing login scenarios
 */
export class MockAuthService {
  private static readonly TEST_ACCOUNTS = {
    'test@user.com': {
      password: 'test1234',
      profile: {
        id: 'mock-test-user-id',
        email: 'test@user.com',
        full_name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  };

  /**
   * Simulate login attempt for testing purposes
   */
  static async mockSignIn(email: string, password: string): Promise<{ data?: any; error?: Error }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const testAccount = this.TEST_ACCOUNTS[email as keyof typeof this.TEST_ACCOUNTS];
    
    if (!testAccount) {
      return {
        error: new Error('Invalid login credentials')
      };
    }

    if (testAccount.password !== password) {
      return {
        error: new Error('Invalid login credentials')
      };
    }

    return {
      data: {
        user: {
          id: testAccount.profile.id,
          email: testAccount.profile.email,
          created_at: testAccount.profile.created_at,
          updated_at: testAccount.profile.updated_at,
        },
        profile: testAccount.profile
      }
    };
  }

  /**
   * Get available test accounts for display
   */
  static getTestAccounts() {
    return Object.keys(this.TEST_ACCOUNTS).map(email => ({
      email,
      password: this.TEST_ACCOUNTS[email as keyof typeof this.TEST_ACCOUNTS].password
    }));
  }
}

/**
 * Mock login flow steps for first-time users
 */
export const LOGIN_FLOW_STEPS = [
  {
    id: 1,
    title: "Welcome to BinQR!",
    description: "Let's get you started with organizing your storage boxes using QR codes.",
    icon: "home-outline",
    action: "Next"
  },
  {
    id: 2,
    title: "Create Your First Location",
    description: "Start by creating a location like 'Garage', 'Basement', or 'Storage Room' where you'll place your boxes.",
    icon: "location-outline",
    action: "Create Location"
  },
  {
    id: 3,
    title: "Add Your First Box",
    description: "Create a box entry, add items to it, and generate a QR code to stick on the physical box.",
    icon: "cube-outline",
    action: "Create Box"
  },
  {
    id: 4,
    title: "Scan QR Codes",
    description: "Use the scan feature to quickly find what's in any box by scanning its QR code.",
    icon: "qr-code-outline",
    action: "Try Scanning"
  },
  {
    id: 5,
    title: "Search and Browse",
    description: "Search for items across all your boxes or browse by location to find exactly what you need.",
    icon: "search-outline",
    action: "Start Organizing"
  }
];
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import crypto from 'crypto';

export interface OAuthProfile {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  profileUrl?: string;
  accessToken: string;
  refreshToken?: string;
  raw: any;
}

export interface OAuthConfig {
  google?: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
  github?: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
  linkedin?: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
  twitter?: {
    consumerKey: string;
    consumerSecret: string;
    callbackURL: string;
  };
  facebook?: {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  };
}

export class OAuthService {
  private config: OAuthConfig;
  private userLookup: (profile: OAuthProfile) => Promise<any>;
  private userCreate: (profile: OAuthProfile) => Promise<any>;

  constructor(
    config: OAuthConfig,
    userLookup: (profile: OAuthProfile) => Promise<any>,
    userCreate: (profile: OAuthProfile) => Promise<any>,
  ) {
    this.config = config;
    this.userLookup = userLookup;
    this.userCreate = userCreate;
    this.setupStrategies();
  }

  private setupStrategies(): void {
    // Google OAuth Strategy
    if (this.config.google) {
      passport.use(
        new GoogleStrategy(
          {
            clientID: this.config.google.clientID,
            clientSecret: this.config.google.clientSecret,
            callbackURL: this.config.google.callbackURL,
            scope: ['profile', 'email'],
          },
          this.handleOAuthCallback('google'),
        ),
      );
    }

    // GitHub OAuth Strategy
    if (this.config.github) {
      passport.use(
        new GitHubStrategy(
          {
            clientID: this.config.github.clientID,
            clientSecret: this.config.github.clientSecret,
            callbackURL: this.config.github.callbackURL,
            scope: ['user:email'],
          },
          this.handleOAuthCallback('github'),
        ),
      );
    }

    // LinkedIn OAuth Strategy
    if (this.config.linkedin) {
      passport.use(
        new LinkedInStrategy(
          {
            clientID: this.config.linkedin.clientID,
            clientSecret: this.config.linkedin.clientSecret,
            callbackURL: this.config.linkedin.callbackURL,
            scope: ['r_emailaddress', 'r_liteprofile'],
          },
          this.handleOAuthCallback('linkedin'),
        ),
      );
    }

    // Twitter OAuth Strategy
    if (this.config.twitter) {
      passport.use(
        new TwitterStrategy(
          {
            consumerKey: this.config.twitter.consumerKey,
            consumerSecret: this.config.twitter.consumerSecret,
            callbackURL: this.config.twitter.callbackURL,
            includeEmail: true,
          },
          this.handleOAuthCallback('twitter'),
        ),
      );
    }

    // Facebook OAuth Strategy
    if (this.config.facebook) {
      passport.use(
        new FacebookStrategy(
          {
            clientID: this.config.facebook.clientID,
            clientSecret: this.config.facebook.clientSecret,
            callbackURL: this.config.facebook.callbackURL,
            profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
          },
          this.handleOAuthCallback('facebook'),
        ),
      );
    }

    // Passport serialization
    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        // This should be implemented to fetch user by ID
        const user = await this.userLookup({ providerId: id } as any);
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    });
  }

  private handleOAuthCallback(provider: string) {
    return async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const oauthProfile = this.normalizeProfile(provider, profile, accessToken, refreshToken);

        // Check if user exists
        let user = await this.userLookup(oauthProfile);

        if (!user) {
          // Create new user
          user = await this.userCreate(oauthProfile);
        } else {
          // Update OAuth tokens
          user = await this.updateOAuthTokens(user, oauthProfile);
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    };
  }

  private normalizeProfile(
    provider: string,
    profile: any,
    accessToken: string,
    refreshToken?: string,
  ): OAuthProfile {
    let email = '';
    let firstName = '';
    let lastName = '';
    let avatar = '';
    let profileUrl = '';

    switch (provider) {
      case 'google':
        email = profile.emails?.[0]?.value || '';
        firstName = profile.name?.givenName || '';
        lastName = profile.name?.familyName || '';
        avatar = profile.photos?.[0]?.value || '';
        profileUrl = profile.profileUrl || '';
        break;

      case 'github':
        email = profile.emails?.[0]?.value || '';
        const nameParts = (profile.displayName || '').split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
        avatar = profile.photos?.[0]?.value || '';
        profileUrl = profile.profileUrl || '';
        break;

      case 'linkedin':
        email = profile.emails?.[0]?.value || '';
        firstName = profile.name?.givenName || '';
        lastName = profile.name?.familyName || '';
        avatar = profile.photos?.[0]?.value || '';
        profileUrl = profile.profileUrl || '';
        break;

      case 'twitter':
        email = profile.emails?.[0]?.value || '';
        const twitterNameParts = (profile.displayName || '').split(' ');
        firstName = twitterNameParts[0] || '';
        lastName = twitterNameParts.slice(1).join(' ') || '';
        avatar = profile.photos?.[0]?.value || '';
        profileUrl = `https://twitter.com/${profile.username}`;
        break;

      case 'facebook':
        email = profile.emails?.[0]?.value || '';
        firstName = profile.name?.givenName || '';
        lastName = profile.name?.familyName || '';
        avatar = profile.photos?.[0]?.value || '';
        profileUrl = profile.profileUrl || '';
        break;
    }

    return {
      provider,
      providerId: profile.id,
      email,
      firstName,
      lastName,
      avatar,
      profileUrl,
      accessToken,
      refreshToken,
      raw: profile,
    };
  }

  private async updateOAuthTokens(user: any, profile: OAuthProfile): Promise<any> {
    // This should be implemented to update user's OAuth tokens
    // For now, return the user as-is
    return user;
  }

  /**
   * Generate OAuth state parameter for CSRF protection
   */
  generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify OAuth state parameter
   */
  verifyState(sessionState: string, receivedState: string): boolean {
    return sessionState === receivedState;
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(provider: string, state: string): string {
    const baseUrls = {
      google: 'https://accounts.google.com/oauth/authorize',
      github: 'https://github.com/login/oauth/authorize',
      linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
      twitter: 'https://api.twitter.com/oauth/authenticate',
      facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
    };

    const config = this.config[provider as keyof OAuthConfig];
    if (!config) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }

    const params = new URLSearchParams({
      client_id: 'clientID' in config ? config.clientID : '',
      redirect_uri: config.callbackURL,
      state,
      scope: this.getDefaultScope(provider),
      response_type: 'code',
    });

    return `${baseUrls[provider as keyof typeof baseUrls]}?${params.toString()}`;
  }

  private getDefaultScope(provider: string): string {
    const scopes = {
      google: 'profile email',
      github: 'user:email',
      linkedin: 'r_liteprofile r_emailaddress',
      twitter: '',
      facebook: 'email public_profile',
    };

    return scopes[provider as keyof typeof scopes] || '';
  }

  /**
   * Revoke OAuth access token
   */
  async revokeToken(provider: string, accessToken: string): Promise<boolean> {
    const revokeUrls = {
      google: 'https://oauth2.googleapis.com/revoke',
      github: 'https://api.github.com/applications/{client_id}/token',
      linkedin: 'https://api.linkedin.com/v2/oauth/revoke',
      facebook: 'https://graph.facebook.com/me/permissions',
    };

    try {
      const url = revokeUrls[provider as keyof typeof revokeUrls];
      if (!url) {
        return false;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `token=${accessToken}`,
      });

      return response.ok;
    } catch (error) {
      console.error(`Failed to revoke ${provider} token:`, error);
      return false;
    }
  }

  /**
   * Refresh OAuth access token
   */
  async refreshAccessToken(provider: string, refreshToken: string): Promise<any> {
    const tokenUrls = {
      google: 'https://oauth2.googleapis.com/token',
      github: 'https://github.com/login/oauth/access_token',
      linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
      facebook: 'https://graph.facebook.com/oauth/access_token',
    };

    try {
      const url = tokenUrls[provider as keyof typeof tokenUrls];
      if (!url) {
        throw new Error(`Token refresh not supported for ${provider}`);
      }

      const config = this.config[provider as keyof OAuthConfig];
      if (!config) {
        throw new Error(`OAuth provider ${provider} not configured`);
      }

      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: 'clientID' in config ? config.clientID : '',
        client_secret: 'clientSecret' in config ? config.clientSecret : '',
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to refresh ${provider} token:`, error);
      throw error;
    }
  }
}

// OAuth middleware for protecting routes
export const requireOAuth = (providers: string[] = []) => {
  return (req: any, res: any, next: any) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      });
    }

    // If specific providers are required, check if user has any of them
    if (providers.length > 0) {
      const userProviders = user.oauthProviders || [];
      const hasRequiredProvider = providers.some((provider) => userProviders.includes(provider));

      if (!hasRequiredProvider) {
        return res.status(403).json({
          success: false,
          error: `OAuth authentication required with one of: ${providers.join(', ')}`,
          code: 'OAUTH_REQUIRED',
          availableProviders: providers,
        });
      }
    }

    next();
  };
};

// OAuth account linking middleware
export const linkOAuthAccount = async (req: any, res: any, next: any) => {
  const user = req.user;
  const oauthProfile = req.oauthProfile;

  if (!user || !oauthProfile) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request for account linking',
      code: 'INVALID_LINK_REQUEST',
    });
  }

  try {
    // Check if OAuth account is already linked to another user
    const existingUser = await req.userService.findByOAuthProvider(
      oauthProfile.provider,
      oauthProfile.providerId,
    );

    if (existingUser && existingUser.id !== user.id) {
      return res.status(409).json({
        success: false,
        error: 'This OAuth account is already linked to another user',
        code: 'OAUTH_ACCOUNT_TAKEN',
      });
    }

    // Link the OAuth account
    await req.userService.linkOAuthAccount(user.id, oauthProfile);

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to link OAuth account',
      code: 'OAUTH_LINK_FAILED',
    });
  }
};

// OAuth security utilities
export const oauthUtils = {
  /**
   * Validate OAuth callback parameters
   */
  validateCallback(req: any): { isValid: boolean; error?: string } {
    const { code, state, error } = req.query;

    if (error) {
      return { isValid: false, error: `OAuth error: ${error}` };
    }

    if (!code) {
      return { isValid: false, error: 'Missing authorization code' };
    }

    if (!state) {
      return { isValid: false, error: 'Missing state parameter' };
    }

    const sessionState = req.session?.oauthState;
    if (!sessionState || sessionState !== state) {
      return { isValid: false, error: 'Invalid state parameter' };
    }

    return { isValid: true };
  },

  /**
   * Sanitize OAuth profile data
   */
  sanitizeProfile(profile: OAuthProfile): Partial<OAuthProfile> {
    return {
      provider: profile.provider,
      providerId: profile.providerId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar,
      profileUrl: profile.profileUrl,
      // Exclude sensitive tokens from sanitized profile
    };
  },

  /**
   * Generate secure random state
   */
  generateSecureState(): string {
    return crypto.randomBytes(32).toString('base64url');
  },

  /**
   * Validate email from OAuth provider
   */
  isValidOAuthEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Extract domain from OAuth provider
   */
  getProviderDomain(provider: string): string {
    const domains = {
      google: 'google.com',
      github: 'github.com',
      linkedin: 'linkedin.com',
      twitter: 'twitter.com',
      facebook: 'facebook.com',
    };

    return domains[provider as keyof typeof domains] || 'unknown';
  },
};

export default OAuthService;

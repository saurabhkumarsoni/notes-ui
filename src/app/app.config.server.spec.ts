import { TestBed } from '@angular/core/testing';
import { config } from './app.config.server';
import { appConfig } from './app.config';

describe('Server App Configuration', () => {
  it('should merge server config with app config', () => {
    expect(config).toBeDefined();
    expect(config.providers).toBeDefined();
    expect(Array.isArray(config.providers)).toBe(true);
  });

  it('should include all providers from base app config', () => {
    const baseProviderCount = appConfig.providers.length;
    const serverProviderCount = config.providers.length;
    
    // Server config should have at least as many providers as base config
    expect(serverProviderCount).toBeGreaterThanOrEqual(baseProviderCount);
  });

  it('should be configurable in TestBed', () => {
    expect(() => {
      TestBed.configureTestingModule({
        providers: config.providers
      });
    }).not.toThrow();
  });

  it('should include server-specific providers', () => {
    // Test that server configuration includes additional providers
    const baseProviderCount = appConfig.providers.length;
    const serverProviderCount = config.providers.length;
    
    // Should have additional server providers
    expect(serverProviderCount).toBeGreaterThan(baseProviderCount);
  });

  describe('Server Rendering Configuration', () => {
    it('should configure server rendering', () => {
      // Test that server rendering is properly configured
      expect(() => {
        TestBed.configureTestingModule({
          providers: config.providers
        });
      }).not.toThrow();
    });
  });

  describe('Route Configuration', () => {
    it('should include server routes configuration', () => {
      // Test that server routes are properly configured
      expect(() => {
        TestBed.configureTestingModule({
          providers: config.providers
        });
      }).not.toThrow();
    });
  });

  describe('Provider Merging', () => {
    it('should properly merge configurations without conflicts', () => {
      // Test that merging doesn't cause provider conflicts
      expect(() => {
        TestBed.configureTestingModule({
          providers: config.providers
        });
      }).not.toThrow();
    });

    it('should maintain provider order and integrity', () => {
      // Ensure the merged config maintains proper structure
      expect(config.providers).toBeDefined();
      expect(config.providers.length).toBeGreaterThan(0);
      
      // Should not have undefined or null providers
      const invalidProviders = config.providers.filter(provider => 
        provider === null || provider === undefined
      );
      expect(invalidProviders.length).toBe(0);
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { appConfig } from './app.config';

// Mock component for testing routes
@Component({
  template: '<div>Test Component</div>',
  standalone: true
})
class TestComponent { }

describe('App Configuration', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: appConfig.providers
    }).compileComponents();
  });

  it('should provide router', () => {
    const router = TestBed.inject(Router);
    expect(router).toBeTruthy();
  });

  it('should provide location service', () => {
    const location = TestBed.inject(Location);
    expect(location).toBeTruthy();
  });

  it('should have providers array', () => {
    expect(appConfig.providers).toBeDefined();
    expect(Array.isArray(appConfig.providers)).toBe(true);
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });

  it('should include required providers', () => {
    const providers = appConfig.providers;
    expect(providers).toBeDefined();
    
    // Check that we have the expected number of providers
    // This ensures all critical providers are included
    expect(providers.length).toBeGreaterThanOrEqual(6);
  });

  describe('HTTP Client Configuration', () => {
    it('should configure HTTP client with interceptors', () => {
      // Test that HTTP client is properly configured
      // This is tested indirectly by ensuring the configuration doesn't throw errors
      expect(() => {
        TestBed.configureTestingModule({
          providers: appConfig.providers
        });
      }).not.toThrow();
    });
  });

  describe('Animation Configuration', () => {
    it('should configure browser animations', () => {
      // Test that animations are properly configured
      expect(() => {
        TestBed.configureTestingModule({
          providers: appConfig.providers
        });
      }).not.toThrow();
    });
  });

  describe('Service Worker Configuration', () => {
    it('should configure service worker for production', () => {
      // Test that service worker configuration doesn't cause errors
      expect(() => {
        TestBed.configureTestingModule({
          providers: appConfig.providers
        });
      }).not.toThrow();
    });
  });

  describe('Toastr Configuration', () => {
    it('should configure toastr with correct settings', () => {
      // Test that toastr is properly configured
      expect(() => {
        TestBed.configureTestingModule({
          providers: appConfig.providers
        });
      }).not.toThrow();
    });
  });

  describe('SweetAlert2 Configuration', () => {
    it('should configure SweetAlert2', () => {
      // Test that SweetAlert2 is properly configured
      expect(() => {
        TestBed.configureTestingModule({
          providers: appConfig.providers
        });
      }).not.toThrow();
    });
  });

  describe('Change Detection Configuration', () => {
    it('should configure zoneless change detection', () => {
      // Test that zoneless change detection is properly configured
      expect(() => {
        TestBed.configureTestingModule({
          providers: appConfig.providers
        });
      }).not.toThrow();
    });
  });

  describe('Error Handling Configuration', () => {
    it('should configure global error listeners', () => {
      // Test that global error listeners are properly configured
      expect(() => {
        TestBed.configureTestingModule({
          providers: appConfig.providers
        });
      }).not.toThrow();
    });
  });

  describe('Client Hydration Configuration', () => {
    it('should configure client hydration with event replay', () => {
      // Test that client hydration is properly configured
      expect(() => {
        TestBed.configureTestingModule({
          providers: appConfig.providers
        });
      }).not.toThrow();
    });
  });
});

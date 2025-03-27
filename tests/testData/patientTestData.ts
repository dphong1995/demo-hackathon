/**
 * Test data for patient management tests
 * Centralizes all test data to make tests more maintainable
 */
export const patientTestData = {
  // Sites data
  sites: {
    site1: {
      name: 'Site 1',
      displayName: 'Site 1 (Soc)'
    },
    site2: {
      name: 'Site 2',
      displayName: 'Site 2 (Soc Substudy)'
    }
  },
  
  // Studies data
  studies: {
    lantern: {
      name: 'TEST - LANTERN Study',
      searchTerm: 'LANTERN'
    },
    xuan: {
      name: '3 Xuan Testing',
      searchTerm: 'Xuan'
    }
  },
  
  // Generate a unique email for testing
  generateUniqueEmail: (prefix = 'test.patient') => {
    return `${prefix}.${Date.now()}@example.com`;
  },
  
  // Patient ID patterns for search tests
  patientIdPatterns: {
    site1: '01-',
    site5: '05-'
  },
  
  // Validation messages to check for
  validationMessages: [
    'This field is required',
    'Please fill out this field',
    'Please select a site'
  ]
};

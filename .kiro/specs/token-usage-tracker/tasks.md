# Implementation Plan: Token Usage Tracker

## Overview

This implementation plan breaks down the Token Usage Tracker system into discrete coding tasks. The system will be built incrementally, starting with backend infrastructure, then core business logic, followed by frontend components, and finally integration and testing. Each task builds on previous work to ensure continuous progress with working code at each checkpoint.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create project directories for frontend (React) and backend (Lambda)
  - Initialize package.json with dependencies: React, HeroUI, AWS SDK, fast-check, Jest
  - Configure TypeScript for both frontend and backend
  - Set up build scripts and development environment
  - _Requirements: All requirements (foundational setup)_

- [ ] 2. Implement DynamoDB table schema and utilities
  - [x] 2.1 Define DynamoDB table schema with CloudFormation or CDK
    - Create table with userId as primary key
    - Define attributes: tokenLimit, tokenUsage, lastUpdated
    - Configure on-demand billing mode
    - _Requirements: 8.3, 8.4_
  
  - [x] 2.2 Create DynamoDB client utility functions
    - Write helper functions for get, put, update, scan operations
    - Implement atomic increment operation for token usage
    - Add error handling for DynamoDB exceptions
    - _Requirements: 2.3, 8.1, 8.2_
  
  - [x] 2.3 Write property tests for DynamoDB utilities
    - **Property 6: Concurrent Updates Are Atomic**
    - **Validates: Requirements 2.3, 8.2**

- [ ] 3. Implement Lambda function for user creation
  - [x] 3.1 Create CreateUser Lambda function
    - Validate userId and tokenLimit parameters
    - Check if user already exists
    - Create DynamoDB record with tokenUsage = 0 and current timestamp
    - Return created user data
    - _Requirements: 1.1, 1.4_
  
  - [ ] 3.2 Write property test for user creation
    - **Property 1: User Creation Initializes Correctly**
    - **Validates: Requirements 1.1**
  
  - [ ] 3.3 Write property test for invalid limit rejection
    - **Property 4: Invalid Limits Are Rejected**
    - **Validates: Requirements 1.4**
  
  - [ ] 3.4 Write unit tests for CreateUser edge cases
    - Test duplicate user creation
    - Test missing parameters
    - Test DynamoDB errors
    - _Requirements: 1.1, 1.4_

- [ ] 4. Implement Lambda function for retrieving user data
  - [ ] 4.1 Create GetUserUsage Lambda function
    - Validate userId parameter
    - Query DynamoDB for user record
    - Return user data with all attributes
    - Handle user not found case
    - _Requirements: 1.3, 8.4_
  
  - [ ] 4.2 Write property test for data retrieval
    - **Property 3: User Data Round-Trip Consistency**
    - **Validates: Requirements 1.3, 8.4**
  
  - [ ] 4.3 Write unit tests for GetUserUsage
    - Test user not found scenario
    - Test malformed userId
    - _Requirements: 1.3_

- [ ] 5. Implement Lambda function for updating token limits
  - [ ] 5.1 Create UpdateTokenLimit Lambda function
    - Validate userId and newLimit parameters
    - Ensure newLimit is positive integer
    - Update DynamoDB record with new limit
    - Return updated user data
    - _Requirements: 1.2, 1.4_
  
  - [ ] 5.2 Write property test for limit updates
    - **Property 2: Token Limit Updates Persist**
    - **Validates: Requirements 1.2**
  
  - [ ] 5.3 Write unit tests for UpdateTokenLimit
    - Test updating non-existent user
    - Test invalid limit values
    - _Requirements: 1.2, 1.4_

- [ ] 6. Checkpoint - Ensure user management functions work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement Lambda function for recording token usage
  - [ ] 7.1 Create RecordTokenUsage Lambda function
    - Validate userId and tokensConsumed parameters
    - Use DynamoDB atomic increment to update tokenUsage
    - Update lastUpdated timestamp with current UTC time
    - Calculate and return remaining tokens
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ] 7.2 Write property test for token accumulation
    - **Property 5: Token Usage Accumulates Correctly**
    - **Validates: Requirements 2.2, 5.4**
  
  - [ ] 7.3 Write property test for timestamp validation
    - **Property 7: Usage Updates Include Valid Timestamps**
    - **Validates: Requirements 2.4**
  
  - [ ] 7.4 Write unit tests for RecordTokenUsage
    - Test recording usage for non-existent user
    - Test negative token amounts
    - _Requirements: 2.2_

- [ ] 8. Implement Lambda function for listing all users
  - [ ] 8.1 Create ListAllUsers Lambda function
    - Scan DynamoDB table for all user records
    - Calculate percentage used for each user
    - Return array of user data
    - _Requirements: 4.1_
  
  - [ ] 8.2 Write property test for user list completeness
    - **Property 11: User List Contains All Users**
    - **Validates: Requirements 4.1**
  
  - [ ] 8.3 Write unit tests for ListAllUsers
    - Test with empty database
    - Test with large number of users
    - _Requirements: 4.1_

- [ ] 9. Implement Lambda function for model invocation
  - [ ] 9.1 Create InvokeModel Lambda function
    - Validate userId and prompt parameters
    - Check user's remaining tokens before invocation
    - Reject request if remaining tokens <= 0
    - Invoke AWS Bedrock with Claude Sonnet 4.5
    - Extract token count from response metadata
    - Call RecordTokenUsage to update usage
    - Return model response and updated usage data
    - _Requirements: 5.3, 6.1, 6.2, 6.4_
  
  - [ ] 9.2 Write property test for token extraction
    - **Property 14: Token Count Extraction From Model Response**
    - **Validates: Requirements 5.3**
  
  - [ ] 9.3 Write property test for remaining tokens check
    - **Property 16: Remaining Tokens Checked Before Model Invocation**
    - **Validates: Requirements 6.1**
  
  - [ ] 9.4 Write unit tests for InvokeModel edge cases
    - Test with zero remaining tokens
    - Test with Bedrock API errors
    - Test with invalid prompts
    - _Requirements: 6.2, 9.3, 9.4_

- [ ] 10. Implement API Gateway configuration
  - [ ] 10.1 Define API Gateway REST API with CloudFormation or CDK
    - Create endpoints: GET /users/{userId}, PUT /users/{userId}/limit, POST /users, POST /users/{userId}/usage, POST /invoke, GET /users
    - Configure CORS for frontend access
    - Set up Lambda integrations for each endpoint
    - Configure request/response mappings
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 10.2 Write integration tests for API endpoints
    - Test each endpoint with valid and invalid requests
    - Verify HTTP status codes and response formats
    - _Requirements: 7.6_

- [ ] 11. Checkpoint - Ensure backend API is functional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement request validation middleware
  - [ ] 12.1 Create validation utility for Lambda functions
    - Write validation functions for each request type
    - Validate required fields, data types, and formats
    - Return descriptive error messages for validation failures
    - _Requirements: 7.6, 9.1_
  
  - [ ] 12.2 Write property test for request validation
    - **Property 18: Request Validation Rejects Invalid Formats**
    - **Validates: Requirements 7.6**
  
  - [ ] 12.3 Write property test for error messages
    - **Property 19: Error Responses Include Descriptive Messages**
    - **Validates: Requirements 9.1**

- [ ] 13. Set up React frontend project structure
  - [ ] 13.1 Initialize React application with TypeScript
    - Create React app with TypeScript template
    - Install HeroUI component library
    - Configure routing with React Router
    - Set up API client utility with fetch
    - _Requirements: 10.1, 10.2_
  
  - [ ] 13.2 Create shared TypeScript interfaces
    - Define User, ModelResponse, ApiError interfaces
    - Create types for API request/response payloads
    - _Requirements: All requirements (type safety)_

- [ ] 14. Implement Dashboard component
  - [ ] 14.1 Create Dashboard component with HeroUI
    - Display userId, tokenUsage, tokenLimit
    - Calculate and display remaining tokens
    - Calculate and display usage percentage
    - Implement auto-refresh every 5 seconds
    - Use HeroUI Progress component for visual indicator
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  
  - [ ] 14.2 Write property test for remaining tokens calculation
    - **Property 9: Remaining Tokens Calculated Correctly**
    - **Validates: Requirements 3.3**
  
  - [ ] 14.3 Write property test for percentage calculation
    - **Property 10: Usage Percentage Calculated Correctly**
    - **Validates: Requirements 3.5**
  
  - [ ] 14.4 Write property test for dashboard display
    - **Property 8: Dashboard Displays Required User Data**
    - **Validates: Requirements 3.1, 3.2, 4.2**
  
  - [ ] 14.5 Write unit tests for Dashboard component
    - Test rendering with various user data
    - Test auto-refresh behavior
    - Test loading states
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 15. Implement UserList component
  - [ ] 15.1 Create UserList component with HeroUI Table
    - Fetch all users from API on mount
    - Display user ID, usage, limit, percentage in table
    - Implement sorting by usage, limit, or percentage
    - Handle user selection to show details
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 15.2 Write property test for user sorting
    - **Property 12: User Sorting Works Correctly**
    - **Validates: Requirements 4.4**
  
  - [ ] 15.3 Write property test for user selection
    - **Property 13: User Selection Displays Correct Details**
    - **Validates: Requirements 4.3**
  
  - [ ] 15.4 Write unit tests for UserList component
    - Test with empty user list
    - Test with large user list
    - Test sorting functionality
    - _Requirements: 4.1, 4.2, 4.4_

- [ ] 16. Implement ModelInteraction component
  - [ ] 16.1 Create ModelInteraction component with HeroUI
    - Create textarea for prompt input using HeroUI Input
    - Create submit button using HeroUI Button
    - Display model response in formatted area
    - Display updated token usage after response
    - Show loading state during API request
    - _Requirements: 5.5, 10.5_
  
  - [ ] 16.2 Write property test for response display
    - **Property 15: Model Response and Usage Both Displayed**
    - **Validates: Requirements 5.5**
  
  - [ ] 16.3 Write property test for loading states
    - **Property 21: Loading States Shown During API Requests**
    - **Validates: Requirements 10.5**
  
  - [ ] 16.4 Write unit tests for ModelInteraction component
    - Test prompt submission
    - Test error handling
    - Test loading state transitions
    - _Requirements: 5.5, 10.5_

- [ ] 17. Implement LimitManager component
  - [ ] 17.1 Create LimitManager component for administrators
    - Create form with userId and newLimit inputs using HeroUI
    - Validate limit is positive integer before submission
    - Call API to update user limit
    - Display success or error message
    - _Requirements: 1.2, 1.4_
  
  - [ ] 17.2 Write unit tests for LimitManager component
    - Test limit validation
    - Test successful update
    - Test error handling
    - _Requirements: 1.2, 1.4_

- [ ] 18. Implement error handling in frontend
  - [ ] 18.1 Create error display utilities
    - Create ErrorMessage component using HeroUI Alert
    - Implement toast notification system for transient errors
    - Create modal for critical errors (limit exceeded)
    - _Requirements: 9.2, 9.5_
  
  - [ ] 18.2 Write property test for error display
    - **Property 20: Error Messages Displayed to Users**
    - **Validates: Requirements 9.2**
  
  - [ ] 18.3 Write unit tests for error handling
    - Test error message display
    - Test toast notifications
    - Test modal display for critical errors
    - _Requirements: 9.2, 9.5_

- [ ] 19. Implement API client with error handling
  - [ ] 19.1 Create API client utility functions
    - Write functions for each API endpoint
    - Implement retry logic for transient failures
    - Parse and format error responses
    - Handle network errors
    - _Requirements: 9.1, 9.2_
  
  - [ ] 19.2 Write unit tests for API client
    - Test successful requests
    - Test error handling
    - Test retry logic
    - _Requirements: 9.1, 9.2_

- [ ] 20. Checkpoint - Ensure frontend components work independently
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 21. Implement routing and navigation
  - [ ] 21.1 Set up React Router with navigation
    - Create routes for Dashboard, UserList, ModelInteraction, LimitManager
    - Create navigation menu using HeroUI Navbar
    - Implement route guards if needed
    - _Requirements: 10.4_
  
  - [ ] 21.2 Write integration tests for navigation
    - Test navigation between views
    - Test route rendering
    - _Requirements: 10.4_

- [ ] 22. Implement limit enforcement warning UI
  - [ ] 22.1 Add warning display when limit reached
    - Check remaining tokens in Dashboard
    - Display warning message using HeroUI Alert when tokens <= 0
    - Disable model interaction when limit reached
    - _Requirements: 6.3, 9.5_
  
  - [ ] 22.2 Write unit tests for limit warning
    - Test warning display at limit
    - Test warning display below limit
    - Test interaction disabling
    - _Requirements: 6.3, 9.5_

- [ ] 23. Implement API response validation
  - [ ] 23.1 Add validation for API responses in frontend
    - Validate response structure matches expected format
    - Check for required fields (remainingTokens in responses)
    - Handle malformed responses gracefully
    - _Requirements: 6.4_
  
  - [ ] 23.2 Write property test for API response validation
    - **Property 17: API Responses Include Remaining Tokens**
    - **Validates: Requirements 6.4**

- [ ] 24. Wire frontend and backend together
  - [ ] 24.1 Configure API endpoint URLs in frontend
    - Set API Gateway URL in environment variables
    - Configure CORS in API Gateway for frontend domain
    - Test end-to-end flow from UI to backend
    - _Requirements: All requirements (integration)_
  
  - [ ] 24.2 Write end-to-end integration tests
    - Test complete user creation flow
    - Test complete model interaction flow
    - Test limit update flow
    - Test error scenarios end-to-end
    - _Requirements: All requirements_

- [ ] 25. Final checkpoint - Ensure all tests pass and system works end-to-end
  - Run all unit tests and property tests
  - Run integration tests
  - Verify all requirements are met
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples, edge cases, and error conditions
- The implementation follows a backend-first approach to establish data layer before UI
- Frontend components are built independently before integration
- Final integration ensures all components work together correctly

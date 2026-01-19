import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

interface AuthProps {
  children: React.ReactNode;
}

export const Auth: React.FC<AuthProps> = ({ children }) => {
  return (
    <Authenticator
      loginMechanisms={['email']}
      signUpAttributes={['email']}
      formFields={{
        signUp: {
          email: {
            order: 1,
            placeholder: 'Enter your email',
            isRequired: true,
            label: 'Email'
          },
          password: {
            order: 2,
            placeholder: 'Enter your password',
            isRequired: true,
            label: 'Password'
          },
          confirm_password: {
            order: 3,
            placeholder: 'Confirm your password',
            isRequired: true,
            label: 'Confirm Password'
          }
        },
        signIn: {
          username: {
            placeholder: 'Enter your email',
            isRequired: true,
            label: 'Email'
          }
        }
      }}
      components={{
        Header() {
          return (
            <div className="text-center py-6">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Token Usage Tracker</h1>
              <p className="text-sm text-gray-500 mt-2">Sign in to monitor your token usage</p>
            </div>
          );
        }
      }}
    >
      {children}
    </Authenticator>
  );
};

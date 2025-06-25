import React, { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { LoginFormData, RegisterFormData } from '../types/user';
import { GoogleCredentialResponse } from '../types/google';
import {
  MDBContainer,
  MDBTabs,
  MDBTabsItem,
  MDBTabsLink,
  MDBTabsContent,
  MDBTabsPane,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBCheckbox
} from 'mdb-react-ui-kit';

const Login: React.FC = () => {
  const [justifyActive, setJustifyActive] = useState<'tab1' | 'tab2'>('tab1');

  const handleJustifyClick = (value: 'tab1' | 'tab2'): void => {
    if (value === justifyActive) return;
    setJustifyActive(value);
  };

  // Handle Google credential response
  const handleGoogleResponse = useCallback(async (response: GoogleCredentialResponse): Promise<void> => {
    try {
      await authService.googleAuth(response.credential);
      window.location.href = '/';
    } catch (error) {
      console.error('Google authentication failed:', error);
      alert('Google Sign-In failed. Please try again.');
    }
  }, []);

  // Initialize Google Identity Services
  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: '1075791096679-iskhac1e0001ke723siu253p5pf1qkas.apps.googleusercontent.com',
          callback: handleGoogleResponse
        });
        console.log('Google Identity Services initialized');
      } else {
        // Wait for Google script to load
        setTimeout(initializeGoogleAuth, 100);
      }
    };
    
    initializeGoogleAuth();
  }, [handleGoogleResponse]);

  // Handle Login Form Submit
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const loginData: LoginFormData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };
    
    try {
      await authService.login(loginData.email, loginData.password);
      window.location.href = '/'; // Redirect to home
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  // Handle Register Form Submit
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const registerData: RegisterFormData = {
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string
    };
    
    try {
      await authService.register(registerData.username, registerData.email, registerData.password);
      window.location.href = '/'; // Redirect to home
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  // Handle Google Sign-In button click
  const handleGoogleSignIn = (): void => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      console.error('Google Identity Services not available:', window.google);
      alert('Google Identity Services not loaded. Please refresh the page.');
    }
  };

  console.log("Rendering Login component");
  console.log("justifyActive is", justifyActive);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      <MDBContainer className="p-4 d-flex flex-column align-items-center w-100" style={{ maxWidth: 600, marginTop: 64, marginBottom: 32 }}>
        <MDBTabs pills justify className='mb-4 d-flex flex-row justify-content-between w-100' style={{maxWidth: 400}}>
          <MDBTabsItem>
            <MDBTabsLink onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'}>
              Login
            </MDBTabsLink>
          </MDBTabsItem>
          <MDBTabsItem>
            <MDBTabsLink onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'}>
              Register
            </MDBTabsLink>
          </MDBTabsItem>
        </MDBTabs>

        <MDBTabsContent className='w-100' style={{maxWidth: 400}}>

        <MDBTabsPane open={justifyActive === 'tab1'}>
          <div className="text-center mb-3">
            <p>Sign in with:</p>
            <div className='d-flex justify-content-between mx-auto mb-3' style={{width: '100%', maxWidth: 400}}>
              <MDBBtn tag='a' color='none' className='m-1 flex-fill' style={{ color: '#000000', minWidth: 0 }}>
                <MDBIcon fab icon='facebook-f' size="sm"/>
              </MDBBtn>
              <MDBBtn tag='a' color='none' className='m-1 flex-fill' style={{ color: '#000000', minWidth: 0 }}>
                <MDBIcon fab icon='twitter' size="sm"/>
              </MDBBtn>
              <MDBBtn color='none' className='m-1 flex-fill' style={{ color: '#000000', minWidth: 0 }} onClick={handleGoogleSignIn}>
                <MDBIcon fab icon='google' size="sm"/>
              </MDBBtn>
              <MDBBtn tag='a' color='none' className='m-1 flex-fill' style={{ color: '#000000', minWidth: 0 }}>
                <MDBIcon fab icon='github' size="sm"/>
              </MDBBtn>
            </div>
            <p className="text-center mt-3">or:</p>
          </div>

          <form onSubmit={handleLoginSubmit}>
            <MDBInput wrapperClass='mb-4' label='Email address' id='login-email' name='email' type='email' style={{ minWidth: 0, width: '100%', maxWidth: 400, fontSize: '1rem', height: '48px' }} autoComplete='email'/>
            <MDBInput wrapperClass='mb-4' label='Password' id='login-password' name='password' type='password' style={{ minWidth: 0, width: '100%', maxWidth: 400, fontSize: '1rem', height: '48px' }} autoComplete='current-password'/>
            <div className="d-flex justify-content-between mx-4 mb-4" style={{maxWidth: 400, width: '100%'}}>
              <MDBCheckbox name='login-remember' id='login-remember' label='Remember me' />
              <a href="!#">Forgot password?</a>
            </div>
            <MDBBtn type="submit" className="mthb-4 w-100" style={{maxWidth: 400}}>Sign in</MDBBtn>
          </form>
          <p className="text-center">Not a member? <a href="#!" onClick={() => setJustifyActive('tab2')}>Register</a></p>
        </MDBTabsPane>

        <MDBTabsPane open={justifyActive === 'tab2'}>
          <div className="text-center mb-3">
            <p>Sign in with:</p>
            <div className='d-flex justify-content-between mx-auto mb-3' style={{width: '100%', maxWidth: 400}}>
              <MDBBtn tag='a' color='none' className='m-1 flex-fill' style={{ color: '#111111', minWidth: 0 }}>
                <MDBIcon fab icon='facebook-f' size="sm"/>
              </MDBBtn>
              <MDBBtn tag='a' color='none' className='m-1 flex-fill' style={{ color: '#111111', minWidth: 0 }}>
                <MDBIcon fab icon='twitter' size="sm"/>
              </MDBBtn>
              <MDBBtn color='none' className='m-1 flex-fill' style={{ color: '#111111', minWidth: 0 }} onClick={handleGoogleSignIn}>
                <MDBIcon fab icon='google' size="sm"/>
              </MDBBtn>
              <MDBBtn tag='a' color='none' className='m-1 flex-fill' style={{ color: '#111111', minWidth: 0 }}>
                <MDBIcon fab icon='github' size="sm"/>
              </MDBBtn>
            </div>
            <p className="text-center mt-3">or:</p>
          </div>

          <form onSubmit={handleRegisterSubmit}>
            <MDBInput wrapperClass='mb-4' label='Name' id='register-name' name='name' type='text' style={{ minWidth: 0, width: '100%', maxWidth: 400, fontSize: '1rem', height: '48px' }} autoComplete='name'/>
            <MDBInput wrapperClass='mb-4' label='Username' id='register-username' name='username' type='text' style={{ minWidth: 0, width: '100%', maxWidth: 400, fontSize: '1rem', height: '48px' }} autoComplete='username'/>
            <MDBInput wrapperClass='mb-4' label='Email' id='register-email' name='email' type='email' style={{ minWidth: 0, width: '100%', maxWidth: 400, fontSize: '1rem', height: '48px' }} autoComplete='email'/>
            <MDBInput wrapperClass='mb-4' label='Password' id='register-password' name='password' type='password' style={{ minWidth: 0, width: '100%', maxWidth: 400, fontSize: '1rem', height: '48px' }} autoComplete='new-password'/>
            <div className='d-flex justify-content-center mb-4' style={{maxWidth: 400, width: '100%'}}>
              <MDBCheckbox name='register-terms' id='register-terms' label='I have read and agree to the terms' />
            </div>
            <MDBBtn type="submit" className="mb-4 w-100" style={{maxWidth: 400}}>Sign up</MDBBtn>
          </form>
          <p className="text-center">Already have an account? <a href="#!" onClick={() => setJustifyActive('tab1')}>Login</a></p>
        </MDBTabsPane>

       
        </MDBTabsContent>

      </MDBContainer>
    </div>
  );
};

export default Login; 
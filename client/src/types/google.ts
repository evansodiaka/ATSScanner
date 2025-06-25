// Google Identity Services types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
        };
      };
    };
  }
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'sign_in_with' | 'sign_up_with' | 'continue_with' | 'sign_in';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

export type { GoogleCredentialResponse, GoogleInitConfig, GoogleButtonConfig }; 
import React from 'react';
import { KindeProvider as KindeAuthProvider } from '@kinde-oss/kinde-auth-react';

const KindeProvider = ({ children }) => {
  return (
    <KindeAuthProvider
      clientId="53b60658500b437aa9e747a0787196ec" // Replace with new SPA Client ID if needed
      domain="https://onecaredesk.kinde.com"
      redirectUri={window.location.origin}
      logoutUri={window.location.origin}
      isDangerouslyUseLocalStorage={true}
      scope="openid profile email"
    >
      {children}
    </KindeAuthProvider>
  );
};

export default KindeProvider;

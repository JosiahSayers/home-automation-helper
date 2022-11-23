import { firebaseAuth } from '../authentication/firebase-admin';
import { environment } from '../environment';

const baseUrl = 'https://identitytoolkit.googleapis.com/v1/accounts';

interface BaseAuthResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

interface SignInResponse extends BaseAuthResponse {
  registered: boolean;
}

export const signInAs = async (
  email = 'test@test.com',
  password = 'password'
) => {
  if (environment.isProduction()) {
    return null;
  }

  const res = await fetch(
    `${baseUrl}:signInWithPassword?key=${environment.firebaseTestingKey()}`,
    {
      method: 'post',
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  );
  if (res.ok) {
    const data: SignInResponse = await res.json();
    return data.idToken;
  }
  console.log(res);
  return null;
};

export const signUp = async (email: string, password: string) => {
  if (environment.isProduction()) {
    return null;
  }

  const res = await fetch (`${baseUrl}:signUp?key=${environment.firebaseTestingKey()}`, {
    method: 'post',
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    })
  });

  if (res.ok) {
    const data: BaseAuthResponse = await res.json();
    return data.idToken;
  }
  console.log(res);
  return null;
};

export const deleteUser = async (id: string) => {
  if (environment.isProduction()) {
    return null;
  }
  await firebaseAuth.deleteUser(id);
};

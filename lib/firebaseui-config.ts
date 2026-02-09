import { auth } from './firebase';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import {
    GoogleAuthProvider,
    EmailAuthProvider,
    isSignInWithEmailLink,
    sendSignInLinkToEmail,
    signInWithEmailLink
} from 'firebase/auth';

// FirebaseUI configuration
export const uiConfig: firebaseui.auth.Config = {
    signInFlow: 'popup',
    signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
        {
            provider: EmailAuthProvider.PROVIDER_ID,
            signInMethod: EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
            requireDisplayName: true,
        },
    ],
    callbacks: {
        signInSuccessWithAuthResult: () => {
            return false; // Avoid redirect
        },
    },
    tosUrl: '/terms',
    privacyPolicyUrl: '/privacy',
};

// Email link sign-in helpers
export const sendEmailLink = async (email: string) => {
    const actionCodeSettings = {
        url: `${window.location.origin}/auth/verify`,
        handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
};

export const verifyEmailLink = async () => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }

        if (email) {
            const result = await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            return result;
        }
    }
    return null;
};

export default uiConfig;

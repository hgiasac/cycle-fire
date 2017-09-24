import * as firebase from 'firebase';
import { Stream } from 'xstream';
export declare enum ActionType {
    ApplyActionCode = 0,
    CheckActionCode = 1,
    ConfirmPasswordReset = 2,
    CreateUser = 3,
    CreateUserWithEmailAndPassword = 4,
    GoOffline = 5,
    GoOnline = 6,
    Push = 7,
    Remove = 8,
    SendPasswordResetEmail = 9,
    Set = 10,
    SetPriority = 11,
    SetWithPriority = 12,
    SignInAndRetrieveDataWithCredential = 13,
    SignInAnonymously = 14,
    SignInWithCredential = 15,
    SignInWithCustomToken = 16,
    SignInWithEmailAndPassword = 17,
    SignInWithPhoneNumber = 18,
    SignInWithPopup = 19,
    SignInWithRedirect = 20,
    SignOut = 21,
    Transaction = 22,
    Update = 23,
    UpdateEmail = 24,
    UpdatePassword = 25,
    UpdateProfile = 26,
    VerifyPasswordResetCode = 27,
}
export interface IFirebaseAction {
    as: (name: string) => IFirebaseAction;
    type: ActionType;
    [propName: string]: any;
}
export declare type ActionHandler = ((action: IFirebaseAction) => Stream<any>);
export declare type UpdateFn = ((value: any) => any);
export declare function makeActionHandler(app: firebase.app.App): ActionHandler;
export interface IUpdateProfileForm {
    displayName?: string;
    photoURL?: string;
}
export interface ICreateUserForm extends IUpdateProfileForm {
    email: string;
    password: string;
}
export declare const firebaseActions: {
    auth: {
        applyActionCode: (code: string) => IFirebaseAction;
        checkActionCode: (code: string) => IFirebaseAction;
        confirmPasswordReset: (code: string, newPassword: string) => IFirebaseAction;
        createUser: (form: ICreateUserForm) => IFirebaseAction;
        createUserWithEmailAndPassword: (email: string, password: string) => IFirebaseAction;
        sendPasswordResetEmail: (email: string) => IFirebaseAction;
        signInAndRetrieveDataWithCredential: (credential: firebase.auth.AuthCredential) => IFirebaseAction;
        signInAnonymously: () => IFirebaseAction;
        signInWithCredential: (credential: firebase.auth.AuthCredential) => IFirebaseAction;
        signInWithCustomToken: (token: string) => IFirebaseAction;
        signInWithEmailAndPassword: (email: string, password: string) => IFirebaseAction;
        signInWithPhoneNumber: (phoneNumber: string, verifier: firebase.auth.ApplicationVerifier) => IFirebaseAction;
        signInWithPopup: (provider: firebase.auth.AuthProvider) => IFirebaseAction;
        signInWithRedirect: (provider: firebase.auth.AuthProvider) => IFirebaseAction;
        signOut: () => IFirebaseAction;
        updateProfile: (form: IUpdateProfileForm) => IFirebaseAction;
        updateEmail: (email: string) => IFirebaseAction;
        updatePassword: (password: string) => IFirebaseAction;
        verifyPasswordResetCode: (code: string) => IFirebaseAction;
    };
    database: {
        goOffline: () => IFirebaseAction;
        goOnline: () => IFirebaseAction;
        ref: (refPath: string) => {
            push: (value: any) => IFirebaseAction;
            remove: () => IFirebaseAction;
            set: (value: any) => IFirebaseAction;
            setPriority: (priority: string | number) => IFirebaseAction;
            setWithPriority: (value: any, priority: string | number) => IFirebaseAction;
            transaction: (updateFn: (value: any) => any) => IFirebaseAction;
            update: (values: any) => IFirebaseAction;
        };
    };
};

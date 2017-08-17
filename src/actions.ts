import * as firebase from 'firebase';
import { Stream } from 'xstream';

export enum ActionType {
  ApplyActionCode,
  CheckActionCode,
  ConfirmPasswordReset,
  CreateUser,
  CreateUserWithEmailAndPassword,
  GoOffline,
  GoOnline,
  Push,
  Remove,
  SendPasswordResetEmail,
  Set,
  SetPriority,
  SetWithPriority,
  SignInAndRetrieveDataWithCredential,
  SignInAnonymously,
  SignInWithCredential,
  SignInWithCustomToken,
  SignInWithEmailAndPassword,
  SignInWithPhoneNumber,
  SignInWithPopup,
  SignInWithRedirect,
  SignOut,
  Transaction,
  Update,
  UpdateEmail,
  UpdatePassword,
  UpdateProfile,
  VerifyPasswordResetCode
}

type Priority = (string | null | number);

export interface IFirebaseAction {
  as: (name: string) => IFirebaseAction;
  type: ActionType;
  [propName: string]: any;
}

export type ActionHandler = ((action: IFirebaseAction) => Stream<any>);

export type UpdateFn = ((value: any) => any);

function Action(type: ActionType, props: object = {}): IFirebaseAction {
  return (<IFirebaseAction> <any> {
    type,
    as: (name: string) => Action(type, {
      ...props,
      name,
    }),
    ...props,
  });
}

export function makeActionHandler(app: firebase.app.App): ActionHandler {
  const auth = app.auth();
  const db = app.database();

  function handleAction(action: IFirebaseAction): Stream<any> {
    switch (action.type) {
    case ActionType.ApplyActionCode:
      return Stream.fromPromise(auth.applyActionCode(action.code));
    case ActionType.CheckActionCode:
      return Stream.fromPromise(auth.checkActionCode(action.code));
    case ActionType.ConfirmPasswordReset:
      return Stream.fromPromise(
        auth.confirmPasswordReset(action.code, action.newPassword)
      );

    case ActionType.CreateUser:
      return Stream.fromPromise(
        auth.createUserWithEmailAndPassword(action.email, action.password)
          .then((user: firebase.User) => user.updateProfile({
            displayName: action.displayName,
            photoURL: action.photoURL,
          }))
      );

    case ActionType.UpdateEmail:
      return Stream.fromPromise(
        auth.currentUser.updateEmail(<any> action.email)
      );

    case ActionType.UpdatePassword:
      return Stream.fromPromise(
        auth.currentUser.updatePassword(<any> action.password)
      );

    case ActionType.UpdateProfile:
      return Stream.fromPromise(
        auth.currentUser.updateProfile(<any> action)
      );

    case ActionType.CreateUserWithEmailAndPassword:
      return Stream.fromPromise(
        auth.createUserWithEmailAndPassword(action.email, action.password)
      );
    case ActionType.GoOffline:
      return Stream.fromPromise(db.goOffline());
    case ActionType.GoOnline:
      return Stream.fromPromise(db.goOnline());
    case ActionType.Push:
      return Stream.fromPromise(db.ref(action.refPath).push(action.value));
    case ActionType.Remove:
      return Stream.fromPromise(db.ref(action.refPath).remove());
    case ActionType.SendPasswordResetEmail:
      return Stream.fromPromise(auth.sendPasswordResetEmail(action.email));
    case ActionType.Set:
      return Stream.fromPromise(db.ref(action.refPath).set(action.value));
    case ActionType.SetPriority:
      return Stream.fromPromise(
          db.ref(action.refPath).setPriority(action.priority, () => { return; })
        );
    case ActionType.SetWithPriority:
      return Stream.fromPromise(
          db.ref(action.refPath).setWithPriority(action.value, action.priority)
        );
    case ActionType.SignInAndRetrieveDataWithCredential:
      return Stream.fromPromise(
          auth.signInAndRetrieveDataWithCredential(action.credential)
        );
    case ActionType.SignInAnonymously:
      return Stream.fromPromise(auth.signInAnonymously());
    case ActionType.SignInWithCredential:
      return Stream.fromPromise(auth.signInWithCredential(action.credential));
    case ActionType.SignInWithCustomToken:
      return Stream.fromPromise(auth.signInWithCustomToken(action.token));
    case ActionType.SignInWithEmailAndPassword:
      return Stream.fromPromise(
          auth.signInWithEmailAndPassword(action.email, action.password)
        );
    case ActionType.SignInWithPhoneNumber:
      return Stream.fromPromise(
          auth.signInWithPhoneNumber(action.phoneNumber, action.verifier)
        );
    case ActionType.SignInWithPopup:
      return Stream.fromPromise(auth.signInWithPopup(action.provider));
    case ActionType.SignInWithRedirect:
      return Stream.fromPromise(auth.signInWithRedirect(action.provider));
    case ActionType.SignOut:
      return Stream.fromPromise(auth.signOut());
    case ActionType.Transaction:
      return Stream.fromPromise(
          db.ref(action.refPath).transaction(action.updateFn)
        );
    case ActionType.Update:
      return Stream.fromPromise(db.ref(action.refPath).update(action.values));
    case ActionType.VerifyPasswordResetCode:
      return Stream.fromPromise(auth.verifyPasswordResetCode(action.code));
    default:
      return Stream.empty();
    }
  }

  return handleAction;
}

export interface IUpdateProfileForm {
  displayName?: string;
  photoURL?: string;
}

export interface ICreateUserForm extends IUpdateProfileForm {
  email: string;
  password: string;
}

export const firebaseActions = {
  auth: {
    applyActionCode: (code: string) =>
      Action(ActionType.ApplyActionCode, { code }),

    checkActionCode: (code: string) =>
      Action(ActionType.CheckActionCode, { code }),

    confirmPasswordReset: (code: string, newPassword: string) =>
      Action(ActionType.ConfirmPasswordReset, { code, newPassword }),

    createUser: (form: ICreateUserForm) =>
      Action(ActionType.CreateUser, form),

    createUserWithEmailAndPassword: (email: string, password: string) =>
      Action(ActionType.CreateUserWithEmailAndPassword, { email, password }),

    sendPasswordResetEmail: (email: string) =>
      Action(ActionType.SendPasswordResetEmail, { email }),

    signInAndRetrieveDataWithCredential: (
      credential: firebase.auth.AuthCredential
    ) => Action(ActionType.SignInAndRetrieveDataWithCredential, { credential }),

    signInAnonymously: () => Action(ActionType.SignInAnonymously),

    signInWithCredential: (credential: firebase.auth.AuthCredential) =>
      Action(ActionType.SignInWithCredential, { credential }),

    signInWithCustomToken: (token: string) =>
      Action(ActionType.SignInWithCustomToken, { token }),

    signInWithEmailAndPassword: (email: string, password: string) =>
      Action(ActionType.SignInWithEmailAndPassword, { email, password }),

    signInWithPhoneNumber: (
      phoneNumber: string,
      verifier: firebase.auth.ApplicationVerifier
    ) => Action(ActionType.SignInWithPhoneNumber, { phoneNumber, verifier }),

    signInWithPopup: (provider: firebase.auth.AuthProvider) =>
      Action(ActionType.SignInWithPopup, { provider }),

    signInWithRedirect: (provider: firebase.auth.AuthProvider) =>
      Action(ActionType.SignInWithRedirect, { provider }),

    signOut: () => Action(ActionType.SignOut),

    updateProfile: (form: IUpdateProfileForm) =>
      Action(ActionType.UpdateProfile, form),

    updateEmail: (email: string) =>
      Action(ActionType.UpdateEmail, { email }),

    updatePassword: (password: string) =>
      Action(ActionType.UpdatePassword, { password }),

    verifyPasswordResetCode: (code: string) =>
      Action(ActionType.VerifyPasswordResetCode, { code })
  },
  database: {
    goOffline: () => Action(ActionType.GoOffline),

    goOnline: () => Action(ActionType.GoOnline),

    ref: (refPath: string) => ({
      push: (value: any) => Action(ActionType.Push, { refPath, value }),

      remove: () => Action(ActionType.Remove, { refPath }),

      set: (value: any) => Action(ActionType.Set, { refPath, value }),

      setPriority: (priority: Priority) =>
        Action(ActionType.SetPriority, { priority, refPath }),

      setWithPriority: (value: any, priority: Priority) =>
        Action(ActionType.SetWithPriority, { priority, refPath, value }),

      transaction: (updateFn: UpdateFn) =>
        Action(ActionType.Transaction, { refPath, updateFn }),

      update: (values: any) =>
        Action(ActionType.Update, { refPath, values })
    })
  }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xstream_1 = require("xstream");
var ActionType;
(function (ActionType) {
    ActionType[ActionType["ApplyActionCode"] = 0] = "ApplyActionCode";
    ActionType[ActionType["CheckActionCode"] = 1] = "CheckActionCode";
    ActionType[ActionType["ConfirmPasswordReset"] = 2] = "ConfirmPasswordReset";
    ActionType[ActionType["CreateUser"] = 3] = "CreateUser";
    ActionType[ActionType["CreateUserWithEmailAndPassword"] = 4] = "CreateUserWithEmailAndPassword";
    ActionType[ActionType["GoOffline"] = 5] = "GoOffline";
    ActionType[ActionType["GoOnline"] = 6] = "GoOnline";
    ActionType[ActionType["Push"] = 7] = "Push";
    ActionType[ActionType["Remove"] = 8] = "Remove";
    ActionType[ActionType["SendPasswordResetEmail"] = 9] = "SendPasswordResetEmail";
    ActionType[ActionType["Set"] = 10] = "Set";
    ActionType[ActionType["SetPriority"] = 11] = "SetPriority";
    ActionType[ActionType["SetWithPriority"] = 12] = "SetWithPriority";
    ActionType[ActionType["SignInAndRetrieveDataWithCredential"] = 13] = "SignInAndRetrieveDataWithCredential";
    ActionType[ActionType["SignInAnonymously"] = 14] = "SignInAnonymously";
    ActionType[ActionType["SignInWithCredential"] = 15] = "SignInWithCredential";
    ActionType[ActionType["SignInWithCustomToken"] = 16] = "SignInWithCustomToken";
    ActionType[ActionType["SignInWithEmailAndPassword"] = 17] = "SignInWithEmailAndPassword";
    ActionType[ActionType["SignInWithPhoneNumber"] = 18] = "SignInWithPhoneNumber";
    ActionType[ActionType["SignInWithPopup"] = 19] = "SignInWithPopup";
    ActionType[ActionType["SignInWithRedirect"] = 20] = "SignInWithRedirect";
    ActionType[ActionType["SignOut"] = 21] = "SignOut";
    ActionType[ActionType["Transaction"] = 22] = "Transaction";
    ActionType[ActionType["Update"] = 23] = "Update";
    ActionType[ActionType["UpdateEmail"] = 24] = "UpdateEmail";
    ActionType[ActionType["UpdatePassword"] = 25] = "UpdatePassword";
    ActionType[ActionType["UpdateProfile"] = 26] = "UpdateProfile";
    ActionType[ActionType["VerifyPasswordResetCode"] = 27] = "VerifyPasswordResetCode";
})(ActionType = exports.ActionType || (exports.ActionType = {}));
function Action(type, props = {}) {
    return Object.assign({ type, as: (name) => Action(type, Object.assign({}, props, { name })) }, props);
}
function makeActionHandler(app) {
    const auth = app.auth();
    const db = app.database();
    function handleAction(action) {
        switch (action.type) {
            case ActionType.ApplyActionCode:
                return xstream_1.Stream.fromPromise(auth.applyActionCode(action.code));
            case ActionType.CheckActionCode:
                return xstream_1.Stream.fromPromise(auth.checkActionCode(action.code));
            case ActionType.ConfirmPasswordReset:
                return xstream_1.Stream.fromPromise(auth.confirmPasswordReset(action.code, action.newPassword));
            case ActionType.CreateUser:
                return xstream_1.Stream.fromPromise(auth.createUserWithEmailAndPassword(action.email, action.password)
                    .then((user) => user.updateProfile({
                    displayName: action.displayName,
                    photoURL: action.photoURL,
                })));
            case ActionType.UpdateEmail:
                return xstream_1.Stream.fromPromise(auth.currentUser.updateEmail(action.email));
            case ActionType.UpdatePassword:
                return xstream_1.Stream.fromPromise(auth.currentUser.updatePassword(action.password));
            case ActionType.UpdateProfile:
                return xstream_1.Stream.fromPromise(auth.currentUser.updateProfile(action));
            case ActionType.CreateUserWithEmailAndPassword:
                return xstream_1.Stream.fromPromise(auth.createUserWithEmailAndPassword(action.email, action.password));
            case ActionType.GoOffline:
                return xstream_1.Stream.fromPromise(db.goOffline());
            case ActionType.GoOnline:
                return xstream_1.Stream.fromPromise(db.goOnline());
            case ActionType.Push:
                return xstream_1.Stream.fromPromise(db.ref(action.refPath).push(action.value));
            case ActionType.Remove:
                return xstream_1.Stream.fromPromise(db.ref(action.refPath).remove());
            case ActionType.SendPasswordResetEmail:
                return xstream_1.Stream.fromPromise(auth.sendPasswordResetEmail(action.email));
            case ActionType.Set:
                return xstream_1.Stream.fromPromise(db.ref(action.refPath).set(action.value));
            case ActionType.SetPriority:
                return xstream_1.Stream.fromPromise(db.ref(action.refPath).setPriority(action.priority, () => { return; }));
            case ActionType.SetWithPriority:
                return xstream_1.Stream.fromPromise(db.ref(action.refPath).setWithPriority(action.value, action.priority));
            case ActionType.SignInAndRetrieveDataWithCredential:
                return xstream_1.Stream.fromPromise(auth.signInAndRetrieveDataWithCredential(action.credential));
            case ActionType.SignInAnonymously:
                return xstream_1.Stream.fromPromise(auth.signInAnonymously());
            case ActionType.SignInWithCredential:
                return xstream_1.Stream.fromPromise(auth.signInWithCredential(action.credential));
            case ActionType.SignInWithCustomToken:
                return xstream_1.Stream.fromPromise(auth.signInWithCustomToken(action.token));
            case ActionType.SignInWithEmailAndPassword:
                return xstream_1.Stream.fromPromise(auth.signInWithEmailAndPassword(action.email, action.password));
            case ActionType.SignInWithPhoneNumber:
                return xstream_1.Stream.fromPromise(auth.signInWithPhoneNumber(action.phoneNumber, action.verifier));
            case ActionType.SignInWithPopup:
                return xstream_1.Stream.fromPromise(auth.signInWithPopup(action.provider));
            case ActionType.SignInWithRedirect:
                return xstream_1.Stream.fromPromise(auth.signInWithRedirect(action.provider));
            case ActionType.SignOut:
                return xstream_1.Stream.fromPromise(auth.signOut());
            case ActionType.Transaction:
                return xstream_1.Stream.fromPromise(db.ref(action.refPath).transaction(action.updateFn));
            case ActionType.Update:
                return xstream_1.Stream.fromPromise(db.ref(action.refPath).update(action.values));
            case ActionType.VerifyPasswordResetCode:
                return xstream_1.Stream.fromPromise(auth.verifyPasswordResetCode(action.code));
            default:
                return xstream_1.Stream.empty();
        }
    }
    return handleAction;
}
exports.makeActionHandler = makeActionHandler;
exports.firebaseActions = {
    auth: {
        applyActionCode: (code) => Action(ActionType.ApplyActionCode, { code }),
        checkActionCode: (code) => Action(ActionType.CheckActionCode, { code }),
        confirmPasswordReset: (code, newPassword) => Action(ActionType.ConfirmPasswordReset, { code, newPassword }),
        createUser: (form) => Action(ActionType.CreateUser, form),
        createUserWithEmailAndPassword: (email, password) => Action(ActionType.CreateUserWithEmailAndPassword, { email, password }),
        sendPasswordResetEmail: (email) => Action(ActionType.SendPasswordResetEmail, { email }),
        signInAndRetrieveDataWithCredential: (credential) => Action(ActionType.SignInAndRetrieveDataWithCredential, { credential }),
        signInAnonymously: () => Action(ActionType.SignInAnonymously),
        signInWithCredential: (credential) => Action(ActionType.SignInWithCredential, { credential }),
        signInWithCustomToken: (token) => Action(ActionType.SignInWithCustomToken, { token }),
        signInWithEmailAndPassword: (email, password) => Action(ActionType.SignInWithEmailAndPassword, { email, password }),
        signInWithPhoneNumber: (phoneNumber, verifier) => Action(ActionType.SignInWithPhoneNumber, { phoneNumber, verifier }),
        signInWithPopup: (provider) => Action(ActionType.SignInWithPopup, { provider }),
        signInWithRedirect: (provider) => Action(ActionType.SignInWithRedirect, { provider }),
        signOut: () => Action(ActionType.SignOut),
        updateProfile: (form) => Action(ActionType.UpdateProfile, form),
        updateEmail: (email) => Action(ActionType.UpdateEmail, { email }),
        updatePassword: (password) => Action(ActionType.UpdatePassword, { password }),
        verifyPasswordResetCode: (code) => Action(ActionType.VerifyPasswordResetCode, { code })
    },
    database: {
        goOffline: () => Action(ActionType.GoOffline),
        goOnline: () => Action(ActionType.GoOnline),
        ref: (refPath) => ({
            push: (value) => Action(ActionType.Push, { refPath, value }),
            remove: () => Action(ActionType.Remove, { refPath }),
            set: (value) => Action(ActionType.Set, { refPath, value }),
            setPriority: (priority) => Action(ActionType.SetPriority, { priority, refPath }),
            setWithPriority: (value, priority) => Action(ActionType.SetWithPriority, { priority, refPath, value }),
            transaction: (updateFn) => Action(ActionType.Transaction, { refPath, updateFn }),
            update: (values) => Action(ActionType.Update, { refPath, values })
        })
    }
};
//# sourceMappingURL=actions.js.map
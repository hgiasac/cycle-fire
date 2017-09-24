"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase = require("firebase");
require("firebase/app");
require("firebase/auth");
require("firebase/database");
const xstream_1 = require("xstream");
const actions_1 = require("./actions");
function makeFirebaseDriver(config, appName) {
    const app = firebase.initializeApp(config, appName);
    const auth = app.auth();
    const db = app.database();
    const handleAction = actions_1.makeActionHandler(app);
    function firebaseDriver(action$) {
        const response$ = action$
            .map((action) => ({ name: action.name, stream: handleAction(action) }));
        response$.addListener({
            complete: () => { return; },
            error: () => { return; },
            next: () => { return; }
        });
        return {
            auth: {
                authState: xstream_1.Stream.createWithMemory({
                    start: (listener) => {
                        auth.onAuthStateChanged((user) => { listener.next(user); }, (err) => { listener.error(err); }, () => {
                            listener.complete();
                            return null;
                        });
                    },
                    stop: () => { return; }
                }),
                currentUser: xstream_1.Stream.createWithMemory({
                    start: (listener) => {
                        let currentUser = null;
                        auth.onIdTokenChanged((_) => {
                            if (auth.currentUser !== currentUser) {
                                currentUser = auth.currentUser;
                                listener.next(currentUser);
                            }
                        }, (err) => { listener.error(err); }, () => {
                            listener.complete();
                            return null;
                        });
                    },
                    stop: () => { return; }
                }),
                idToken: xstream_1.Stream.createWithMemory({
                    start: (listener) => {
                        auth.onIdTokenChanged((user) => { listener.next(user); }, (err) => { listener.error(err); }, () => {
                            listener.complete();
                            return null;
                        });
                    },
                    stop: () => { return; }
                }),
                providersForEmail: (email) => xstream_1.Stream.createWithMemory({
                    start: (listener) => {
                        auth.fetchProvidersForEmail(email)
                            .catch((err) => { listener.error(err); })
                            .then((providers) => { listener.next(providers); });
                    },
                    stop: () => { return; }
                }),
                redirectResult: xstream_1.Stream.createWithMemory({
                    start: (listener) => {
                        auth.getRedirectResult()
                            .catch((err) => { listener.error(err); })
                            .then((result) => { listener.next(result); });
                    },
                    stop: () => { return; }
                })
            },
            database: {
                ref: (path) => sourceReference(db.ref(path)),
                refFromURL: (url) => sourceReference(db.refFromURL(url))
            },
            responses: (responseName) => (response$
                .filter((response) => response.name === responseName)
                .map((response) => response.stream)
                .flatten())
        };
    }
    return firebaseDriver;
}
exports.makeFirebaseDriver = makeFirebaseDriver;
function makeReferenceEventsCallback(listener) {
    return (snapshot) => {
        if (snapshot !== null) {
            listener.next(snapshot.val());
        }
    };
}
function refEvents(ref) {
    return (eventType) => {
        let callback;
        return xstream_1.Stream.createWithMemory({
            start: (listener) => {
                callback = makeReferenceEventsCallback(listener);
                ref.on(eventType, callback);
            },
            stop: () => {
                ref.off(eventType, callback);
            }
        });
    };
}
function sourceReference(dbRef) {
    const events = refEvents(dbRef);
    return {
        events,
        child: (path) => sourceReference(dbRef.child(path)),
        value: events('value')
    };
}
//# sourceMappingURL=driver.js.map
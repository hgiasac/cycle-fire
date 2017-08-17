import * as firebase from 'firebase';
import 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { Listener, MemoryStream, Stream } from 'xstream';
import { makeActionHandler, IFirebaseAction } from './actions';

export interface IActionResponse {
  name?: string;
  stream: Stream<any>;
}

export interface IFirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  messagingSenderId: string;
  projectId: string;
  storageBucket: string;
}

export interface IReferenceSource {
  child: (path: string) => IReferenceSource;
  events: EventLookup;
  value: MemoryStream<any>;
}

export interface IFirebaseSource {
  auth: {
    authState: MemoryStream<firebase.User | null>
    currentUser: MemoryStream<firebase.User | null>
    idToken: MemoryStream<firebase.User | null>
    providersForEmail: (email: string) => MemoryStream<string[]>
    redirectResult: MemoryStream<firebase.auth.UserCredential>
  };
  database: {
    ref: (path: string) => IReferenceSource
    refFromURL: (url: string) => IReferenceSource
  };
  responses: (name: string) => Stream<any>;
}

export type EventLookup = (eventType: string) => MemoryStream<any>;

export type FirebaseDriver = (action$: Stream<IFirebaseAction>) => IFirebaseSource;

export function makeFirebaseDriver(
  config: IFirebaseConfig,
  appName: string
): FirebaseDriver {
  const app = firebase.initializeApp(config, appName);
  const auth = app.auth();
  const db = app.database();
  const handleAction = makeActionHandler(app);

  function firebaseDriver(action$: Stream<IFirebaseAction>): IFirebaseSource {
    const response$: Stream<IActionResponse> = action$
      .map((action) => ({ name: action.name, stream: handleAction(action) }));

    response$.addListener({
      complete: () => { return; },
      error: () => { return; },
      next: () => { return; }
    });

    return {
      auth: {
        authState: Stream.createWithMemory({
          start: (listener: Listener<firebase.User | null>) => {
            auth.onAuthStateChanged(
              (user: firebase.User) => { listener.next(user); },
              (err) => { listener.error(err); },
              () => {
                listener.complete();

                return null;
              }
            );
          },
          stop: () => { return; }
        }),

        currentUser: Stream.createWithMemory({
          start: (listener: Listener<firebase.User | null>) => {
            let currentUser: (firebase.User | null) = null;
            auth.onIdTokenChanged(
              (_: firebase.User) => {
                if (auth.currentUser !== currentUser) {
                  currentUser = auth.currentUser;
                  listener.next(currentUser);
                }
              },
              (err) => { listener.error(err); },
              () => {
                listener.complete();

                return null;
              }
            );
          },
          stop: () => { return; }
        }),

        idToken: Stream.createWithMemory({
          start: (listener: Listener<firebase.User | null>) => {
            auth.onIdTokenChanged(
              (user: firebase.User) => { listener.next(user); },
              (err) => { listener.error(err); },
              () => {
                listener.complete();

                return null;
              }
            );
          },
          stop: () => { return; }
        }),

        providersForEmail: (email: string) => Stream.createWithMemory({
          start: (listener: Listener<string[]>) => {
            auth.fetchProvidersForEmail(email)
              .catch((err) => { listener.error(err); })
              .then((providers) => { listener.next(providers); });
          },
          stop: () => { return; }
        }),

        redirectResult: Stream.createWithMemory({
          start: (listener: Listener<firebase.auth.UserCredential>) => {
            auth.getRedirectResult()
              .catch((err) => { listener.error(err); })
              .then((result) => { listener.next(result); });
          },
          stop: () => { return; }
        })
      },

      database: {
        ref: (path: string) => sourceReference(db.ref(path)),

        refFromURL: (url: string) => sourceReference(db.refFromURL(url))
      },

      responses: (responseName: string) => (
        response$
          .filter((response) => response.name === responseName)
          .map((response) => response.stream)
          .flatten()
      )
    };

  }

  return firebaseDriver;
}

function makeReferenceEventsCallback(
  listener: Listener<any>
): ((snapshot: firebase.database.DataSnapshot) => void) {
  return (snapshot: firebase.database.DataSnapshot) => {
    if (snapshot !== null) {
      listener.next(snapshot.val());
    }
  };
}

function refEvents(ref: firebase.database.Reference): EventLookup {
  return (eventType: string) => {
    let callback: (
      a: firebase.database.DataSnapshot | null,
      b?: string | undefined
    ) => any;

    return Stream.createWithMemory({
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

function sourceReference(dbRef: firebase.database.Reference): IReferenceSource {
  const events: EventLookup = refEvents(dbRef);

  return {
    events,
    child: (path: string) => sourceReference(dbRef.child(path)),
    value: events('value')
  };
}

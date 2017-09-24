import * as firebase from 'firebase';
import 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import { MemoryStream, Stream } from 'xstream';
import { IFirebaseAction } from './actions';
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
        authState: MemoryStream<firebase.User | null>;
        currentUser: MemoryStream<firebase.User | null>;
        idToken: MemoryStream<firebase.User | null>;
        providersForEmail: (email: string) => MemoryStream<string[]>;
        redirectResult: MemoryStream<firebase.auth.UserCredential>;
    };
    database: {
        ref: (path: string) => IReferenceSource;
        refFromURL: (url: string) => IReferenceSource;
    };
    responses: (name: string) => Stream<any>;
}
export declare type EventLookup = (eventType: string) => MemoryStream<any>;
export declare type FirebaseDriver = (action$: Stream<IFirebaseAction>) => IFirebaseSource;
export declare function makeFirebaseDriver(config: IFirebaseConfig, appName: string): FirebaseDriver;

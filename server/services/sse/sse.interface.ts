export interface ISseClient {
    id: string;
    send: (payload: string) => void;
}

export interface ISseEvent<T, V> {
    kind: T;
    payload: V;
}

import Client from 'ssh2-sftp-client';
import * as console from 'console';

const options:Client.ConnectOptions = {
    host: 'your-host',
    port:22,
    username: 'username',
    password: 'password',
    retries: 3
}

async function main() {
    let run = true;
    while (run) {
        try {
            const successful = await doPoll();
            console.log('Polling successful: ', successful);
        } catch (e){
            console.error('ERROR:',e );
        }
    }
}


async function doPoll() {
    try {
        await using sftp = await createConnection(options); // connect & disconnect
        return true;
    } catch (error: unknown) {
        console.error('Polling-Request failed: ', error);
        return false;
    }
}

async function createConnection(options: Client.ConnectOptions) {
    const sftpClient = new Client('my-client');
    const sftpWrapper = await sftpClient.connect(options);
    if (!sftpWrapper) {
        throw new Error('SFTP connection could not be established!');
    }
    return {
        client: sftpClient,
        [Symbol.asyncDispose]: async () => {
            try {
                await sftpClient?.end();
            } catch (error: unknown) {
                // if there is no SFTP connection available, we have no connection to close anyway, so we only log the other errors
                if (error && typeof error === 'object' && 'message' in error && error.message !== 'end: No SFTP connection available') {
                    console.error(error.message, error);
                }
            }
        }
    };
}

main();
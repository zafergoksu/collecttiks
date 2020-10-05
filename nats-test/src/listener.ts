import nats, { Message } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const stan = nats.connect('collecttiks', randomBytes(4).toString('hex'), {
    url: 'http://localhost:4222',
});

stan.on('connect', () => {
    console.log('Listener connected to NATS');

    stan.on('close', () => {
        console.log('NATS connection closed!');
        process.exit();
    });

    const options = stan.subscriptionOptions().setManualAckMode(true);

    // Create a queue group to handle events in a round robin fashion with messages (events) sent to the same queue group
    // This is to handle concurrency issues with the same message being handle at the same time with different listeners
    const subscription = stan.subscribe(
        'ticket:created',
        'listenerQueueGroup',
        options
    );

    subscription.on('message', (msg: Message) => {
        const data = msg.getData();

        if (typeof data === 'string') {
            console.log(
                `Recieved event #${msg.getSequence()}, with data:${data}`
            );
        }

        // Manually acknowledges the message (event) sent from the publisher as being done
        msg.ack();
    });
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());

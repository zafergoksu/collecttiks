import { OrderStatus } from '@zgoksutickets/common-utils';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import mongoose from 'mongoose';
import Order from './orders';

interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

interface TicketEvent {
    id: string;
    version: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: TicketEvent): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = async (event: TicketEvent) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1,
    });
}

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    const { id, ...rest } = attrs;
    return new Ticket({
        _id: id,
        ...rest,
    });
};

ticketSchema.methods.isReserved = async function () {
    // Find an order that has the same ticket id,
    // if that order has a ticket associated with it and
    // has been created, is awaiting for a payment, or
    // is complete then that ticket is already reserved

    // this === the ticket document that we just called 'isReserved' on
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.CREATED,
                OrderStatus.AWAITING_PAYMENT,
                OrderStatus.COMPLETE,
            ],
        },
    });

    // type conversion
    return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export default Ticket;

import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@zgoksutickets/common-utils';
import { TicketDoc } from './ticket';

interface OrderAttrs {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

// The document that is saved may have attributes than
// the attributes given by a user.
interface OrderDoc extends mongoose.Document {
    version: number;
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            requried: true,
            enum: Object.values(OrderStatus),
            default: OrderStatus.CREATED,
        },
        expiresAt: {
            type: mongoose.Schema.Types.Date,
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
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

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export default Order;

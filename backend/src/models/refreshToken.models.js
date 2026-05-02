import mongoose, { Schema } from 'mongoose';

const refreshTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        index: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true,
    },
    deviceInfo: {
        type: String,
        default: null,
    },
    ipAddress: {
        type: String,
        default: null
    },
    expireAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    },
    isRevoked: {
        type: Boolean,
        default: false,
    },
},{ timestamps: true });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
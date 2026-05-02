import mongoose, { Schema } from 'mongoose'

const memberSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'member'],
        default: 'member',
    },
}, { _id: false }) 

const projectSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: null,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: {
        type: [memberSchema],
        default: [],
    },
}, { timestamps: true })

export const Project = mongoose.model('Project', projectSchema)
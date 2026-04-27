import mongoose from "mongoose";
import doctorModel from "./doctorModel.js";

const appointmentSchema = new mongoose.Schema({

    userId: {type: String , required:true},
    docId: {type: String , required:true},
    slotDate:{type: String, required:true},
    slotTime:{type: String, required:true},
    userData:{type: Object, required:true},
    docData:{type: Object, required:true},
    amount:{type: Number, required:true},
    date:{type: Number, required:true},
    cancelled:{type: Boolean, default: false},
    payment:{type: Boolean, default: false},
    isCompleted:{type: Boolean, default: false},

});

// Post-delete hook to free the booked slot when appointment is deleted
appointmentSchema.post('findOneAndDelete', async function(doc) {
    try {
        if (doc) {
            const appointment = doc;
            const docData = await doctorModel.findById(appointment.docId);
            if (docData && docData.slots_booked) {
                let slots_booked = JSON.parse(JSON.stringify(docData.slots_booked));
                if (slots_booked[appointment.slotDate]) {
                    slots_booked[appointment.slotDate] = slots_booked[appointment.slotDate].filter(
                        slot => slot !== appointment.slotTime
                    );
                    // If no slots left for the date, remove the date key
                    if (slots_booked[appointment.slotDate].length === 0) {
                        delete slots_booked[appointment.slotDate];
                    }
                    docData.slots_booked = slots_booked;
                    await docData.save();
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
});

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema)

export default appointmentModel;

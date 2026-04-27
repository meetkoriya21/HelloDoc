# TODO: Make Doctor Availability Dynamic in Patient Module

## Steps to Complete:
- [x] Modify `doctorList` in `backend/controllers/doctorController.js` to filter doctors by `available: true`
- [x] Update `frontend/src/pages/Doctors.jsx` to conditionally display availability based on `item.available`
- [x] Update `frontend/src/components/TopDoctors.jsx` to conditionally display availability based on `item.available`
- [x] Update `frontend/src/components/RelatedDoctors.jsx` to conditionally display availability based on `item.available`
- [ ] Test the changes by changing availability and checking patient module
